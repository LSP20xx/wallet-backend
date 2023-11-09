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
import { TradeOrder, Prisma } from '@prisma/client';

@Controller('trade-orders')
export class TradeOrdersController {
  constructor(private readonly tradeOrderService: TradeOrdersService) {}

  @Post()
  create(
    @Body() tradeOrderData: Prisma.TradeOrderCreateInput,
  ): Promise<TradeOrder> {
    return this.tradeOrderService.create(tradeOrderData);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<TradeOrder | null> {
    return this.tradeOrderService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() tradeOrderData: Prisma.TradeOrderUpdateInput,
  ): Promise<TradeOrder> {
    return this.tradeOrderService.update(id, tradeOrderData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    try {
      await this.tradeOrderService.remove(id);
      // If remove is successful, nothing is returned and you can end the function here.
    } catch (error) {
      // If an error is thrown, handle it here. For example:
      if (error instanceof NotFoundException) {
        throw new HttpException('Trade order not found', HttpStatus.NOT_FOUND);
      }
      // Handle any other types of errors that might be thrown
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
