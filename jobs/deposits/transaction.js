/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require('@prisma/client');

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
  walletId,
  network,
  amount,
  isNativeCoin,
}) => {
  await prisma.transaction.create({
    data: {
      txHash,
      from,
      to,
      transactionType,
      blockchainId,
      status,
      confirmations,
      chainType,
      walletId,
      network,
      amount,
      isNativeCoin,
    },
  });
};

module.exports = {
  createTransaction,
};
