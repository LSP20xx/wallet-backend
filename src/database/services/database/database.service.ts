import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { EvmNetworkService } from 'src/networks/services/evm-network.service';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit {
  constructor(
    configService: ConfigService,
    private evmNetworkService: EvmNetworkService,
  ) {
    super({
      datasources: {
        db: {
          url: configService.get('DATABASE_URL'),
        },
      },
    });
  }
  async onModuleInit(): Promise<void> {
    await this.evmNetworkService.syncEvmNetworks();
  }
}
