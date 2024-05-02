import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/services/database/database.service';
import { Socket } from 'socket.io';

@Injectable()
export class BalancesService {
  private subscribers: Record<string, Socket[]> = {};

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

    const fiatWallets = await this.databaseService.walletFiat.findMany({
      where: { userId },
    });

    console.log('fiat-wallets', fiatWallets);

    return userWallets.map((wallet) => {
      let tokens = [];

      if (wallet.chainType === 'EVM') {
        tokens = wallet.walletTokens
          .filter((wt) => !wt.token.isNative)
          .map((wt) => ({
            id: wt.token.id,
            symbol: wt.token.symbol,
            balance: wt.balance,
            chainType: wt.token.chainType,
            assetName: wt.token.name,
            address: '',
            assetDecimals: 4,
          }));
      }

      return {
        id: wallet.id,
        address: wallet.address,
        balance: wallet.balance,
        chainType: wallet.chainType,
        symbol: wallet.blockchain?.nativeTokenSymbol,
        tokens,
        fiatWallets,
      };
    });
  }

  subscribeToBalanceUpdate(userId: string, client: Socket): void {
    if (!this.subscribers[userId]) {
      this.subscribers[userId] = [];
    }
    this.subscribers[userId].push(client);

    this.updateBalanceForUser(userId);
  }

  async updateBalanceForUser(userId: string): Promise<void> {
    const balances = await this.getBalancesForUser(userId);
    console.log('USER BALANCES', balances);
    this.subscribers[userId]?.forEach((client) => {
      client.emit('balance-update', balances);
    });
  }

  notifyBalanceChange(userId: string): void {
    this.updateBalanceForUser(userId);
  }
}
