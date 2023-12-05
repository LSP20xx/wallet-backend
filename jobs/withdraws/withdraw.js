/* eslint-disable @typescript-eslint/no-var-requires */
const appRoot = require('app-root-path');
require('dotenv').config({ path: `${appRoot}/config/.env` });
const coins = require(`${appRoot}/config/coins/info`);
const ethers = require('ethers');
const { Web3 } = require('web3');
const { PrismaClient } = require('@prisma/client');
const { Queue } = require('bullmq');
const prisma = new PrismaClient();
const ethersWss = new ethers.WebSocketProvider(process.env.ETHEREUM_WSS);
const web3 = new Web3(process.env.ETHEREUM_WSS);

const approveTransactionQueue = new Queue('approve-transactions');

const _updateTransactionState = async (
  transactionId,
  status,
  amount,
  confirmations,
) => {
  try {
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
  try {
    await _updateTransactionState(
      transactionId,
      'PROCESSED',
      amount.toString(),
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
      return await _withdraw(
        transactionId,
        amount / 10 ** coins[coin].decimals,
        confirmations,
      );
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
  currentBlockNumber,
  coin,
  transactionId,
  txHash,
) => {
  try {
    let confirmations = currentBlockNumber - blockNumber;

    while (confirmations < 6) {
      await new Promise((resolve) => setTimeout(resolve, 10000));
      currentBlockNumber = await ethersWss.getBlockNumber();
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

const sendTransaction = async (value, toAddress) => {
  const signer = ethersWss.getSigner(process.env.WITHDRAW_FROM_WALLET);

  const nonce = await ethersWss.getTransactionCount(
    process.env.WITHDRAW_FROM_WALLET,
  );

  const gasPrice = await web3.eth.getGasPrice();
  console.log('gasPrice', gasPrice);

  const tx = {
    nonce: nonce,
    gasPrice: gasPrice,
    gasLimit: ethersWss.hexlify(3000000),
    to: toAddress,
    value: ethersWss.parseEther(value.toString()),
  };

  // Firmar y enviar la transacción
  const txResponse = await signer.sendTransaction(tx);
  await txResponse.wait(); // Esperar a que la transacción sea confirmada

  return txResponse.hash; // Devolver el hash de la transacción
};

const processWithdraw = async ({
  amount,
  from,
  to,
  transactionType,
  status,
  transactionId,
  chainType,
  blockchainId,
  walletId,
  userId,
  network,
  coin,
  isNativeCoin,
}) => {
  console.log('processWithdraw', {
    amount,
    from,
    to,
    transactionType,
    status,
    transactionId,
    chainType,
    blockchainId,
    walletId,
    userId,
    network,
    coin,
    isNativeCoin,
  });
  let currentBlockNumber;
  try {
    currentBlockNumber = await ethersWss.getBlockNumber();
    const txHash = await sendTransaction(amount, to);
    await verifyWithdraw(
      amount,
      blockNumber,
      currentBlockNumber,
      coin,
      transactionId,
      txHash,
    );
  } catch (error) {
    await _updateTransactionState(transactionId, 'CANCELLED', 0, 0);
    throw error;
  }
};

module.exports = {
  processWithdraw,
};
