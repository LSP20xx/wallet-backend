import { ConfigService } from '@nestjs/config';

export class EvmChainConfigService {
  constructor(private configService: ConfigService) {}

  get allowedChains(): { id: number; name: string; rpcUrl: string }[] {
    const chainIds = this.configService
      .get('ALLOWED_CHAINS_IDS')
      .split(',')
      .map(Number);
    return chainIds.map((id: number) => ({
      id,
      name: this.configService.get(`CHAIN_${id}_NAME`),
      rpcUrl: this.configService.get(`RPC_URL_${id}`),
    }));
  }
}
