import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Post,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { TradeOrdersService } from '../services/trade-orders.service';
import { BalancesService } from '../../wallets/services/balance.service';

@Controller('trade-orders')
export class TradeOrdersController {
  constructor(
    private readonly tradeOrderService: TradeOrdersService,
    private readonly balancesService: BalancesService,
  ) {}

  @Post()
  convert() {
    return null;
  }
}
