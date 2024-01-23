import { Inject, Injectable } from '@nestjs/common';
import { OnModuleInit } from '@nestjs/common';
import { DatabaseService } from '../../database/services/database/database.service';
import { ClientProxy } from '@nestjs/microservices';
import { ChainType, Network } from '@prisma/client';
import { tokensConfig } from 'config/coins/coins';
import { map } from 'rxjs/operators';
import { from } from 'rxjs';

@Injectable()
export class TokensService implements OnModuleInit {
  constructor(
    private databaseService: DatabaseService,
    @Inject('CRYPTO_DATA_SERVICE') private client: ClientProxy,
  ) {}

  async onModuleInit() {
    await this.initializeTokens();
    await this.initializeTokensForAllWallets();
    await this.initializeCryptocurrencyData();
  }

  async getYahooFinanceData(coinId: string, days: number) {
    const eventPayload = { coinId, days };
    return this.client.send('get_yahoo_finance_data', eventPayload);
  }

  async getCoinGeckoData(coinId: string, days: number) {
    const eventPayload = { coinId, days };
    return this.client.send('get_coin_gecko_data', eventPayload);
  }

  private async initializeTokens() {
    console.log(tokensConfig);
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
                  symbol: `${tokenData.network === 'TESTNET' ? 't' : ''}${
                    tokenData.symbol
                  }`,
                  name: tokenData.name,
                  contractAddress: tokenData.contractAddress,
                  chainType: tokenData.chainType as ChainType,
                  network: tokenData.network as Network,
                  blockchainId: tokenData.blockchainId,
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
                  symbol: `${tokenData.network === 'TESTNET' ? 't' : ''}${
                    tokenData.symbol
                  }`,
                  name: tokenData.name,
                  contractAddress: tokenData.contractAddress,
                  chainType: tokenData.chainType as ChainType,
                  network: tokenData.network as Network,
                  blockchainId: tokenData.blockchainId,
                },
              });
            }
          }
        }
      }
    }
  }

  async initializeCryptocurrencyData() {
    const mainnetTokens = await this.databaseService.token.findMany({
      where: {
        network: 'MAINNET',
      },
    });
    const tickers = mainnetTokens.map(
      (token) => `${token.symbol.toUpperCase()}-USD`,
    );
    for (const ticker of tickers) {
      from(this.getYahooFinanceData(ticker, 1400000))
        .pipe(
          map((data) => {
            console.log(data);
            return data;
          }),
        )
        .subscribe({
          next: async (processedData) => {
            console.log(processedData);
            // const dataString = JSON.stringify(processedData);
            // await this.redisClient.set(ticker, dataString);
          },
          error: (error) => {
            console.error('Error processing data:', error);
          },
        });
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
}
