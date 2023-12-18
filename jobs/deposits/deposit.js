/* eslint-disable @typescript-eslint/no-var-requires */
const appRoot = require('app-root-path');
require('dotenv').config({ path: `${appRoot}/config/.env` });
const coins = require(`${appRoot}/config/coins/info`);
const ethers = require('ethers');
const { PrismaClient } = require('@prisma/client');
const { Queue } = require('bullmq');
const prisma = new PrismaClient();
const ethereumWss = new ethers.WebSocketProvider(process.env.ETHEREUM_WSS);

// Crea colas para BTC y ETH
const btcApproveTransactionQueue = new Queue('btc-approve-transactions');
const ethApproveTransactionQueue = new Queue('eth-approve-transactions');

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

const _depositEth = async (transactionId, amount, confirmations, coin) => {
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
    const queue =
      coin.toLowerCase() === 'btc'
        ? btcApproveTransactionQueue
        : ethApproveTransactionQueue;
    await queue.add('approve', { transactionId });
    return 'deposit';
  } catch (error) {
    throw error;
  }
};

const _checkEthConfirmation = async (
  amount,
  transactionId,
  coin,
  confirmations,
  txHash,
) => {
  try {
    const transactionReceipt = await ethereumWss.getTransactionReceipt(txHash);
    console.log(
      'checkConfirmation:',
      amount,
      transactionId,
      coin,
      confirmations,
    );
    if (transactionReceipt && transactionReceipt.status) {
      return await _depositEth(
        transactionId,
        amount / 10 ** coins[coin].decimals,
        confirmations,
        coin,
      );
    } else {
      await _updateTransactionState(transactionId, 'CANCELLED', 0, 0);
      throw 'error: not deposited. no transaction receipt.';
    }
  } catch (error) {
    console.error('Error in _checkEthConfirmation:', error);
    throw error;
  }
};

const verifyEthDeposit = async (
  amount,
  blockNumber,
  coin,
  transactionId,
  txHash,
) => {
  try {
    let confirmations;
    let currentBlockNumber = 0;
    while (confirmations < 6) {
      await new Promise((resolve) => setTimeout(resolve, 10000));
      currentBlockNumber = await ethereumWss.getBlockNumber();
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

    return await _checkEthConfirmation(
      amount,
      transactionId,
      coin,
      confirmations,
      txHash,
    );
  } catch (error) {
    console.error('Error in verifyEthDeposit:', error);
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
  try {
    if (coin.toLowerCase() === 'eth') {
      await verifyEthDeposit(amount, blockNumber, coin, transactionId, txHash);
    } else {
      throw new Error('Coin not supported');
    }
  } catch (error) {
    await _updateTransactionState(transactionId, 'CANCELLED', 0, 0);
    throw error;
  }
};

module.exports = {
  processDeposit,
};
