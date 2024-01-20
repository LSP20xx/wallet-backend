interface TokenConfig {
  symbol: string;
  name: string;
  contractAddress: string;
  chainType: string;
  network: string;
  blockchainId: string;
}
interface TokensConfig {
  ethereum: {
    testnet: {
      [key: string]: TokenConfig;
    };
    mainnet: {
      [key: string]: TokenConfig;
    };
  };
  bitcoin: {
    testnet: {
      [key: string]: TokenConfig;
    };
    mainnet: {
      [key: string]: TokenConfig;
    };
  };
}

export const tokensConfig: TokensConfig = {
  ethereum: {
    mainnet: {
      MKT: {
        symbol: 'MKT',
        name: 'MarketToken',
        contractAddress: '0xcFBa2EdFb93C775F42E9bD007D29dd2E88E37cD6',
        chainType: 'EVM',
        network: 'TESTNET',
        blockchainId: '5',
      },
    },
    testnet: {
      MKT: {
        symbol: 'MKT',
        name: 'MarketToken',
        contractAddress: '0xcFBa2EdFb93C775F42E9bD007D29dd2E88E37cD6',
        chainType: 'EVM',
        network: 'TESTNET',
        blockchainId: '5',
      },
    },
  },
  bitcoin: {
    testnet: {
      btc: {
        symbol: 'BTC',
        name: 'Bitcoin',
        contractAddress: '',
        chainType: 'UTXO',
        network: 'TESTNET',
        blockchainId: 'BITCOIN-TESTNET',
      },
    },
    mainnet: {
      btc: {
        symbol: 'BTC',
        name: 'Bitcoin',
        contractAddress: '',
        chainType: 'UTXO',
        network: 'MAINNET',
        blockchainId: 'BITCOIN-MAINNET',
      },
    },
  },
};
