import { Module } from '@nestjs/common';
import { CryptoDataController } from './crypto-data.controller';
import { CryptoDataService } from './crypto-data.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  controllers: [CryptoDataController],
  providers: [CryptoDataService],
})
export class CryptoDataModule {}
