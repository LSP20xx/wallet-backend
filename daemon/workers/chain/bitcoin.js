/* eslint-disable @typescript-eslint/no-var-requires */
const {
  Worker,
  createDepositTransaction,
  createWithdrawTransaction,
  processDeposit,
  approveTransaction,
  processWithdraw,
} = require('./index');

new Worker('btc-transactions', async (job) => {
  console.log('Trabajador btc-transactions activado', job.data);

  if (job.data.transactionType === 'DEPOSIT') {
    return await createDepositTransaction(job.data);
  } else if (job.data.transactionType === 'WITHDRAWAL') {
    return await createWithdrawTransaction(job.data);
  }
});

new Worker('btc-deposits', async (job) => {
  return await processDeposit(job.data);
});

new Worker('btc-approve-transactions', async (job) => {
  return await approveTransaction(job.data);
});

new Worker('btc-withdraws', async (job) => {
  return await processWithdraw(job.data);
});
