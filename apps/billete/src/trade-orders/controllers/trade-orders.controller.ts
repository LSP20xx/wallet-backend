import { Body, Controller, Post } from '@nestjs/common';
import { BalancesService } from '../../wallets/services/balance.service';
import { TradeOrdersService } from '../services/trade-orders.service';

@Controller('trade-orders')
export class TradeOrdersController {
  constructor(
    private readonly tradeOrderService: TradeOrdersService,
    private readonly balancesService: BalancesService,
  ) {}

  @Post('convert')
  convert(
    @Body()
    convertDto: {
      userId: string;
      coin: string;
      amount: number;
      operation: string;
    },
  ) {
    this.tradeOrderService.convert(
      convertDto.userId,
      convertDto.coin,
      convertDto.amount,
      convertDto.operation,
    );
  }
}
