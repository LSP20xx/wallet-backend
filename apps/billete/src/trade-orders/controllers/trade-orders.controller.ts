import { Body, Controller, Post } from '@nestjs/common';
import { TradeOrdersService } from '../services/trade-orders.service';

@Controller('trade-orders')
export class TradeOrdersController {
  constructor(private readonly tradeOrderService: TradeOrdersService) {}

  @Post('convert')
  convert(
    @Body()
    convertDto: {
      userId: string;
      fromSymbol: string;
      toSymbol: string;
      fromAmount: string;
      toAmount: string;
    },
  ) {
    this.tradeOrderService.convert(
      convertDto.userId,
      convertDto.fromSymbol,
      convertDto.toSymbol,
      convertDto.fromAmount,
      convertDto.toAmount,
    );
  }
}
