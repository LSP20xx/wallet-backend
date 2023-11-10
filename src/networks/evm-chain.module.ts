import { Module, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from 'src/database/services/database/database.service';
import { Web3Module } from '../web3/web3.module';
import { EvmChainController } from './controllers/evm-chain.controller';
import { EvmChainService } from './services/evm-chain.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [Web3Module],
  providers: [EvmChainService],
  exports: [EvmChainService],
  controllers: [EvmChainController],
})
export class EvmChainModule implements OnModuleInit {
  constructor(
    private readonly databaseService: DatabaseService,
    private configService: ConfigService,
  ) {}
  async onModuleInit(): Promise<void> {
    await this.syncEvmChains();
  }

  async syncEvmChains(): Promise<void> {
    const allowedChains = this.configService
      .get('ALLOWED_CHAINS_IDS')
      .split(',');

    const networkData = allowedChains.map((chainId) => {
      const networkNameEnvVar = `CHAIN_${chainId}_NAME`;
      const networkName = this.configService.get(networkNameEnvVar);

      return {
        chainId: chainId.trim(),
        name: networkName || `Unknown Network for Chain ID ${chainId}`,
      };
    });

    for (const network of networkData) {
      const existingNetwork = await this.databaseService.evmChain.findUnique({
        where: { chainId: network.chainId },
      });

      if (!existingNetwork) {
        await this.databaseService.evmChain.create({
          data: {
            name: network.name,
            chainId: network.chainId,
          },
        });
      }
    }
  }
}
