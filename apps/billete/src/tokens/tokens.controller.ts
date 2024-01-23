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
    return this.tokensService.getYahooFinanceData(coinId, days);
  }
  @Get('coingecko-data')
  async getCoinGeckoData(
    @Query('coinId') coinId: string,
    @Query('days') days: number,
  ) {
    return this.tokensService.getCoinGeckoData(coinId, days);
  }
}
