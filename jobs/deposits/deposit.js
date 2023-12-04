/* eslint-disable @typescript-eslint/no-var-requires */
const appRoot = require('app-root-path');
require('dotenv').config({ path: `${appRoot}/config/.env` });
const coins = require(`${appRoot}/config/coins/info`);
const ethers = require('ethers');
const { PrismaClient } = require('@prisma/client');
const { Queue } = require('bullmq');
const prisma = new PrismaClient();
const ethersWss = new ethers.WebSocketProvider(process.env.ETHEREUM_WSS);

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

const _deposit = async (transactionId, amount, confirmations) => {
  try {
    await _updateTransactionState(
      transactionId,
      'PROCESSED',
      amount.toString(),
      confirmations,
    );
    // const user = await prisma.transaction
    //   .findOne({
    //     where: { id: transactionId },
    //   })
    //   .user();
    await approveTransactionQueue.add('approve', { transactionId });
    return 'deposit';
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
      return await _deposit(
        transactionId,
        amount / 10 ** coins[coin].decimals,
        confirmations,
      );
    } else {
      await _updateTransactionState(transactionId, 'CANCELLED', 0, 0);
      throw 'error: not deposited. no transaction receipt.';
    }
  } catch (error) {
    console.error('Error in _checkConfirmation:', error);
    throw error;
  }
};

const verifyDeposit = async (
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
    console.error('Error in verifyDeposit:', error);
    throw error;
  }
};

const processDeposit = async ({
  amount,
  blockNumber,
  coin,
  transactionId,
  txHash,
}) => {
  let currentBlockNumber;
  try {
    currentBlockNumber = await ethersWss.getBlockNumber();
    await verifyDeposit(
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
  processDeposit,
};
