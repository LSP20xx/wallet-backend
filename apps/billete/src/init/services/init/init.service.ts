// services/init.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from 'apps/billete/src/database/services/database/database.service';
import { FiatWalletsService } from 'apps/billete/src/wallets/services/fiat-wallets.service';

@Injectable()
export class InitService implements OnModuleInit {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly fiatWalletsService: FiatWalletsService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.createBilletePlatform();
    await this.setupFiatCurrenciesAndPlatforms();
    await this.createFiatWallets();
    await this.removeDuplicatePlatforms();
    await this.removeDuplicateFiatWallets();
  }

  async setupFiatCurrenciesAndPlatforms() {
    try {
      const fiatCurrencies = [
        { code: 'USD', name: 'United States Dollar', symbol: '$' },
        { code: 'EUR', name: 'Euro', symbol: '€' },
        { code: 'GBP', name: 'British Pound Sterling', symbol: '£' },
      ];

      for (const currency of fiatCurrencies) {
        const existingCurrency =
          await this.databaseService.fiatCurrency.findUnique({
            where: { code: currency.code },
          });

        if (!existingCurrency) {
          await this.databaseService.fiatCurrency.create({ data: currency });
          console.log(`Se creó la moneda fiduciaria: ${currency.code}`);
        } else {
          console.log(`La moneda fiduciaria ${currency.code} ya existe`);
        }
      }

      const platforms = [{ name: 'Kraken', currencyCode: 'USD' }];

      for (const platform of platforms) {
        const existingPlatform = await this.databaseService.platform.findUnique(
          {
            where: { name: platform.name },
          },
        );

        if (!existingPlatform) {
          const currency = await this.databaseService.fiatCurrency.findUnique({
            where: { code: platform.currencyCode },
          });

          if (!currency) {
            throw new Error(
              `La moneda ${platform.currencyCode} no se encontró`,
            );
          }

          await this.databaseService.platform.create({
            data: {
              name: platform.name,
            },
          });
          console.log(`Se creó la plataforma: ${platform.name}`);
        } else {
          console.log(`La plataforma ${platform.name} ya existe`);
        }
      }
    } catch (error) {
      console.error(
        'Error en la configuración de monedas fiduciarias y plataformas:',
        error,
      );
    }
  }

  async createBilletePlatform() {
    try {
      let existingPlatform = await this.databaseService.platform.findUnique({
        where: { name: 'Billete' },
      });

      if (!existingPlatform) {
        existingPlatform = await this.databaseService.platform.create({
          data: { name: 'Billete' },
        });
        console.log('Plataforma Billete creada');
      } else {
        console.log('La plataforma Billete ya existe');
      }
    } catch (error) {
      console.error('Error al crear la plataforma Billete:', error);
    }
  }

  async createFiatWallets() {
    try {
      let existingPlatform = await this.databaseService.platform.findUnique({
        where: { name: 'Billete' },
      });
      console.log('existe billete?', existingPlatform);
      if (!existingPlatform) {
        existingPlatform = await this.databaseService.platform.create({
          data: { name: 'Billete' },
        });
      }
      console.log('Iniciando la creación de billeteras fiduciarias...');
      const users = await this.databaseService.user.findMany();

      const platforms = [
        { name: 'Kraken', currencyCode: 'USD', currencyName: 'Dollar' },
      ];

      for (const platform of platforms) {
        let existingPlatform = await this.databaseService.platform.findUnique({
          where: { name: platform.name },
          include: { fiatWallets: true },
        });

        const currency = await this.databaseService.fiatCurrency.findUnique({
          where: { code: platform.currencyCode },
        });

        if (!currency) {
          throw new Error(`La moneda ${platform.currencyCode} no se encontró`);
        }

        if (!existingPlatform) {
          existingPlatform = await this.databaseService.platform.create({
            data: { name: platform.name },
            include: { fiatWallets: true },
          });
          console.log(`Se creó la plataforma: ${platform.name}`);
        }

        for (const user of users) {
          console.log(
            `Verificando billeteras fiduciarias para el usuario ${user.id} en la plataforma ${platform.name}...`,
          );

          const existingWallet = existingPlatform.fiatWallets.find(
            (wallet) =>
              wallet.userId === user.id && wallet.currencyId === currency.id,
          );

          if (!existingWallet) {
            try {
              await this.fiatWalletsService.createWallet(
                user.id,
                currency.id,
                currency.name,
                currency.symbol,
                '0',
                existingPlatform.id,
                platform.name,
              );
              console.log(
                `Billetera fiduciaria creada para el usuario ${user.id} en la plataforma ${platform.name}`,
              );
            } catch (error) {
              console.error('Error creando la billetera fiduciaria:', error);
            }
          } else {
            console.log(
              `El usuario ${user.id} ya tiene una billetera fiduciaria en la plataforma ${platform.name}`,
            );
          }
        }
      }
    } catch (error) {
      console.error('Error al crear las billeteras fiduciarias:', error);
    }
  }

  async removeDuplicatePlatforms() {
    const platforms = await this.databaseService.platform.findMany({
      select: { id: true, name: true },
    });

    const uniquePlatforms = new Map();
    const duplicates = [];

    platforms.forEach((platform) => {
      if (uniquePlatforms.has(platform.name)) {
        duplicates.push(platform.id);
      } else {
        uniquePlatforms.set(platform.name, platform.id);
      }
    });

    for (const duplicateId of duplicates) {
      await this.databaseService.platform.delete({
        where: { id: duplicateId },
      });
    }
  }

  async removeDuplicateFiatWallets() {
    const wallets = await this.databaseService.walletFiat.findMany({
      select: { id: true, userId: true, currencyId: true, platformId: true },
    });

    const uniqueWallets = new Map();
    const duplicates = [];

    wallets.forEach((wallet) => {
      const key = `${wallet.userId}-${wallet.currencyId}-${wallet.platformId}`;
      if (uniqueWallets.has(key)) {
        duplicates.push(wallet.id);
      } else {
        uniqueWallets.set(key, wallet.id);
      }
    });

    for (const duplicateId of duplicates) {
      await this.databaseService.walletFiat.delete({
        where: { id: duplicateId },
      });
    }
  }
}
