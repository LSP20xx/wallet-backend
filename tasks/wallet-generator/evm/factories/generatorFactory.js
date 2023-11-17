/* eslint-disable @typescript-eslint/no-var-requires */
const appRoot = require('app-root-path');
const GeneratorFactoryContract = require('../contracts/abis/GeneratorFactoryContract');
const Web3 = require('web3');

require('dotenv').config({ path: `${appRoot}/config/.env` });

const HDWalletProvider = require('@truffle/hdwallet-provider');
const privateKey = process.env.GENERATOR_PRIVATE_KEY;

class GeneratorFactory {
  constructor(rpc) {
    this.web3 = new Web3(
      new HDWalletProvider({
        privateKeys: [privateKey],
        providerOrUrl: rpc,
      }),
    );
  }

  async generate() {
    const contract = await GeneratorFactoryContract(this.web3.currentProvider);
    return await contract.generate({
      from: process.env.GENERATOR_ADDRESS,
    });
  }
}

module.exports = GeneratorFactory;
