/* eslint-disable @typescript-eslint/no-var-requires */
const appRoot = require('app-root-path');
require('dotenv').config({ path: `${appRoot}/config/.env` });
import { Worker } from 'bullmq';

new Worker('withdraw-requests', async (job) => {
  console.log('Working on withdraw-requests job');
  const { withdrawRequest } = job.data;
  console.log('withdrawRequest', withdrawRequest);
});
