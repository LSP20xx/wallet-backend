/* eslint-disable @typescript-eslint/no-var-requires */
const { Queue, prisma, getWeb3WssInstance, uuidv4 } = require('./index');
const appRoot = require('app-root-path');
const { wss } = require(`${appRoot}/config/chains/5`);
const ethers = require('ethers');
const web3 = require('web3');

const chainType = 'EVM';
const blockchainId = '5';
const coin = 'ETH';
const transactionsQueue = new Queue(`${coin.toLowerCase()}-transactions`);

const ethersWss = new ethers.WebSocketProvider(process.env.ETHEREUM_WSS);

ethersWss.on(
  {
    topics: [web3.utils.sha3('DepositedOnBillete()')],
  },
  async function (log, event) {
    console.log('log:', log);
    if (event) {
      console.error('Event:', event);
    } else {
      console.log('log:', log);
    }
    try {
      const transaction = await ethersWss.getTransaction(log.transactionHash);

      console.log('transaction:', transaction);

      if (transaction) {
        const wallet = await prisma.wallet.findUnique({
          where: {
            address: transaction.to,
          },
        });

        if (wallet) {
          console.log('entrando a crear la transaccion');
          await transactionsQueue.add(
            'transaction',

            {
              uuid: uuidv4(),
              transactionHash: log.transactionHash,
              amount: web3.utils.fromWei(transaction.value, 'ether'),
              from: transaction.from,
              to: transaction.to,
              transactionType: 'DEPOSIT',
              blockchainId,
              status: 'PROCESSING',
              confirmations: 0,
              chainType,
              coin,
              walletId: wallet.id,
              network: blockchainId === '1' ? 'MAINNET' : 'TESTNET',
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
