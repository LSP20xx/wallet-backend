/* eslint-disable @typescript-eslint/no-var-requires */
const appRoot = require('app-root-path');
require('dotenv').config({ path: `${appRoot}/config/.env` });
const { Worker } = require('bullmq');

new Worker('withdraw-requests', async (job) => {
  return await sendWithdraw(job.data);
});
