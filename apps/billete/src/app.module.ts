import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq/dist/bull.module';
import { AuthModule } from './auth/auth.module';
import { DataSourceConfig } from './config/data.source';
import { DatabaseModule } from './database/database.module';
import { EncryptionsModule } from './encryptions/encryptions.module';
import { BlockchainModule } from './networks/blockchain.module';
import { SmsModule } from './sms/sms.module';
import { TokensModule } from './tokens/tokens.module';
import { TradeOrdersModule } from './trade-orders/trade-orders.module';
import { TransactionsModule } from './transactions/transaction.module';
import { UsersModule } from './users/users.module';
import { VerificationsModule } from './verifications/verifications.module';
import { WalletsModule } from './wallets/wallet.module';
import { Web3Module } from './web3/web3.module';
import { LambdaModule } from './lambda/lambda.module';
import { KrakenGateway } from 'gateways/kraken.gateway';
import { EmailModule } from './email/email.module';
import { BalanceGateway } from 'gateways/balance.gateway';
import { CircleModule } from './circle/circle.module';
import { InitModule } from './init/init.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: parseInt(process.env.RATE_LIMIT_TTL),
          limit: parseInt(process.env.RATE_LIMIT),
        },
      ],
    }),
    DatabaseModule,
    TypeOrmModule.forRoot({ ...DataSourceConfig }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
      },
    }),
    UsersModule,
    WalletsModule,
    TradeOrdersModule,
    VerificationsModule,
    SmsModule,
    EmailModule,
    EncryptionsModule,
    BlockchainModule,
    TokensModule,
    Web3Module,
    TransactionsModule,
    AuthModule,
    LambdaModule,
    CircleModule,
    InitModule,
  ],
  providers: [KrakenGateway, BalanceGateway],
})
export class AppModule {}
