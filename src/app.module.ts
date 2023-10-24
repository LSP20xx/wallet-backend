import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSourceConfig } from './config/data.source';
import { WalletsModule } from './wallets/wallets.module';
import { TradeOrdersModule } from './trade-orders/trade-orders.module';
//import { TradeOrdersModule } from './tradeOrders/tradeOrders.module'; // Nuevo
//import { NodeIntegrationsModule } from './nodeIntegrations/nodeIntegrations.module'; // Nuevo

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
    // TradeOrdersModule,
    // NodeIntegrationsModule,
  ],
})
export class AppModule {}
