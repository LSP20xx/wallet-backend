/* eslint-disable @typescript-eslint/no-var-requires */
const appRoot = require('app-root-path');
require('dotenv').config({ path: `${appRoot}/config/.env` });
const coins = require(`${appRoot}/config/coins/info`);
const ethers = require('ethers');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const ethersWss = new ethers.WebSocketProvider(process.env.ETHEREUM_WSS);

const reject = () => {
  console.error('error: not deposited');
  throw 'err: not deposited';
};

const _updateTransactionState = async (
  transactionId,
  status,
  amount,
  confirmations,
) => {
  const upsert = {
    status: status,
    ...(confirmations && { confirmations: confirmations }),
    ...(amount && { amount: value }),
  };
  await prisma.transaction.update({
    where: { id: transactionId },
    data: upsert,
  });
};

const _deposit = async (transactionId, blockchainId, coin, to, amount) => {
  const wallet = await prisma.wallet.findUnique({
    where: {
      to: to,
      blockchainId: blockchainId,
    },
    data: {
      balance: { increment: amount },
    },
  });
  if (wallet) {
    await _updateTransactionState(transactionId, 'PROCCESSED', amount);
    const wallet = await prisma.wallet.findFirst({
      where: { transactions: { some: { id: transactionId } } },
    });
    const user = await prisma.user.findUnique({
      where: { id: wallet.userId },
    });
    sendDepositEmail(amount, coin, user.email);
    return 'deposit';
  } else {
    await _updateTransactionState(transactionId, 'CANCELLED');
    reject();
  }
};
const _checkConfirmation = async (
  to,
  txHash,
  amount,
  coin,
  blockchainId,
  transactionId,
) => {
  const transaction = await ethersWss.getTransaction(txHash);
  if (transaction && transaction.status) {
    return _deposit(
      transactionId,
      blockchainId,
      coin,
      to,
      amount / 10 ** coins[coin].decimals,
    );
  }
  reject();
};

const processDeposit = async ({
  to,
  txHash,
  transactionId,
  blockchainId,
  coin,
  amount,
}) => {
  const currentBlockNumber = await ethersWss.getBlockNumber();
  const confirmations = currentBlockNumber - blockNumber;

  await _updateTransactionState(
    transactionId,
    'PROCESSED',
    ethers.utils.formatUnits(amount, coins[coin].decimals),
    confirmations,
  );

  if (confirmations >= 12) {
    return await _checkConfirmation(
      to,
      txHash,
      ethers.utils.formatUnits(amount, coins[coin].decimals),
      coin,
      blockchainId,
      transactionId,
    );
  }
  reject();
};

module.exports = {
  processDeposit,
};
