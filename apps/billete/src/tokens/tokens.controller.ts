import { Controller, Get, Query } from '@nestjs/common';
import { TokensService } from './services/tokens.service';

@Controller('tokens')
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  @Get('yahoo-finance-data')
  async getYahooFinanceData(
    @Query('coinId') coinId: string,
    @Query('days') days: number,
  ) {
    const value = await this.tokensService.getYahooFinanceData(coinId, days);
    return value;
  }
  @Get('coin-gecko-data')
  async getCoinGeckoData(
    @Query('coinId') coinId: string,
    @Query('days') days: number,
    @Query('ticker') ticker: string,
  ) {
    const value = await this.tokensService.getCoinGeckoData(
      coinId,
      days,
      ticker,
    );
    return value;
  }
  @Get('redis-data')
  async getRedisData(@Query('key') key: string) {
    const value = await this.tokensService.getKey(key);
    return value;
  }
}
