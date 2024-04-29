import { Body, Controller, Post } from '@nestjs/common';
import { BalancesService } from '../../wallets/services/balance.service';
import { TradeOrdersService } from '../services/trade-orders.service';

@Controller('trade-orders')
export class TradeOrdersController {
  constructor(private readonly tradeOrderService: TradeOrdersService) {}

  @Post('convert')
  convert(
    @Body()
    convertDto: {
      userId: string;
      symbol: string;
      amount: string;
      operation: string;
    },
  ) {
    this.tradeOrderService.convert(
      convertDto.userId,
      convertDto.symbol,
      convertDto.amount,
      convertDto.operation,
    );
  }
}
