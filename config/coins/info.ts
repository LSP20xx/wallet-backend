interface CoinConfig {
  decimals: number;
  min_withdraw: number;
  fee: number;
}

interface CoinsConfig {
  [key: string]: CoinConfig;
}

const coinsConfig: CoinsConfig = {
  ETH: {
    decimals: 18,
    min_withdraw: 0.01,
    fee: 0.005,
  },
};

export = coinsConfig;
