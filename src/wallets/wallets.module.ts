// wallets.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletsController } from './controllers/wallets.controller';
import { WalletsService } from './services/wallets.service';
import { WalletsEntity } from './entities/wallets.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WalletsEntity])],
  controllers: [WalletsController],
  providers: [WalletsService],
  exports: [WalletsService],
})
export class WalletsModule {}
