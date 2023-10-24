// trade-orders.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TradeOrdersController } from './controllers/trade-orders.controller';
import { TradeOrdersService } from './services/trade-orders.service';
import { TradeOrdersEntity } from './entities/trade-orders.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TradeOrdersEntity])],
  controllers: [TradeOrdersController],
  providers: [TradeOrdersService],
  exports: [TradeOrdersService],
})
export class TradeOrdersModule {}
