// trade-orders.module.ts
import { Module } from '@nestjs/common';
import { TradeOrdersController } from './controllers/trade-orders.controller';
import { TradeOrdersService } from './services/trade-orders.service';

@Module({
  controllers: [TradeOrdersController],
  providers: [TradeOrdersService],
  exports: [TradeOrdersService],
})
export class TradeOrdersModule {}
