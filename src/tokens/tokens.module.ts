import { Module } from '@nestjs/common';
import { EvmTokensService } from './services/evm-tokens.service';

@Module({
  providers: [EvmTokensService],
})
export class TokensModule {}
