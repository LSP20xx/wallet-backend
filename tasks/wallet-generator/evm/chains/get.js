/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const appRoot = require('app-root-path');
const Config = require('./networkConfig');
require('dotenv').config({ path: `${appRoot}/config/.env` });

const buildNetworks = () => {
  const networks = {};
  const __dir = `${appRoot}/config/chains`;
  const files = fs.readdirSync(__dir);
  const privateKey = process.env.GENERATOR_PRIVATE_KEY;
  const address = process.env.GENERATOR_ADDRESS;

  files.forEach((file) => {
    const info = require(`${__dir}/${file}`);
    const network_id = require('path').parse(file).name;
    console.log('network_id: ', network_id);
    console.log('info: ', info);

    networks[info.name] = Config(address, privateKey, network_id, info.rpc);
  });

  return networks;
};

module.exports = buildNetworks();
