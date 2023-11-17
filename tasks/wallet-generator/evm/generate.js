/* eslint-disable @typescript-eslint/no-var-requires */
const appRoot = require('app-root-path');
require('dotenv').config({ path: `${appRoot}/config/.env` });
const { sleep } = require('../../../utils/lock');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const GeneratorFactory = require('./factories/generatorFactory');

let amount = parseInt(process.argv[2]) || 0;
const blockchainId = process.argv[3] || '5';
const chainType = process.argv[4] || 'EVM';
const network = process.argv[5] || 'TESTNET';

const { rpc } = require(`${appRoot}/config/chains/${network}`);
const generatorFactory = new GeneratorFactory(rpc, []);

async function generateAndSaveWallets() {
  while (amount > 0) {
    console.log('Generating wallet... ', 'Remain: ', amount - 1);
    const res = await generatorFactory.generate();
    const result = JSON.parse(
      JSON.stringify(res.logs[0].args).replace('Result', '').trim(),
    );

    console.log(`Saving wallet: ${result.wallet}`);
    await prisma.walletContract.create({
      data: {
        address: result.wallet,
        blockchainId: blockchainId,
        chainType: chainType,
        network: network,
      },
    });

    amount--;
    await sleep(3000);
  }
}

generateAndSaveWallets()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
