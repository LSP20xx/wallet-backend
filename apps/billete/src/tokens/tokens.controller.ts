import { Controller, Get, Param } from '@nestjs/common';
import { TokensService } from './services/tokens.service';

@Controller('tokens')
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  @Get('stored-prices')
  async getStoredPrices() {
    return await this.tokensService.getStoredPrices();
  }

  @Get('little-line-charts')
  async getLittleLineCharts() {
    return await this.tokensService.getLittleLineCharts();
  }

  @Get('candlestick-chart/:nameAndInterval')
  async getCandlestickChart(@Param('nameAndInterval') nameAndInterval: string) {
    console.log('nameAndInterval', nameAndInterval);
    return await this.tokensService.getCandlestickChart(nameAndInterval);
  }

  @Get('linear-chart/:symbol')
  async getLinearChart(@Param('symbol') symbol: string) {
    console.log('name', symbol);
    return await this.tokensService.getLinearChart(symbol);
  }

  @Get('get-blockchains-for-tokens')
  async getBlockchainsForTokens() {
    return await this.tokensService.getBlockchainsForTokens();
  }

  @Get('get-fiat-currencies')
  async getFiatCurrencies() {
    return await this.tokensService.getFiatCurrencies();
  }
}
