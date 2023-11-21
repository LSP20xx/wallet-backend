/* eslint-disable @typescript-eslint/no-var-requires */
const { Queue, prisma, getWeb3WssInstance, uuidv4 } = require('./index');

const chainId = 5;
const coin = 'ETH';

const transactionsQueue = new Queue(`${coin.toLowerCase()}-transactions`);

const web3 = getWeb3WssInstance(process.env.ETHEREUM_WSS);

web3.eth.subscribe(
  'logs',
  {
    topics: [web3.utils.sha3('DepositedOnBillete()')],
  },
  async function (error, result) {
    if (error) {
      console.error('Error subscribing to logs:', error);
      return;
    }

    try {
      const wallet = await prisma.wallet.findUnique({
        where: {
          chainId: chainId.toString(),
          coin: coin,
          address: result.address,
        },
      });

      if (wallet) {
        await transactionsQueue.add(
          'transaction',
          {
            walletAddress: wallet.address,
            transactionHash: result.transactionHash,
            chainId,
            coin,
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
    } catch (err) {
      console.error('Error handling blockchain event:', err);
    }
  },
);
