import { Injectable } from '@nestjs/common';
import { BigNumber } from 'bignumber.js';
import { DatabaseService } from '../../database/services/database/database.service';

@Injectable()
export class FiatWalletsService {
  constructor(private databaseService: DatabaseService) {}

  async createWallet(
    userId: string,
    currencyId: string,
    currencyName: string,
    balance: string,
    platformId: string,
    platformName: string,
  ) {
    try {
      const initialBalance = new BigNumber(balance).toString();

      return await this.databaseService.walletFiat.create({
        data: {
          userId,
          currencyId,
          currencyName,
          balance: initialBalance,
          platformId,
          platformName,
        },
      });
    } catch (error) {
      console.error('Error creando la billetera fiduciaria:', error);
      throw error;
    }
  }

  async getWallets(userId: string) {
    return await this.databaseService.walletFiat.findMany({
      where: { userId },
      include: { currency: true, platform: true },
    });
  }

  async getWalletBalance(walletId: string) {
    const wallet = await this.databaseService.walletFiat.findUnique({
      where: { id: walletId },
    });

    return new BigNumber(wallet.balance);
  }

  async updateWalletBalance(walletId: string, newBalance: string) {
    const updatedBalance = new BigNumber(newBalance).toString();

    return await this.databaseService.walletFiat.update({
      where: { id: walletId },
      data: { balance: updatedBalance },
    });
  }
}
