/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require('@prisma/client');
const { Queue } = require('bullmq');

const prisma = new PrismaClient();

const createTransaction = async ({
  txHash,
  from,
  to,
  transactionType,
  blockchainId,
  status,
  confirmations,
  chainType,
  coin,
  walletId,
  network,
}) => {
  const transaction = await prisma.transaction.create({
    data: {
      txHash,
      from,
      to,
      chainId,
      transactionType,
      blockchainId,
      status,
      confirmations,
      chainType,
      walletId,
      network,
    },
  });
  if (transaction) {
    const transactionsQueue = new Queue(`${coin.toLowerCase()}-transactions`);
    await transactionsQueue.add(
      'transaction',
      {
        uuid: transaction.uuid,
        transactionHash: transaction.txHash,
        amount: transaction.amount,
        from: transaction.from,
        to: transaction.to,
        transactionType: transaction.transactionType,
        blockchainId: transaction.blockchainId,
        status: transaction.status,
        confirmations: transaction.confirmations,
        chainType: transaction.chainType,
        coin: transaction.coin,
        walletId: transaction.walletId,
        network: transaction.network,
      },
      {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    );
  }
  return transaction;
};

module.exports = createTransaction;
