import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EthereumNetworkEntity } from './entities/network.entity';
import { EthereumNetworkController } from './controllers/network/ethereum-network.controller';
import { EthereumNetworkService } from './services/ethereum-network.service';

@Module({
  imports: [TypeOrmModule.forFeature([EthereumNetworkEntity])],
  providers: [EthereumNetworkService],
  exports: [EthereumNetworkService],
  controllers: [EthereumNetworkController],
})
export class NetworkModule {}
