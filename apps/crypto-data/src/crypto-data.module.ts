import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CryptoDataController } from './crypto-data.controller';
import { CryptoDataService } from './crypto-data.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    ClientsModule.register([
      {
        name: 'REDIS_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 3003,
        },
      },
    ]),
  ],
  controllers: [CryptoDataController],
  providers: [CryptoDataService],
})
export class CryptoDataModule {}
