/* eslint-disable @typescript-eslint/no-var-requires */
const appRoot = require('app-root-path');

require('dotenv').config({ path: `${appRoot}/config/.env` });

module.exports = {
  rpc: process.env.ETHEREUM_RPC,
  wss: process.env.ETHEREUM_WSS,
  name: 'ethereum',
  g_address: process.env.ETH_GENERATOR_ADDRESS,
  g_address_pk: process.env.ETH_GENERATOR_PRIVATE_KEY,
};
