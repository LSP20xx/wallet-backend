import { Controller, Get } from '@nestjs/common';
import { EvmTokensService } from './services/evm-tokens.service';

@Controller('evm-tokens')
export class EvmTokensController {
  constructor(private readonly evmTokensService: EvmTokensService) {}

  @Get()
  async getCryptoData() {
    return this.evmTokensService.getCryptoData();
  }
}
