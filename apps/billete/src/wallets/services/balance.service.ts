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
        walletTokens: {
          include: {
            token: true,
          },
        },
      },
    });

    return userWallets.map((wallet) => {
      const token = wallet.walletTokens[0]?.token;

      return {
        id: wallet.id,
        address: wallet.address,
        balance: wallet.balance,
        chainType: wallet.chainType,
        blockchainName:
          wallet.blockchain?.name.split('-')[0].charAt(0).toUpperCase() +
          wallet.blockchain?.name.split('-')[0].slice(1),
        tokenSymbol: token?.symbol,
      };
    });
  }
}
