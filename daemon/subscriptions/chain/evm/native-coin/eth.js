/* eslint-disable @typescript-eslint/no-var-requires */
const { Queue, prisma, uuidv4 } = require('./index');
const ethers = require('ethers');
const web3 = require('web3');
const coinsConfig = require('../../../../../config/coins/info');

const chainType = 'EVM';
const blockchainId = '11155111';
const coin = 'ETH';
const transactionsQueue = new Queue(`${coin.toLowerCase()}-transactions`);

const ethersWss = new ethers.WebSocketProvider(process.env.ETHEREUM_WSS);

const isNativeCoin = (coin) => {
  return coin in coinsConfig;
};

ethersWss.on(
  {
    topics: [web3.utils.sha3('DepositedOnBillete()')],
  },
  async function (log) {
    try {
      const transaction = await ethersWss.getTransaction(log.transactionHash);

      if (transaction) {
        const wallet = await prisma.wallet.findUnique({
          where: {
            address: transaction.to,
          },
        });

        if (wallet) {
          await transactionsQueue.add(
            'transaction',

            {
              txHash: log.transactionHash,
              amount: transaction.value.toString(),
              from: transaction.from,
              to: transaction.to,
              transactionType: 'DEPOSIT',
              status: 'PROCESSING',
              confirmations: 0,
              chainType,
              blockchainId: blockchainId,
              blockNumber: transaction.blockNumber,
              walletId: wallet.id,
              userId: wallet.userId,
              network: blockchainId === '1' ? 'MAINNET' : 'TESTNET',
              coin: coin,
              isNativeCoin: isNativeCoin(coin),
              uuid: uuidv4(),
            },
            {
              attempts: 5,
              backoff: {
                type: 'exponential',
                delay: 5000,
              },
            },
          );
        }
      }
    } catch (err) {
      console.error('Error handling blockchain event:', err);
    }
  },
);
