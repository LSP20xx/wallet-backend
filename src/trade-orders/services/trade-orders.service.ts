// tradeOrder.service.ts
import { Injectable } from '@nestjs/common';
import { Prisma, TradeOrder } from '@prisma/client';
import { DatabaseService } from 'src/database/services/database/database.service';

@Injectable()
export class TradeOrdersService {
  constructor(private databaseService: DatabaseService) {}

  findAll(): Promise<TradeOrder[]> {
    return this.databaseService.tradeOrder.findMany();
  }

  findOne(id: string): Promise<TradeOrder | null> {
    return this.databaseService.tradeOrder.findUnique({
      where: { id },
    });
  }

  create(tradeOrderData: Prisma.TradeOrderCreateInput): Promise<TradeOrder> {
    return this.databaseService.tradeOrder.create({
      data: tradeOrderData,
    });
  }

  update(
    id: string,
    tradeOrderData: Prisma.TradeOrderUpdateInput,
  ): Promise<TradeOrder> {
    return this.databaseService.tradeOrder.update({
      where: { id },
      data: tradeOrderData,
    });
  }

  async remove(id: string): Promise<void> {
    await this.databaseService.tradeOrder.delete({
      where: { id },
    });
  }
}
