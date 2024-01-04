import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/services/database/database.service';
import { OnModuleInit } from '@nestjs/common';
import { tokensConfig } from 'config/coins/erc20-tokens';

@Injectable()
export class EvmTokensService implements OnModuleInit {
  constructor(private databaseService: DatabaseService) {}

  async onModuleInit() {
    await this.initializeTokens();
    await this.initializeTokensForAllWallets();
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
