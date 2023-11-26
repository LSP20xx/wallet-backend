/* eslint-disable @typescript-eslint/no-var-requires */
const { Queue, prisma, getWeb3WssInstance, uuidv4 } = require('./index');

const chainType = 'EVM';
const blockchainId = '5';
const coin = 'ETH';
const transactionsQueue = new Queue(`${coin.toLowerCase()}-transactions`);

const web3 = getWeb3WssInstance(process.env.ETHEREUM_WSS);

web3.eth.subscribe(
  'logs',
  {
    topics: [web3.utils.sha3('DepositedOnBillete()')],
  },
  async function (error, result) {
    console.log('result:', result);
    if (error) {
      console.error('Error subscribing to logs:', error);
      return;
    } else {
      console.log('result:', result);
    }
    try {
      const transaction = await web3.eth
        .getTransaction(result.transactionHash)
        .then((transaction) => {
          console.log('Transaction details:', transaction);
        })
        .catch((err) => {
          console.error('Error fetching transaction:', err);
        });

      console.log('transaction:', transaction);

      if (transaction) {
        const wallet = await prisma.wallet.findUnique({
          where: {
            chainId: chainId.toString(),
            coin: coin,
            address: transaction.to,
          },
        });

        if (wallet) {
          console.log('entrando a crear la transaccion');
          await transactionsQueue.add(
            'transaction',
            {
              uuid: uuidv4(),
              transactionHash: result.transactionHash,
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
