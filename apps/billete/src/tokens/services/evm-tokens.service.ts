import { Inject, Injectable } from '@nestjs/common';
import { OnModuleInit } from '@nestjs/common';
import { tokensConfig } from 'config/coins/erc20-tokens';
import { DatabaseService } from '../../database/services/database/database.service';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class EvmTokensService implements OnModuleInit {
  constructor(
    private databaseService: DatabaseService,
    @Inject('CRYPTO_DATA_SERVICE') private client: ClientProxy,
  ) {}

  async onModuleInit() {
    await this.initializeTokens();
    await this.initializeTokensForAllWallets();
  }

  async getCryptoData() {
    return this.client.send('get_crypto_data', {});
  }

  private async initializeTokens() {
    for (const tokenConfig of Object.values(tokensConfig)) {
      const existingToken = await this.databaseService.token.findFirst({
        where: { contractAddress: tokenConfig.contractAddress },
      });

      if (!existingToken) {
        await this.databaseService.token.create({
          data: {
            ...tokenConfig,
          },
        });
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
}
