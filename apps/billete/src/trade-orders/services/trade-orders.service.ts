// tradeOrder.service.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'apps/billete/src/database/services/database/database.service';
import { BalancesService } from '../../wallets/services/balance.service';
import { BigNumber } from 'bignumber.js';
import { LambdaService } from '../../lambda/lambda.service';

@Injectable()
export class TradeOrdersService {
  private conversionGraph: Record<string, Record<string, number>> = {};
  private tickers = [
    'ETHUSDC',
    'ETHUSDT',
    'LTCETH',
    'LTCUSDT',
    'SOLETH',
    'SOLUSD',
    'SOLUSDT',
    'SOLXBT',
    'USDCUSD',
    'USDCUSDT',
    'XBTUSDC',
    'XBTUSDT',
    'XDGUSD',
    'XDGUSDT',
  ];

  private symbols = ['USD', 'USDC', 'USDT', 'XBT', 'XDG', 'ETH', 'SOL', 'LTC'];

  constructor(
    private databaseService: DatabaseService,
    private balanceService: BalancesService,
    private lambdaService: LambdaService,
  ) {}

  async onModuleInit(): Promise<void> {
    this.createConversionGraph();
    console.log(this.conversionGraph);
  }

  createConversionGraph() {
    this.conversionGraph = {};

    this.tickers.forEach((ticker) => {
      const symbolsInTicker = this.symbols.filter((symbol) =>
        ticker.includes(symbol),
      );
      if (symbolsInTicker.length == 2) {
        const [src, dst] = symbolsInTicker;

        if (!this.conversionGraph[src]) this.conversionGraph[src] = {};
        if (!this.conversionGraph[dst]) this.conversionGraph[dst] = {};

        this.conversionGraph[src][dst] = 1;
        this.conversionGraph[dst][src] = 1;
      }
    });
  }

  filterTickers(): string[] {
    return this.tickers.filter((ticker) => {
      const matches = this.symbols.filter((symbol) => ticker.includes(symbol));
      return matches.length === 2;
    });
  }

  async convert(
    userId: string,
    fromSymbol: string,
    toSymbol: string,
    amount: string,
  ) {
    try {
      const balances = await this.balanceService.getBalancesForUser(userId);
      const amountBN = new BigNumber(amount);
      let totalBalanceBNOnBillete = new BigNumber(0);
      let totalBalanceBNOutsideBillete = new BigNumber(0);

      balances.forEach((balance: any) => {
        if (balance.platformName === 'Billete') {
          // Acumula los fondos en Billete
          if (balance.symbol === fromSymbol) {
            totalBalanceBNOnBillete = totalBalanceBNOnBillete.plus(
              new BigNumber(balance.balance),
            );
          }

          if (balance.tokens && balance.tokens.length > 0) {
            balance.tokens.forEach((token: any) => {
              if (token.symbol === fromSymbol) {
                totalBalanceBNOnBillete = totalBalanceBNOnBillete.plus(
                  new BigNumber(token.balance),
                );
              }
            });
          }
        } else {
          // Acumula los fondos en otras plataformas
          totalBalanceBNOutsideBillete = totalBalanceBNOutsideBillete.plus(
            new BigNumber(balance.balance),
          );
        }
      });

      if (!totalBalanceBNOnBillete.isZero()) {
        const path = this.findConversionPath('USD', toSymbol);
        console.log(
          `Converting ${totalBalanceBNOnBillete} USD in Billete to ${toSymbol} via path: ${path}`,
        );
        await this.invokeConversion(path, totalBalanceBNOnBillete.toString());
      }

      if (!totalBalanceBNOutsideBillete.isZero()) {
        const path = this.findConversionPath(fromSymbol, toSymbol);
        console.log(
          `Converting ${totalBalanceBNOutsideBillete} ${fromSymbol} on external platforms to ${toSymbol} via path: ${path}`,
        );
        await this.invokeConversion(
          path,
          totalBalanceBNOutsideBillete.toString(),
        );
      }

      return { success: true };
    } catch (error) {
      console.log(`Error: ${error}`);
      return { success: false, error: error };
    }
  }

  findConversionPath(source: string, target: string): string[] | null {
    const visited: Set<string> = new Set();
    const queue: { node: string; path: string[] }[] = [
      { node: source, path: [source] },
    ];

    while (queue.length > 0) {
      const { node, path } = queue.shift()!;

      if (node === target) {
        return path;
      }

      visited.add(node);

      Object.keys(this.conversionGraph[node] || {}).forEach((neighbor) => {
        if (!visited.has(neighbor)) {
          queue.push({ node: neighbor, path: [...path, neighbor] });
        }
      });
    }

    return null;
  }

  async invokeConversion(path: string[], amount: string) {
    path.forEach(async (node, idx) => {
      if (idx < path.length - 1) {
        const payload = {
          amount,
          operation: 'convert',
          symbol: `${node}${path[idx + 1]}`,
        };

        await this.lambdaService.invokeLambdaFunction(
          'ConvertFromKraken',
          payload,
        );
      }
    });
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
