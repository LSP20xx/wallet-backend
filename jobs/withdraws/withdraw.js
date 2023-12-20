/* eslint-disable @typescript-eslint/no-var-requires */
const appRoot = require('app-root-path');
require('dotenv').config({ path: `${appRoot}/config/.env` });
const coins = require(`${appRoot}/config/coins/info`);
const ethers = require('ethers');
const axios = require('axios');
const { Web3 } = require('web3');
const { PrismaClient } = require('@prisma/client');
const { Queue } = require('bullmq');
const { createDecipheriv } = require('crypto');
const bitcoin = require('bitcoinjs-lib');

const bitcoinClient = axios.create({
  baseURL: 'https://go.getblock.io/d3997a11804641bda19e595364934897',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'd3997a11804641bda19e595364934897',
  },
});

const prisma = new PrismaClient();
const ethersWss = new ethers.WebSocketProvider(process.env.ETHEREUM_WSS);
const web3 = new Web3(process.env.ETHEREUM_WSS);

const approveTransactionQueue = new Queue('eth-approve-transactions');

const encryptionKey = process.env.VERIFICATION_ENCRYPTION_KEY;
const algorithm = 'aes-256-cbc';

const decrypt = (encryptedCode) => {
  const [encrypted, ivHex] = encryptedCode.split(':');

  const iv = Buffer.from(ivHex, 'hex');

  const keyBuffer = Buffer.from(encryptionKey, 'hex');

  const decipher = createDecipheriv(algorithm, keyBuffer, iv);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

const setupSigner = () => {
  const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC);

  const wallet = new ethers.Wallet(
    process.env.WITHDRAW_FROM_PRIVATE_KEY,
    provider,
  );

  return wallet;
};

const wallet = setupSigner();

const _updateTransactionState = async (
  transactionId,
  status,
  amount,
  confirmations,
) => {
  console.log('Actualizando estado de transacción', {
    transactionId,
    status,
    amount,
  });

  try {
    console.log(
      'datos a actualizar',
      transactionId,
      status,
      amount,
      confirmations,
    );

    const upsert = {
      status: status,
      ...(confirmations && { confirmations: confirmations }),
      ...(amount && { amount: amount }),
    };

    await prisma.transaction.update({
      where: { id: transactionId },
      data: upsert,
    });
  } catch (error) {
    console.error('Error in _updateTransactionState:', error);
    throw error;
  }
};

const _withdraw = async (transactionId, amount, confirmations) => {
  console.log('Llamada a _withdraw', { transactionId, amount });

  try {
    await _updateTransactionState(
      transactionId,
      'PROCESSED',
      amount,
      confirmations,
    );

    await approveTransactionQueue.add('approve', { transactionId });
    return 'withdraw';
  } catch (error) {
    throw error;
  }
};

const _checkConfirmation = async (
  amount,
  transactionId,
  coin,
  confirmations,
  txHash,
) => {
  try {
    const transactionReceipt = await ethersWss.getTransactionReceipt(txHash);
    if (transactionReceipt && transactionReceipt.status) {
      return await _withdraw(transactionId, amount.toString(), confirmations);
    } else {
      await _updateTransactionState(transactionId, 'CANCELLED', 0, 0);
      throw 'error: not withdrawed. no transaction receipt.';
    }
  } catch (error) {
    console.error('Error in _checkConfirmation:', error);
    throw error;
  }
};

const verifyWithdraw = async (
  amount,
  blockNumber,
  coin,
  transactionId,
  txHash,
) => {
  try {
    let confirmations = 0;

    while (confirmations < 6) {
      await new Promise((resolve) => setTimeout(resolve, 10000));
      const currentBlockNumber = await ethersWss.getBlockNumber();
      confirmations = currentBlockNumber - blockNumber;
      console.log(
        'Rechecking - Confirmations:',
        confirmations,
        'Current Block:',
        currentBlockNumber,
        'Block Number:',
        blockNumber,
      );
    }

    return await _checkConfirmation(
      amount,
      transactionId,
      coin,
      confirmations,
      txHash,
    );
  } catch (error) {
    console.error('Error in verifyWithdraw:', error);
    throw error;
  }
};

const sendEth = async (amount, to, feePrice) => {
  try {
    const nonce = await ethersWss.getTransactionCount(
      process.env.WITHDRAW_FROM_WALLET,
    );

    const tx = {
      nonce: nonce,
      gasPrice: feePrice,
      gasLimit: web3.utils.toHex(21000),
      to: to,
      value: web3.utils.toWei(amount.toString(), 'ether'),
    };

    const transaction = await wallet.sendTransaction(tx);
    await transaction.wait();

    return transaction.hash;
  } catch (error) {
    throw error;
  }
};

