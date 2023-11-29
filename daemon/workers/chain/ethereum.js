/* eslint-disable @typescript-eslint/no-var-requires */
const {
  Worker,
  createTransaction,
  processDeposit,
  // processDeposit,
  // processWithdraw,
} = require('./index');

new Worker('eth-transactions', async (job) => {
  console.log('job:', job);
  return await createTransaction(job.data);
});

new Worker('eth-deposits', async (job) => {
  return await processDeposit(job.data);
});

// new Worker('eth-withdraws', async (job) => {
//   return await processWithdraw(job.data);
// });
