// tradeOrder.controller.ts
import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Post,
} from '@nestjs/common';
import { TradeOrdersEntity } from '../entities/trade-orders.entity';
import { TradeOrdersService } from '../services/trade-orders.service';
import { FindOneOptions } from 'typeorm';

@Controller('tradeOrders')
export class TradeOrdersController {
  constructor(private readonly tradeOrderService: TradeOrdersService) {}
  @Post()
  create(@Body() tradeOrder: TradeOrdersEntity): Promise<TradeOrdersEntity> {
    return this.tradeOrderService.create(tradeOrder);
  }
  @Get()
  @Get(':id')
  findOne(
    @Param() options: FindOneOptions<TradeOrdersEntity>,
  ): Promise<TradeOrdersEntity> {
    return this.tradeOrderService.findOne(options);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() tradeOrder: TradeOrdersEntity,
  ): Promise<TradeOrdersEntity> {
    return this.tradeOrderService.update(id, tradeOrder);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.tradeOrderService.remove(id);
  }
}
