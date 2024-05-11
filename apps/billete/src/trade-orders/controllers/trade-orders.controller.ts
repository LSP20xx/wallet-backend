import { Body, Controller, Param, Post } from '@nestjs/common';
import { TradeOrdersService } from '../services/trade-orders.service';

@Controller('trade-orders')
export class TradeOrdersController {
  constructor(private readonly tradeOrderService: TradeOrdersService) {}

  @Post('convert/:userId')
  convert(
    @Param('userId') userId: string,
    @Body()
    convertDto: {
      fromSymbol: string;
      toSymbol: string;
      fromAmount: string;
      toAmount: string;
    },
  ) {
    this.tradeOrderService.convert(
      userId,
      convertDto.fromSymbol,
      convertDto.toSymbol,
      convertDto.fromAmount,
      convertDto.toAmount,
    );
  }
}
