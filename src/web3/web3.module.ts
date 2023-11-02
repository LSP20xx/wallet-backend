// src/web3/web3.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Web3Service } from './services/web3.service';
import { EncryptionsModule } from 'src/encryptions/encryptions.module';
import { WalletsEntity } from 'src/wallets/entities/wallets.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([WalletsEntity]),
    ConfigModule,
    EncryptionsModule,
  ],
  providers: [Web3Service],
  exports: [Web3Service],
})
export class Web3Module {}
