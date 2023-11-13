// wallets.module.ts
import { Module } from '@nestjs/common';
import { EvmWalletController } from './controllers/evm-wallet.controller';
import { EvmWalletService } from './services/evm-wallet.service';
import { EncryptionsModule } from '../encryptions/encryptions.module';
import { Web3Module } from '../web3/web3.module';
import { TransactionsModule } from '../transactions/transaction.module';
import { GraphQueryService } from 'src/networks/services/graph-query.service';
import { BitcoinWalletService } from './services/bitcoin-wallet.service';

@Module({
  imports: [EncryptionsModule, Web3Module, TransactionsModule],
  controllers: [EvmWalletController],
  providers: [BitcoinWalletService, EvmWalletService, GraphQueryService],
  exports: [BitcoinWalletService, EvmWalletService],
})
export class WalletsModule {}