const sendErc20Token = async (
  tokenContractAddress,
  to,
  amountInTokens,
  decimals,
  fee,
  feePrice,
) => {
  const tokenContract = new ethers.Contract(
    tokenContractAddress,
    ['function transfer(address to, uint amount) returns (bool)'],
    wallet,
  );

  const amountInTokenUnits = ethers.utils.parseUnits(
    amountInTokens.toString(),
    decimals,
  );
  const tx = await tokenContract.transfer(to, amountInTokenUnits, {
    gasLimit: ethers.utils.hexlify(100000),
  });

  const receipt = await tx.wait();
  return receipt.transactionHash;
};

async function getUtxos(address) {
  const apiUrl = `https://api.blockcypher.com/v1/btc/test3/addrs/${address}?unspentOnly=true`;

  try {
    const response = await axios.get(apiUrl);

    const utxos = response.data.map((utxo) => ({
      txid: utxo.tx_hash,
      vout: utxo.tx_output_n,
      amount: utxo.value,
    }));

    return utxos;
  } catch (error) {
    console.error('Error al obtener UTXOs:', error);
    throw error;
  }
}

async function broadcastTx(txHex) {
  const response = await bitcoinClient.post('/', {
    jsonrpc: '2.0',
    id: 'getblock.io',
    method: 'sendrawtransaction',
    params: [txHex],
  });
  return response.data.result;
}

const sendBtc = async (amount, from, to, fee) => {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: {
        address: from,
      },
    });

    if (!wallet || !wallet.encryptedPrivateKey) {
      throw new Error('Wallet not found or private key is missing');
    }

    const decryptedPrivateKey = decrypt(wallet.encryptedPrivateKey);
    const keyPair = bitcoin.ECPair.fromWIF(decryptedPrivateKey);

    const utxos = await getUtxos(from);

    const txb = new bitcoin.TransactionBuilder();

    let totalAmountAvailable = 0;
    utxos.forEach((utxo) => {
      totalAmountAvailable += utxo.amount;
      txb.addInput(utxo.txid, utxo.vout);
    });

    if (totalAmountAvailable < amount + fee) {
      throw new Error('Insufficient funds');
    }

    txb.addOutput(to, amount);

    const changeAmount = totalAmountAvailable - amount - fee;
    if (changeAmount > 0) {
      txb.addOutput(from, changeAmount);
    }

    for (let i = 0; i < txb.__inputs.length; i++) {
      txb.sign(i, keyPair);
    }

    const tx = txb.build();
    const txHex = tx.toHex();

    const broadcastResult = await broadcastTx(txHex);

    return broadcastResult;
  } catch (error) {
    throw error;
  }
};

const processWithdraw = async ({
  amount,
  fee,
  from,
  to,
  transactionId,
  coin,
  isNativeCoin,
  chainType,
}) => {
  console.log('Inicio de processWithdraw', { transactionId, amount, coin });
  try {
    if (chainType === 'EVM') {
      if (isNativeCoin) {
        const gasPrice = await web3.eth.getGasPrice();
        console.log('gasPrice', gasPrice);
        const txHash = await sendEth(amount, to, feePrice);
        if (txHash) {
          const blockNumber = await ethersWss.getBlockNumber();

          console.log('blockNumber', blockNumber);
          console.log('currentBlockNumber', currentBlockNumber);

          return await verifyWithdraw(
            amount,
            blockNumber,
            coin,
            transactionId,
            txHash,
          );
        }
      } else {
        const tokenContractAddress = coins[coin].contractAddress;
        const decimals = coins[coin].decimals;
        const txHash = await sendErc20Token(
          tokenContractAddress,
          to,
          amount,
          decimals,
          fee,
          feePrice,
        );
        if (txHash) {
          const blockNumber = await ethersWss.getBlockNumber();
          console.log('blockNumber', blockNumber);
          console.log('currentBlockNumber', currentBlockNumber);
          return await verifyWithdraw(
            amount,
            blockNumber,
            coin,
            transactionId,
            txHash,
          );
        }
      }
    } else if (chainType === 'BTC') {
      const broadcastResult = await sendBtc(amount, from, to, fee);
      if (broadcastResult) {
        const blockNumber = await ethersWss.getBlockNumber();
        const currentBlockNumber = await ethersWss.getBlockNumber();
        console.log('blockNumber', blockNumber);
        console.log('currentBlockNumber', currentBlockNumber);
        return await verifyWithdraw(
          amount,
          blockNumber,
          currentBlockNumber,
          coin,
          transactionId,
          broadcastResult,
        );
      }
    }
  } catch (error) {
    console.error('Error in processWithdraw:', error);
    await _updateTransactionState(transactionId, 'CANCELLED', 0, 0);
    throw error;
  }
  console.log('Fin de processWithdraw', { transactionId });
};

module.exports = {
  processWithdraw,
};
