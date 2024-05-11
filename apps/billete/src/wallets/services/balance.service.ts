import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/services/database/database.service';
import { Socket } from 'socket.io';
import BigNumber from 'bignumber.js';
type BalanceUpdate = {
  symbol: string;
  balance: string;
};

type UpdatedBalances = {
  [key: string]: BalanceUpdate[];
};
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

  async updateBalancesForUser(
    userId: string,
    fromSymbol: string,
    toSymbol: string,
    updatedBalances: UpdatedBalances,
  ): Promise<void> {
    console.log('fromSymbol', fromSymbol);
    console.log('toSymbol', toSymbol);
    console.log('updatedBalances', updatedBalances);
    const wallets = (await this.databaseService.wallet.findMany({
      where: { userId: userId },
      include: { walletTokens: true },
    })) as any[];

    const fiatWallets = (await this.databaseService.walletFiat.findMany({
      where: { userId: userId },
    })) as any[];

    const allWallets = new Map();
    wallets.forEach((wallet) => {
      allWallets.set(`${wallet.platformName}-${wallet.symbol}`, wallet);
      wallet.walletTokens.forEach((token) => {
        allWallets.set(`${wallet.platformName}-${token.symbol}`, token);
      });
    });
    fiatWallets.forEach((wallet) => {
      allWallets.set(`${wallet.platformName}-${wallet.currencySymbol}`, wallet);
    });

    console.log('allWallets', allWallets);

    // Actualizar los balances para fromSymbol y toSymbol
    Object.entries(updatedBalances).forEach(([platform, balances]) => {
      balances.forEach(async (balance) => {
        if (balance.symbol === fromSymbol || balance.symbol === toSymbol) {
          const walletKey = `${platform}-${balance.symbol}`;
          const walletOrToken = allWallets.get(walletKey);
          if (walletOrToken) {
            console.log(
              `Actualizando ${walletKey} con nuevo balance: ${balance.balance}`,
            );
            // Determinar si es un wallet, un wallet token o un fiat wallet y actualizar
            if (walletOrToken.hasOwnProperty('walletId')) {
              // Supone que es un wallet token
              await this.databaseService.walletToken.update({
                where: { id: walletOrToken.id },
                data: { balance: balance.balance },
              });
            } else if (walletOrToken.hasOwnProperty('currencySymbol')) {
              // Supone que es un fiat wallet
              await this.databaseService.walletFiat.update({
                where: { id: walletOrToken.id },
                data: { balance: balance.balance },
              });
            } else {
              // Tratamiento por defecto como crypto wallet
              await this.databaseService.wallet.update({
                where: { id: walletOrToken.id },
                data: { balance: balance.balance },
              });
            }
          }
        }
      });
    });
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
        assetName: token.name,
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
