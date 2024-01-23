import { Module } from '@nestjs/common';
import { CryptoDataController } from './crypto-data.controller';
import { CryptoDataService } from './crypto-data.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../../billete/src/database/database.module';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    DatabaseModule,
  ],
  controllers: [CryptoDataController],
  providers: [CryptoDataService],
})
export class CryptoDataModule {}
