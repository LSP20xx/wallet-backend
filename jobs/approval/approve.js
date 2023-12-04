/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
