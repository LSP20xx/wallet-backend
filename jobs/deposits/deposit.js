/* eslint-disable @typescript-eslint/no-var-requires */
const appRoot = require('app-root-path');
require('dotenv').config({ path: `${appRoot}/config/.env` });
const coins = require(`${appRoot}/config/coins/info`);
const ethers = require('ethers');
const { PrismaClient } = require('@prisma/client');
const { Queue } = require('bullmq');
const axios = require('axios');
const prisma = new PrismaClient();
const ethereumWss = new ethers.WebSocketProvider(process.env.ETHEREUM_WSS);

const bitcoinClient = axios.create({
  baseURL: 'https://go.getblock.io/d3997a11804641bda19e595364934897',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'd3997a11804641bda19e595364934897',
  },
});

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

const _depositEth = async (transactionId, amount, confirmations) => {
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

    await ethApproveTransactionQueue.add('approve', { transactionId });
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
    let confirmations = 0;
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

const _depositBtc = async (transactionId, amount, confirmations) => {
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

    await btcApproveTransactionQueue.add('approve', { transactionId });
    return 'deposit';
  } catch (error) {
    throw error;
  }
};

const _checkBtcConfirmation = async (
  amount,
  transactionId,
  coin,
  confirmations,
  txHash,
) => {
  try {
    const response = await bitcoinClient.post('/', {
      jsonrpc: '2.0',
      id: 'getblock.io',
      method: 'getrawtransaction',
      params: [txHash, true],
    });
    const transaction = response.data.result;

    console.log(
      'checkConfirmation:',
      amount,
      transactionId,
      coin,
      confirmations,
    );

    if (transaction && transaction.confirmations >= confirmations) {
      return await _depositBtc(
        transactionId,
        amount,
        transaction.confirmations,
      );
    } else {
      await _updateTransactionState(transactionId, 'CANCELLED', 0, 0);
      throw 'error: not deposited. no transaction confirmation.';
    }
  } catch (error) {
    console.error('Error in _checkBtcConfirmation:', error);
    throw error;
  }
};

const verifyBtcDeposit = async (
  amount,
  blockNumber,
  coin,
  transactionId,
  txHash,
) => {
  try {
    let confirmations = 0;
    let currentBlockNumber = 0;
    while (confirmations < 6) {
      await new Promise((resolve) => setTimeout(resolve, 10000));
      const latestBlock = await bitcoinClient.post('/', {
        jsonrpc: '2.0',
        id: 'getblock.io',
        method: 'getblockcount',
        params: [],
      });

      currentBlockNumber = latestBlock.data.result;
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

    return await _checkBtcConfirmation(
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
    } else if (coin.toLowerCase() === 'btc') {
      await verifyBtcDeposit(amount, blockNumber, coin, transactionId, txHash);
    }
  } catch (error) {
    await _updateTransactionState(transactionId, 'CANCELLED', 0, 0);
    throw error;
  }
};

module.exports = {
  processDeposit,
};
