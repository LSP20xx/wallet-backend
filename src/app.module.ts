import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { DataSourceConfig } from './config/data.source';
import { WalletsModule } from './wallets/wallet.module';
import { TradeOrdersModule } from './trade-orders/trade-orders.module';
import { SmsModule } from './sms/sms.module';
import { VerificationsModule } from './verifications/verifications.module';
import { EncryptionsModule } from './encryptions/encryptions.module';
import { EvmChainModule } from './networks/network.module';
import { TokensModule } from './tokens/tokens.module';
import { Web3Module } from './web3/web3.module';
import { TransactionsModule } from './transactions/transaction.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    DatabaseModule,
    TypeOrmModule.forRoot({ ...DataSourceConfig }),
    UsersModule,
    WalletsModule,
    TradeOrdersModule,
    SmsModule,
    VerificationsModule,
    EncryptionsModule,
    EvmChainModule,
    TokensModule,
    Web3Module,
    TransactionsModule,
    AuthModule,
  ],
})
export class AppModule {}
