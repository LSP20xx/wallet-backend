import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EvmTokensService } from './services/evm-tokens.service';
import { EvmTokensController } from './evm-tokens.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'CRYPTO_DATA_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 3002,
        },
      },
    ]),
  ],
  providers: [EvmTokensService],
  controllers: [EvmTokensController],
})
export class TokensModule {}
