interface TokenConfig {
  symbol: string;
  name: string;
  contractAddress: string;
  chainType: string;
  network: string;
  blockchainId: string;
  isNative?: boolean;
  withdrawFee?: string;
  description?: string;
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
      ETH: {
        symbol: 'ETH',
        name: 'Ethereum',
        contractAddress: '',
        chainType: 'EVM',
        network: 'TESTNET',
        blockchainId: '11155111',
        isNative: true,
        withdrawFee: '0.0027',
        description:
          'Ethereum, lanzado en 2015, es una plataforma descentralizada que permite la creación de contratos inteligentes y aplicaciones descentralizadas. Su criptomoneda, Ether, no tiene un suministro máximo definido, ajustando su emisión anual.',
      },
      USDT: {
        symbol: 'USDT',
        name: 'Tether',
        contractAddress: '0xcFBa2EdFb93C775F42E9bD007D29dd2E88E37cD6',
        chainType: 'EVM',
        network: 'TESTNET',
        blockchainId: '11155111',
        isNative: false,
        withdrawFee: '8',
        description:
          'USDT (Tether), creado en 2014, es un stablecoin que busca mantener paridad con el dólar estadounidense mediante el respaldo de reservas equivalentes. Su objetivo es combinar la estabilidad del dólar con la eficiencia de la tecnología blockchain.',
      },
      USDC: {
        symbol: 'USDC',
        name: 'USD Coin',
        contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        chainType: 'EVM',
        network: 'TESTNET',
        blockchainId: '11155111',
        isNative: false,
        withdrawFee: '8',
        description:
          'USDC (USD Coin), lanzado en 2018, es un stablecoin que mantiene una relación de 1:1 con el dólar estadounidense, respaldado por reservas de activos equivalentes. Facilita transacciones globales rápidas y seguras en el ecosistema digital.',
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
        isNative: true,
        withdrawFee: '0.00068',
        description:
          'Bitcoin, la primera criptomoneda lanzada en 2009, es una moneda digital descentralizada que elimina la necesidad de intermediarios financieros. Con un suministro finito de 21 millones de monedas, su sistema está diseñado para reducir su emisión diaria a la mitad cada cuatro años.',
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
        isNative: true,
        withdrawFee: '0.001',
        description:
          'Litecoin, creado en 2011 por Charlie Lee, es una criptomoneda diseñada para proporcionar transacciones rápidas, seguras y de bajo costo. Inspirado en Bitcoin, se diferencia por tener un tiempo de bloque más corto, facilitando pagos eficientes.',
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
        isNative: true,
        withdrawFee: '5',
        description:
          'Dogecoin, introducida en 2013, se distingue por su leal comunidad y uso práctico en transacciones digitales. Aunque inspirada en un meme, ha ganado seriedad como medio de intercambio, favoreciendo transacciones eficientes y económicas. Su suministro es ilimitado.',
      },
    },
  },
};
