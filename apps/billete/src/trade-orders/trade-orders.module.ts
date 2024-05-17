// trade-orders.module.ts
import { Module } from '@nestjs/common';
import { TradeOrdersController } from './controllers/trade-orders.controller';
import { TradeOrdersService } from './services/trade-orders.service';
import { BalancesService } from '../wallets/services/balance.service';
import { LambdaService } from '../lambda/lambda.service';
import { KrakenGateway } from 'gateways/kraken.gateway';

@Module({
  imports: [],
  controllers: [TradeOrdersController],
  providers: [
    TradeOrdersService,
    BalancesService,
    LambdaService,
    KrakenGateway,
  ],
  exports: [TradeOrdersService],
})
export class TradeOrdersModule {}
