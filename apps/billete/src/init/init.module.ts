// init.module.ts
import { Module } from '@nestjs/common';
import { DatabaseService } from 'apps/billete/src/database/services/database/database.service';
import { ConfigService } from '@nestjs/config';
import { BlockchainModule } from '../networks/blockchain.module';
import { InitService } from './services/init/init.service';
import { FiatWalletsService } from '../wallets/services/fiat-wallets.service';

@Module({
  imports: [BlockchainModule],
  providers: [InitService, DatabaseService, ConfigService, FiatWalletsService],
  exports: [InitService],
})
export class InitModule {}
