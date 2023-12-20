/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const { Queue } = require('bullmq');

const prisma = new PrismaClient();

const createDepositTransaction = async ({
  txHash,
  from,
  to,
  transactionType,
  status,
  confirmations,
  chainType,
  blockchainId,
  blockNumber,
  walletId,
  userId,
  network,
  amount,
  coin,
  isNativeCoin,
}) => {
  console.log('createDepositTransaction BTC', {
    txHash,
    from,
    to,
    transactionType,
    status,
    confirmations,
    chainType,
    blockchainId,
    blockNumber,
    walletId,
    userId,
    network,
    amount,
    coin,
    isNativeCoin,
  });
  try {
    const transaction = await prisma.transaction.create({
      data: {
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
        isNativeCoin,
      },
    });
    if (transaction) {
      const depositsQueue = new Queue(`${coin.toLowerCase()}-deposits`);
      depositsQueue.add(
        'deposit',
        {
          amount,
          blockNumber,
          coin,
          transactionId: transaction.id,
          txHash,
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
  } catch (err) {
    console.log('err', err);
  }
};

module.exports = {
  createDepositTransaction,
};
