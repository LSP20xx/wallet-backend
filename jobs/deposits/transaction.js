/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const { Queue } = require('bullmq');

const prisma = new PrismaClient();

const createTransaction = async ({
  txHash,
  from,
  to,
  transactionType,
  status,
  confirmations,
  chainType,
  blockchainId,
  walletId,
  userId,
  network,
  amount,
  coin,
  isNativeCoin,
}) => {
  const transaction = await prisma.transaction.create({
    data: {
      txHash,
      from,
      to,
      transactionType,
      blockchainId,
      status,
      confirmations,
      chainType,
      blockchainId,
      walletId,
      userId,
      network,
      isNativeCoin,
    },
  });
  if (transaction) {
    console.log('transaction:', transaction);
    console.log('coin:', coin.toLowerCase());
    const depositsQueue = new Queue(`${coin.toLowerCase()}-deposits`);
    depositsQueue.add(
      'deposit',
      {
        to,
        txHash,
        transactionId: transaction.id,
        blockchainId,
        coin,
        amount,
        uuid: uuidv4(),
      },
      {
        attempts: 20,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    );
    return 'deposit';
  }
  throw 'err: not processed';
};

module.exports = {
  createTransaction,
};
