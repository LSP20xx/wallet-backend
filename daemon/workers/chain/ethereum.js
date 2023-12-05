/* eslint-disable @typescript-eslint/no-var-requires */
const {
  Worker,
  createDepositTransaction,
  createWithdrawTransaction,
  processDeposit,
  approveTransaction,
  processWithdraw,
} = require('./index');

new Worker('eth-transactions', async (job) => {
  if (job.data.transactionType === 'DEPOSIT') {
    return await createDepositTransaction(job.data);
  } else if (job.data.transactionType === 'WITHDRAWAL') {
    return await createWithdrawTransaction(job.data);
  }
});

new Worker('eth-deposits', async (job) => {
  return await processDeposit(job.data);
});

new Worker('approve-transactions', async (job) => {
  return await approveTransaction(job.data);
});

new Worker('eth-withdraws', async (job) => {
  return await processWithdraw(job.data);
});
