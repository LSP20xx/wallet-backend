/* eslint-disable @typescript-eslint/no-var-requires */
const appRoot = require('app-root-path');
require('dotenv').config({ path: `${appRoot}/config/.env` });
const { Queue } = require('bullmq');
const Web3 = require('web3');
const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

const getWeb3WssInstance = (wss) => {
  return new Web3(new Web3.providers.SocketProvider(wss));
};

module.exports = {
  Queue,
  prisma,
  getWeb3WssInstance,
  uuidv4,
};
