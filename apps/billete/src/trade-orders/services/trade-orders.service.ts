// tradeOrder.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'apps/billete/src/database/services/database/database.service';
import { BalancesService } from '../../wallets/services/balance.service';
import { BigNumber } from 'bignumber.js';
import { LambdaService } from '../../lambda/lambda.service';

@Injectable()
export class TradeOrdersService {
  constructor(
    private databaseService: DatabaseService,
    private balanceService: BalancesService,
    private lambdaService: LambdaService,
  ) {}

  async convert(
    userId: string,
    symbol: string,
    amount: string,
    operation: string,
  ) {
    try {
      const balances = await this.balanceService.getBalancesForUser(userId);
      const amountBN = new BigNumber(amount);
      let totalBalanceBN = new BigNumber(0);

      balances.forEach((balance: any) => {
        if (balance.symbol === symbol) {
          console.log(
            `Found matching symbol in balances: ${balance.symbol} with balance ${balance.balance}`,
          );

          totalBalanceBN = totalBalanceBN.plus(new BigNumber(balance.balance));
        }

        if (balance.tokens && balance.tokens.length > 0) {
          balance.tokens.forEach((token: any) => {
            if (token.symbol === symbol) {
              console.log(
                `Found matching symbol in tokens: ${token.symbol} with balance ${token.balance}`,
              );

              totalBalanceBN = totalBalanceBN.plus(
                new BigNumber(token.balance),
              );
            }
          });
        }
      });

      console.log(
        `Total balance for symbol ${symbol}: ${totalBalanceBN.toString()}`,
      );

      if (!totalBalanceBN.isGreaterThanOrEqualTo(amountBN)) {
        console.error('Insufficient balance for the conversion.');
        return;
      }

      if (!operation && !amountBN) {
        throw new BadRequestException('Operation and amount must be provided');
      }

      const payload = {
        amount: amountBN.toString(),
        operation: operation.toLowerCase(),
        symbol: symbol + 'USD',
      };

      await this.lambdaService.invokeLambdaFunction(
        'ConvertFromKraken',
        payload,
      );
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
