import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { EvmWalletController } from './controllers/evm-wallet.controller';
import { EvmWalletService } from './services/evm-wallet.service';
import { EncryptionsModule } from '../encryptions/encryptions.module';
import { Web3Module } from '../web3/web3.module';
import { TransactionsModule } from '../transactions/transaction.module';
import { GraphQueryService } from 'apps/billete/src/networks/services/graph-query.service';
import { UtxoWalletService } from './services/utxo-wallet.service';
import { default as QueueType } from './queue/types.queue';
import { BalancesService } from './services/balance.service';

@Module({
  imports: [
    EncryptionsModule,
    Web3Module,
    TransactionsModule,
    BullModule.registerQueue(
      { name: QueueType.WITHDRAW_REQUEST },
      { name: QueueType.ETH_TRANSACTIONS },
      { name: QueueType.BTC_TRANSACTIONS },
    ),
  ],
  controllers: [EvmWalletController],
  providers: [
    UtxoWalletService,
    EvmWalletService,
    GraphQueryService,
    BalancesService,
  ],
  exports: [UtxoWalletService, EvmWalletService, BalancesService],
})
export class WalletsModule {}
