import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TokensService } from './services/tokens.service';
import { TokensController } from './tokens.controller';

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
  providers: [TokensService],
  controllers: [TokensController],
})
export class TokensModule {}
