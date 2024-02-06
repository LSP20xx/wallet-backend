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
    // mainnet: {
    //   [key: string]: TokenConfig;
    // };
  };
  bitcoin: {
    testnet: {
      [key: string]: TokenConfig;
    };
    // mainnet: {
    //   [key: string]: TokenConfig;
    // };
  };
  litecoin: {
    testnet: {
      [key: string]: TokenConfig;
    };
    // mainnet: {
    //   [key: string]: TokenConfig;
    // };
  };
  dogecoin: {
    testnet: {
      [key: string]: TokenConfig;
    };
    // mainnet: {
    //   [key: string]: TokenConfig;
    // };
  };
}

export const tokensConfig: TokensConfig = {
  ethereum: {
    // mainnet: {
    //   MKT: {
    //     symbol: 'MKT',
    //     name: 'MarketToken',
    //     contractAddress: '0xcFBa2EdFb93C775F42E9bD007D29dd2E88E37cD6',
    //     chainType: 'EVM',
    //     network: 'TESTNET',
    //     blockchainId: '1',
    //   },
    //   ETH: {
    //     symbol: 'ETH',
    //     name: 'Ethereum',
    //     contractAddress: '',
    //     chainType: 'EVM',
    //     network: 'MAINNET',
    //     blockchainId: '1',
    //   },
    //   USDT: {
    //     symbol: 'USDT',
    //     name: 'Tether',
    //     contractAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    //     chainType: 'EVM',
    //     network: 'MAINNET',
    //     blockchainId: '1',
    //   },
    // },
    testnet: {
      // MKT: {
      //   symbol: 'MKT',
      //   name: 'MarketToken',
      //   contractAddress: '0xcFBa2EdFb93C775F42E9bD007D29dd2E88E37cD6',
      //   chainType: 'EVM',
      //   network: 'TESTNET',
      //   blockchainId: '5',
      // },
      ETH: {
        symbol: 'ETH',
        name: 'Ethereum',
        contractAddress: '',
        chainType: 'EVM',
        network: 'TESTNET',
        blockchainId: '5',
      },
      USDT: {
        symbol: 'USDT',
        name: 'Tether',
        contractAddress: '0xcFBa2EdFb93C775F42E9bD007D29dd2E88E37cD6',
        chainType: 'EVM',
        network: 'TESTNET',
        blockchainId: '5',
      },
    },
  },
  bitcoin: {
    // mainnet: {
    //   BTC: {
    //     symbol: 'BTC',
    //     name: 'Bitcoin',
    //     contractAddress: '',
    //     chainType: 'UTXO',
    //     network: 'MAINNET',
    //     blockchainId: 'BITCOIN-MAINNET',
    //   },
    // },
    testnet: {
      BTC: {
        symbol: 'BTC',
        name: 'Bitcoin',
        contractAddress: '',
        chainType: 'UTXO',
        network: 'TESTNET',
        blockchainId: 'BITCOIN-TESTNET',
      },
    },
  },
  litecoin: {
    // mainnet: {
    //   LTC: {
    //     symbol: 'LTC',
    //     name: 'Litecoin',
    //     contractAddress: '',
    //     chainType: 'UTXO',
    //     network: 'MAINNET',
    //     blockchainId: 'LITECOIN-MAINNET',
    //   },
    // },
    testnet: {
      LTC: {
        symbol: 'LTC',
        name: 'Litecoin',
        contractAddress: '',
        chainType: 'UTXO',
        network: 'TESTNET',
        blockchainId: 'LITECOIN-TESTNET',
      },
    },
  },
  dogecoin: {
    // mainnet: {
    //   DOGE: {
    //     symbol: 'DOGE',
    //     name: 'Dogecoin',
    //     contractAddress: '',
    //     chainType: 'UTXO',
    //     network: 'MAINNET',
    //     blockchainId: 'DOGECOIN-MAINNET',
    //   },
    // },
    testnet: {
      DOGE: {
        symbol: 'DOGE',
        name: 'Dogecoin',
        contractAddress: '',
        chainType: 'UTXO',
        network: 'TESTNET',
        blockchainId: 'DOGECOIN-TESTNET',
      },
    },
  },
};
