interface TokenConfig {
  symbol: string;
  contractAddress: string;
  chainType: string;
  network: string;
  blockchainId: string;
}

interface TokensConfig {
  ethereum: TokenConfig;
}

export const tokensConfig: TokensConfig = {
  ethereum: {
    symbol: 'MKT',
    contractAddress: '0xcFBa2EdFb93C775F42E9bD007D29dd2E88E37cD6',
    chainType: 'EVM',
    network: 'TESTNET',
    blockchainId: '5',
  },
};
