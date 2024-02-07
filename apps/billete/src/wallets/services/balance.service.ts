import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/services/database/database.service';

@Injectable()
export class BalancesService {
  constructor(private databaseService: DatabaseService) {}

  async getBalancesForUser(userId: string): Promise<any> {
    const userWallets = await this.databaseService.wallet.findMany({
      where: { userId },
      include: {
        blockchain: true,
      },
    });

    return userWallets.map((wallet) => ({
      id: wallet.id,
      address: wallet.address,
      balance: wallet.balance,
      chainType: wallet.chainType,
      // tokens: wallet.walletTokens.map((wt) => ({
      //   tokenId: wt.token.id,
      //   symbol: wt.token.symbol,
      //   balance: wt.balance,
      // })),
    }));
  }
}
