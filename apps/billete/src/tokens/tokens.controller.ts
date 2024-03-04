import { Controller, Get } from '@nestjs/common';
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

  @Get('get-blockchains-for-tokens')
  async getBlockchainsForTokens() {
    return await this.tokensService.getBlockchainsForTokens();
  }
}
