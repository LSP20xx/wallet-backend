import { Module } from '@nestjs/common';
import { Web3Module } from '../web3/web3.module';
import { EvmNetworkController } from './controllers/evm-network.controller';
import { EvmNetworkService } from './services/evm-network.service';

@Module({
  imports: [Web3Module],
  providers: [EvmNetworkService],
  exports: [EvmNetworkService],
  controllers: [EvmNetworkController],
})
export class EvmNetworkModule {}
