/* eslint-disable @typescript-eslint/no-var-requires */
const appRoot = require('app-root-path');
require('dotenv').config({ path: `${appRoot}/config/.env` });
const { Queue } = require('bullmq');
const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const { Web3, WebSocketProvider } = require('web3');

const prisma = new PrismaClient();

const getWeb3WssInstance = (wss) => {
  return new Web3(new WebSocketProvider(wss));
};

module.exports = {
  Queue,
  prisma,
  getWeb3WssInstance,
  uuidv4,
};
