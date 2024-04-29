// trade-orders.module.ts
import { Module } from '@nestjs/common';
import { TradeOrdersController } from './controllers/trade-orders.controller';
import { TradeOrdersService } from './services/trade-orders.service';
import { BalancesService } from '../wallets/services/balance.service';
import { LambdaService } from '../lambda/lambda.service';

@Module({
  imports: [],
  controllers: [TradeOrdersController],
  providers: [TradeOrdersService, BalancesService, LambdaService],
  exports: [TradeOrdersService],
})
export class TradeOrdersModule {}
