// tradeOrder.service.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'apps/billete/src/database/services/database/database.service';
import { BalancesService } from '../../wallets/services/balance.service';

@Injectable()
export class TradeOrdersService {
  constructor(
    private databaseService: DatabaseService,
    private balanceService: BalancesService,
  ) {}

  async convert(
    userId: string,
    symbol: string,
    amount: string,
    operation: string,
  ) {
    try {
      const balances = await this.balanceService.getBalancesForUser(userId);

      balances.forEach((balance) => {
        if (balance.symbol === symbol) {
          console.log(
            `Found matching symbol in balances: ${balance.symbol} with balance ${balance.balance}`,
          );
        }

        if (balance.tokens && balance.tokens.length > 0) {
          balance.tokens.forEach((token) => {
            if (token.symbol === symbol) {
              console.log(
                `Found matching symbol in tokens: ${token.symbol} with balance ${token.balance}`,
              );
            }
          });
        }
      });
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  }

  // findAll(): Promise<TradeOrder[]> {
  //   return this.databaseService.tradeOrder.findMany();
  // }

  // findOne(id: string): Promise<TradeOrder | null> {
  //   return this.databaseService.tradeOrder.findUnique({
  //     where: { id },
  //   });
  // }

  // create(tradeOrderData: Prisma.TradeOrderCreateInput): Promise<TradeOrder> {
  //   return this.databaseService.tradeOrder.create({
  //     data: tradeOrderData,
  //   });
  // }

  // update(
  //   id: string,
  //   tradeOrderData: Prisma.TradeOrderUpdateInput,
  // ): Promise<TradeOrder> {
  //   return this.databaseService.tradeOrder.update({
  //     where: { id },
  //     data: tradeOrderData,
  //   });
  // }

  // async remove(id: string): Promise<void> {
  //   await this.databaseService.tradeOrder.delete({
  //     where: { id },
  //   });
  // }
}
