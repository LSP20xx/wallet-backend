/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const Redis = require('ioredis');
const redis = new Redis();

redis.on('connect', () => {
  console.log('Conectado a Redis');
});

redis.on('error', (err) => {
  console.error('Error en la conexión Redis:', err);
});

const approveTransaction = async (job) => {
  try {
    console.log('Processing job:', job);

    const { transactionId } = job;

    await prisma.$transaction(async (prisma) => {
      const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: { wallet: true },
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      const wallet = transaction.wallet;
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      let newBalance;
      const amount = parseFloat(transaction.amount);

      if (transaction.transactionType === 'DEPOSIT') {
        newBalance = parseFloat(wallet.balance) + amount;
      } else if (transaction.transactionType === 'WITHDRAWAL') {
        newBalance = parseFloat(wallet.balance) - amount;
        if (newBalance < 0) {
          throw new Error('Insufficient funds for withdrawal');
        }
      } else {
        throw new Error('Invalid transaction type');
      }

      await prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance.toString() },
      });

      await prisma.transaction.update({
        where: { id: transactionId },
        data: { status: 'APPROVED' },
      });

      const message = JSON.stringify({
        userId: wallet.userId,
        balance: newBalance,
      });

      await redis.publish('balanceUpdate', message, (err, count) => {
        if (err) {
          console.error('Error publishing balance update:', err);
        } else {
          console.log('Balance update published to', count, 'subscribers');
        }
      });
    });

    console.log('Transaction approved and wallet balance updated');
  } catch (error) {
    console.error('Error in approveTransaction:', error);
    throw error;
  }
};

module.exports = {
  approveTransaction,
};
