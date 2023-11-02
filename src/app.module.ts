import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSourceConfig } from './config/data.source';
import { WalletsModule } from './wallets/wallets.module';
import { TradeOrdersModule } from './trade-orders/trade-orders.module';
import { SmsModule } from './sms/sms.module';
import { VerificationsModule } from './verifications/verifications.module';
import { OneTimeTokenModule } from './one-time-tokens/one-time-token.module';
import { EncryptionsModule } from './encryptions/encryptions.module';
import { SignUpModule } from './sign-up/sign-up.module';
import { SessionModule } from './session/sessions.module';
import { NetworkModule } from './networks/network.module';
//import { TradeOrdersModule } from './tradeOrders/tradeOrders.module'; // Nuevo
//import { NodeIntegrationsModule } from './nodeIntegrations/nodeIntegrations.module'; // Nuevo
import { TokensModule } from './tokens/tokens.module';
import { Web3Module } from './web3/web3.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({ ...DataSourceConfig }),
    UsersModule,
    WalletsModule,
    TradeOrdersModule,
    SmsModule,
    VerificationsModule,
    EncryptionsModule,
    OneTimeTokenModule,
    SignUpModule,
    SessionModule,
    NetworkModule,
    TokensModule,
    Web3Module,
    // TradeOrdersModule,
    // NodeIntegrationsModule,
  ],
})
export class AppModule {}
