import { Controller, Get, Query } from '@nestjs/common';
import { EvmTokensService } from './services/evm-tokens.service';

@Controller('evm-tokens')
export class EvmTokensController {
  constructor(private readonly evmTokensService: EvmTokensService) {}

  @Get()
  async getCryptoData(
    @Query('coinId') coinId: string,
    @Query('days') days: number,
  ) {
    return this.evmTokensService.getCryptoData(coinId, days);
  }
}
