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

const processWithdraw = async ({
  amount,
  fee,
  feePrice,
  to,
  transactionId,
  coin,
  isNativeCoin,
}) => {
  try {
    if (isNativeCoin) {
      const gasPrice = await web3.eth.getGasPrice();
      console.log('gasPrice', gasPrice);
      const txHash = await sendEth(amount, to, feePrice);
      if (txHash) {
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
        const currentBlockNumber = await ethersWss.getBlockNumber();
        console.log('blockNumber', blockNumber);
        console.log('currentBlockNumber', currentBlockNumber);
        return await verifyWithdraw(
          amount,
          blockNumber,
          currentBlockNumber,
          coin,
          transactionId,
          txHash,
        );
      }
    }
  } catch (error) {
    console.error('Error in processWithdraw:', error);
    await _updateTransactionState(transactionId, 'CANCELLED', 0, 0);
    throw error;
  }
};

module.exports = {
  processWithdraw,
};
