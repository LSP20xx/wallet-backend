import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvmNetworkEntity } from './entities/evm-network.entity';
import { Web3Module } from '../web3/web3.module';
import { EvmNetworkController } from './controllers/evm-network.controller';
import { EvmNetworkService } from './services/evm-network.service';

@Module({
  imports: [TypeOrmModule.forFeature([EvmNetworkEntity]), Web3Module],
  providers: [EvmNetworkService],
  exports: [EvmNetworkService],
  controllers: [EvmNetworkController],
})
export class NetworkModule {}
