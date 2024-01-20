import { Inject, Injectable } from '@nestjs/common';
import { OnModuleInit } from '@nestjs/common';
import { DatabaseService } from '../../database/services/database/database.service';
import { ClientProxy } from '@nestjs/microservices';
import { ChainType, Network } from '@prisma/client';
import { tokensConfig } from 'config/coins/coins';

@Injectable()
export class EvmTokensService implements OnModuleInit {
  constructor(
    private databaseService: DatabaseService,
    @Inject('CRYPTO_DATA_SERVICE') private client: ClientProxy,
  ) {}

  async onModuleInit() {
    await this.initializeTokens();
    await this.initializeTokensForAllWallets();
    await this.initializeCryptocurrencyData();
  }

  async getCryptoData(coinId: string, days: number) {
    const eventPayload = { coinId, days };

    return this.client.send('get_crypto_data', eventPayload);
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
    const cryptocurrencyData =
      await this.databaseService.cryptocurrencyData.findMany();
    console.log(cryptocurrencyData);
    if (cryptocurrencyData.length === 0) {
      const tokens = await this.databaseService.token.findMany();
      const tokenNames = tokens.map((token) => token.name.toLowerCase());
      const cryptoData = await this.getCryptoData(tokenNames.join(','), 30);
      console.log(cryptoData);
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
