// src/web3/web3.module.ts
import { Module } from '@nestjs/common';
import { Web3Service } from './services/web3.service';
import { EncryptionsModule } from 'apps/billete/src/encryptions/encryptions.module';

@Module({
  imports: [EncryptionsModule],
  providers: [Web3Service],
  exports: [Web3Service],
})
export class Web3Module {}
