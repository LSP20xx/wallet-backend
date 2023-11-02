// wallets.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletsController } from './controllers/wallets.controller';
import { WalletsService } from './services/wallets.service';
import { WalletsEntity } from './entities/wallets.entity';
import { EncryptionsModule } from 'src/encryptions/encryptions.module';
import { Web3Module } from 'src/web3/web3.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WalletsEntity]),
    EncryptionsModule,
    Web3Module,
  ],
  controllers: [WalletsController],
  providers: [WalletsService],
  exports: [WalletsService],
})
export class WalletsModule {}
