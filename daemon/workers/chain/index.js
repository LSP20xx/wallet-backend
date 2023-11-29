/* eslint-disable @typescript-eslint/no-var-requires */
const appRoot = require('app-root-path');
require('dotenv').config({ path: `${appRoot}/config/.env` });
const { Worker } = require('bullmq');
const { createTransaction } = require(`${appRoot}/jobs/deposits/transaction`);
const { processDeposit } = require(`${appRoot}/jobs/deposits/deposit`);
// const processWithdraw = require(`${appRoot}/jobs/withdraws/withdraw`);

module.exports = {
  Worker,
  createTransaction,
  processDeposit,
  //processWithdraw,
};
