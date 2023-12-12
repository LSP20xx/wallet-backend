/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const { Queue } = require('bullmq');

const prisma = new PrismaClient();

const createWithdrawTransaction = async ({
  amount,
  fee,
  feePrice,
  from,
  to,
  transactionType,
  status,
  chainType,
  blockchainId,
  walletId,
  userId,
  network,
  coin,
  isNativeCoin,
}) => {
  try {
    const transaction = await prisma.transaction.create({
      data: {
        txHash: uuidv4().toString(),
        amount,
        from,
        to,
        transactionType,
        status,
        confirmations: 0,
        chainType,
        blockchainId,
        walletId,
        userId,
        network,
        isNativeCoin,
      },
    });
    console.log('transactionId', transaction.id);
    if (transaction) {
      const withdrawQueue = new Queue(`${coin.toLowerCase()}-withdraws`);
      withdrawQueue.add(
        'withdraw',
        {
          amount,
          fee,
          feePrice,
          from,
          to,
          transactionType,
          status,
          transactionId: transaction.id,
          chainType,
          blockchainId,
          walletId,
          userId,
          network,
          coin,
          isNativeCoin,
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
      return 'withdraw';
    }
    throw 'err: not processed';
  } catch (err) {
    console.log('err', err);
  }
};

module.exports = {
  createWithdrawTransaction,
};
