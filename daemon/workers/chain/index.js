/* eslint-disable @typescript-eslint/no-var-requires */
const appRoot = require('app-root-path');
require('dotenv').config({ path: `${appRoot}/config/.env` });
const { Worker } = require('bullmq');
const { createDepositTransaction } = require(
  `${appRoot}/jobs/deposits/transaction`,
);
const { createWithdrawTransaction } = require(
  `${appRoot}/jobs/withdraws/transaction`,
);
const { processDeposit } = require(`${appRoot}/jobs/deposits/deposit`);
const { approveTransaction } = require(`${appRoot}/jobs/approval/approve`);
const { processWithdraw } = require(`${appRoot}/jobs/withdraws/withdraw`);

module.exports = {
  Worker,
  createDepositTransaction,
  createWithdrawTransaction,
  processDeposit,
  approveTransaction,
  processWithdraw,
};
