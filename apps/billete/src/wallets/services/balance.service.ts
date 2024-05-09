import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/services/database/database.service';
import { Socket } from 'socket.io';
import BigNumber from 'bignumber.js';

@Injectable()
export class BalancesService {
  private subscribers: Record<string, Socket[]> = {};

  constructor(private databaseService: DatabaseService) {}

  async getBalancesForUserByPlatform(userId: string): Promise<any> {
    const tokens = await this.databaseService.token.findMany();
    const fiatWallets = await this.databaseService.walletFiat.findMany({
      where: { userId },
    });
    const assetsBalance = {};

    assetsBalance['Billete'] = [];
    assetsBalance['Kraken'] = [];

    tokens.forEach((token) => {
      assetsBalance['Billete'].push({
        symbol: token.symbol,
        balance: new BigNumber(0),
      });
      assetsBalance['Kraken'].push({
        symbol: token.symbol,
        balance: new BigNumber(0),
      });
    });

    fiatWallets.forEach((fiatWallet) => {
      const platform = fiatWallet.platformName;
      if (!assetsBalance[platform]) {
        assetsBalance[platform] = [];
      }
      const symbol = fiatWallet.currencySymbol;
      const balance = new BigNumber(fiatWallet.balance);
      assetsBalance[platform].push({
        symbol: symbol,
        balance: balance,
      });
    });

    const userWallets = await this.databaseService.wallet.findMany({
      where: { userId },
      include: {
        blockchain: {
          select: {
            nativeTokenSymbol: true,
          },
        },
        walletTokens: {
          include: {
            token: true,
          },
        },
      },
    });

    console.log('user Wallets', userWallets);
    console.log('fiat-wallets', fiatWallets);

    userWallets.forEach((wallet) => {
      const platform = wallet.platformName;
      if (!assetsBalance[platform]) {
        assetsBalance[platform] = [];
      }
      const symbol = wallet.blockchain.nativeTokenSymbol;
      const balance = new BigNumber(wallet.balance);

      if (symbol === 'ETH') console.log('symbol balance', balance);

      let found = false;
      assetsBalance[platform].forEach((asset) => {
        if (asset.symbol === symbol) {
          asset.balance = asset.balance.plus(balance);
          found = true;
        }
      });

      if (!found) {
        assetsBalance[platform].push({
          symbol: symbol,
          balance: balance,
        });
      }

      wallet.walletTokens.forEach((wt) => {
        console.log('wallet token', wt);

        const { symbol } = wt.token;
        const tokenBalance = new BigNumber(wt.balance);

        let found = false;
        assetsBalance[platform].forEach((asset) => {
          if (asset.symbol === symbol) {
            asset.balance = asset.balance.plus(tokenBalance);
            found = true;
          }
        });

        if (!found) {
          assetsBalance[platform].push({
            symbol: symbol,
            balance: tokenBalance,
          });
        }
      });
    });

    Object.keys(assetsBalance).forEach((platform) => {
      assetsBalance[platform].forEach((asset) => {
        asset.balance = asset.balance.toString();
      });
    });

    return assetsBalance;
  }

  async updateBalancesForUserByPlatform(
    userId: string,
    fromSymbol: string,
    toSymbol: string,
    updatedBalances: any,
  ): Promise<void> {
    const userWallets = await this.databaseService.wallet.findMany({
      where: { id: userId },
    });

    const toSymbolWallets = userWallets.filter(
      (userWallet) => userWallet.symbol === fromSymbol,
    );

    console.log('userWallets', userWallets);

    for (const platform of Object.keys(updatedBalances)) {
      for (const balance of updatedBalances[platform]) {
      }
    }
  }

  async getBalancesForUser(userId: string): Promise<any> {
    const tokens = await this.databaseService.token.findMany();
    const fiatWallets = await this.databaseService.walletFiat.findMany({
      where: { userId },
    });
    const assetsBalance = [];

    tokens.forEach((token) => {
      assetsBalance.push({
        symbol: token.symbol,
        balance: new BigNumber(0),
      });
    });

    fiatWallets.forEach((fiatWallet) => {
      const symbol = fiatWallet.currencySymbol;
      const balance = new BigNumber(fiatWallet.balance);

      assetsBalance.push({
        symbol: symbol,
        balance: balance,
      });
    });

    const userWallets = await this.databaseService.wallet.findMany({
      where: { userId },
      include: {
        blockchain: {
          select: {
            nativeTokenSymbol: true,
          },
        },
        walletTokens: {
          include: {
            token: true,
          },
        },
      },
    });

    console.log('user Wallets', userWallets);
    console.log('fiat-wallets', fiatWallets);

    userWallets.forEach((wallet) => {
      const symbol = wallet.blockchain.nativeTokenSymbol;
      const balance = new BigNumber(wallet.balance);

      let found = false;
      assetsBalance.forEach((asset) => {
        if (asset.symbol === symbol) {
          asset.balance = asset.balance.plus(balance);
          found = true;
        }
      });

      if (!found) {
        assetsBalance.push({
          symbol: symbol,
          balance: balance,
        });
      }

      wallet.walletTokens.forEach((wt) => {
        console.log('wallet token', wt);

        const { symbol } = wt.token;
        const tokenBalance = new BigNumber(wt.balance);

        let found = false;
        assetsBalance.forEach((asset) => {
          if (asset.symbol === symbol) {
            asset.balance = asset.balance.plus(tokenBalance);
            found = true;
          }
        });

        if (!found) {
          assetsBalance.push({
            symbol: symbol,
            balance: tokenBalance,
          });
        }
      });
    });

    assetsBalance.forEach((asset) => {
      asset.balance = asset.balance.toString();
    });

    return assetsBalance;
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
