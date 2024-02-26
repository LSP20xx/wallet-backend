import { Inject, Injectable } from '@nestjs/common';
import { OnModuleInit } from '@nestjs/common';
import { DatabaseService } from '../../database/services/database/database.service';
import { ClientProxy } from '@nestjs/microservices';
import { ChainType, Network } from '@prisma/client';
import { tokensConfig } from 'config/coins/coins';

@Injectable()
export class TokensService implements OnModuleInit {
  constructor(
    private databaseService: DatabaseService,
    @Inject('REDIS_SERVICE') private redisClient: ClientProxy,
  ) {}

  async onModuleInit() {
    await this.initializeTokens();
    await this.initializeTokensForAllWallets();
  }

  private async initializeTokens() {
    for (const [, networkTypes] of Object.entries(tokensConfig)) {
      for (const [, tokens] of Object.entries(networkTypes)) {
        for (const [, tokenData] of Object.entries(tokens)) {
          if (tokenData.contractAddress) {
            const existingToken = await this.databaseService.token.findFirst({
              where: { contractAddress: tokenData.contractAddress },
            });
            if (!existingToken) {
              await this.databaseService.token.create({
                data: {
                  symbol: `${tokenData.symbol}`,
                  name: tokenData.name,
                  contractAddress: tokenData.contractAddress,
                  chainType: tokenData.chainType as ChainType,
                  network: tokenData.network as Network,
                  blockchainId: tokenData.blockchainId,
                  isNative: tokenData.isNative ?? false,
                },
              });
            }
          } else {
            const existingToken = await this.databaseService.token.findFirst({
              where: { symbol: tokenData.symbol },
            });
            if (!existingToken) {
              await this.databaseService.token.create({
                data: {
                  symbol: `${tokenData.symbol}`,
                  name: tokenData.name,
                  contractAddress: tokenData.contractAddress,
                  chainType: tokenData.chainType as ChainType,
                  network: tokenData.network as Network,
                  blockchainId: tokenData.blockchainId,
                  isNative: tokenData.isNative ?? false,
                },
              });
            }
          }
        }
      }
    }
  }

  private async initializeTokensForAllWallets() {
    const tokens = await this.databaseService.token.findMany();
    const wallets = await this.databaseService.wallet.findMany();
    for (const wallet of wallets) {
      for (const token of tokens) {
        const existingWalletToken =
          await this.databaseService.walletToken.findFirst({
            where: {
              walletId: wallet.id,
              tokenId: token.id,
            },
          });

        if (!existingWalletToken) {
          await this.databaseService.walletToken.create({
            data: {
              walletId: wallet.id,
              tokenId: token.id,
              balance: '0',
            },
          });
        }
      }
    }
  }

  async getLittleLineCharts() {
    const tokens = await this.databaseService.token.findMany();

    const tokenNames = tokens.map((token) => `${token.name.toLowerCase()}_90d`);
    let allTokensData = [];

    const tokenDataPromises = tokenNames.map((tokenName) =>
      this.redisClient
        .send({ cmd: 'get' }, { key: tokenName })
        .toPromise()
        .then((result) => {
          if (!result.value) {
            console.error(`No data found for ${tokenName}`);
            return null;
          }
          const data = JSON.parse(result.value);
          const last7DaysData = data
            .filter((item: string) => item.trim() !== '')
            .slice(-168)
            .map((line: string) => {
              const parts = line.split(',');
              return { date: parts[0], close: parseFloat(parts[1]) };
            });
          console.log('last7DaysData', last7DaysData);
          return { assetName: tokenName.replace('_90d', ''), last7DaysData };
        })
        .catch((err) => {
          console.error(`Error getting Redis value for ${tokenName}:`, err);
          return null;
        }),
    );

    allTokensData = await Promise.all(tokenDataPromises);
    allTokensData = allTokensData.filter((data) => data !== null);
    return allTokensData;
  }

  calculatePriceVariation(lastPrice: number, openingPrice: number) {
    const variation = ((lastPrice - openingPrice) / openingPrice) * 100;
    return variation ? variation.toFixed(2) : 0;
  }

  async getStoredPrices() {
    const tokens = await this.databaseService.token.findMany();

    const tokenNames = tokens.map((token) => `${token.name.toLowerCase()}_1d`);

    let allTokensData = [];

    const tokenDataPromises = tokenNames.map((tokenName) =>
      this.redisClient
        .send({ cmd: 'get' }, { key: tokenName })
        .toPromise()
        .then((result) => {
          if (!result.value) {
            console.error(`No data found for ${tokenName}`);
            return null;
          }
          const data = JSON.parse(result.value);

          const openingPriceData = data
            .filter((item: string) => item.trim() !== '')
            .slice(1, 2)
            .map((line: string) => {
              const parts = line.split(',');
              return parseFloat(parts[1]);
            })[0];

          const lastPriceData = data
            .filter((item: string) => item.trim() !== '')
            .slice(-1)
            .map((line: string) => {
              const parts = line.split(',');
              return parseFloat(parts[1]);
            })[0];

          const priceVariation = this.calculatePriceVariation(
            lastPriceData,
            openingPriceData,
          );

          return {
            assetName: tokenName.replace('_1d', ''),
            price: lastPriceData,
            priceVariation: priceVariation,
          };
        })
        .catch((err) => {
          console.error(`Error getting Redis value for ${tokenName}:`, err);
          return null;
        }),
    );

    allTokensData = await Promise.all(tokenDataPromises);
    allTokensData = allTokensData.filter((data) => data !== null);
    return allTokensData;
  }

  async getBlockchainsForTokens() {
    console.log('Getting blockchains for tokens');
    const tokens = await this.databaseService.token.findMany({
      include: {
        blockchain: true,
      },
    });
    return tokens.map((token) => ({
      tokenId: token.id,
      blockchainName: token.blockchain.name,
      blockchainSymbol: token.blockchain.symbol,
      blockchainId: token.blockchainId,
    }));
  }
}
