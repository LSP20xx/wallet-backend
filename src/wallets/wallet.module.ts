// wallets.module.ts
import { Module } from '@nestjs/common';
import { WalletsController } from './controllers/evm-wallet.controller';
import { WalletsService } from './services/evm-wallet.service';
import { EncryptionsModule } from '../encryptions/encryptions.module';
import { Web3Module } from '../web3/web3.module';
import { TransactionsModule } from '../transactions/transaction.module';
import { GraphQueryService } from 'src/networks/services/graph-query.service';

@Module({
  imports: [EncryptionsModule, Web3Module, TransactionsModule],
  controllers: [WalletsController],
  providers: [WalletsService, GraphQueryService],
  exports: [WalletsService],
})
export class WalletsModule {}
