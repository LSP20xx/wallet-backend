import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { DatabaseService } from 'src/database/services/database/database.service';
import { Web3Module } from '../web3/web3.module';
import { EvmChainController } from './controllers/evm-chain.controller';
import { EvmChainService } from './services/evm-chain.service';

@Module({
  imports: [Web3Module],
  providers: [EvmChainService],
  exports: [EvmChainService],
  controllers: [EvmChainController],
})
export class EvmChainModule implements OnModuleInit {
  private allowedChains: string[] = [];
  private networkData: { chainId: string; name: any }[] = [];

  constructor(
    private readonly databaseService: DatabaseService,
    private configService: ConfigService,
  ) {}
  async onModuleInit(): Promise<void> {
    await this.syncEvmChains();
    await this.generateSubgraphConfigs();
  }

  async syncEvmChains(): Promise<void> {
    this.allowedChains = this.configService
      .get('ALLOWED_CHAINS_IDS')
      .split(',');

    this.networkData = this.allowedChains.map((chainId: string) => {
      const networkNameEnvVar = `CHAIN_${chainId}_NAME`;
      const networkName = this.configService.get(networkNameEnvVar);

      return {
        chainId: chainId.trim(),
        name: networkName || `Unknown Network for Chain ID ${chainId}`,
      };
    });

    for (const network of this.networkData) {
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
  async generateSubgraphConfigs() {
    const chains = this.networkData;
    chains.forEach((chain) => {
      const configContent = this.createYamlConfigForChain(chain);
      writeFileSync(
        join(__dirname, `../subgraphs/${chain.name}_${chain.chainId}.yaml`),
        configContent,
      );
    });
  }

  private createYamlConfigForChain(chain: {
    chainId: string;
    name: any;
  }): string {
    const contractAddresses =
      this.configService
        .get(`${chain.name.toUpperCase()}_ERC20_CONTRACTS`)
        ?.split(',') || [];

    const dataSources = contractAddresses
      .map(
        (address: string) => `
      - kind: ethereum/contract
        name: ERC20Token
        network: ${chain.name}
        source:
          address: "${address}"
          abi: ERC20
        mapping:
          kind: ethereum/events
          apiVersion: 0.0.5
          language: wasm/assemblyscript
          entities:
            - Transfer
          abis:
            - name: ERC20
              file: ./abis/ERC20.json
          eventHandlers:
            - event: Transfer(address,address,uint256)
              handler: handleTransfer
    `,
      )
      .join('');

    return `
      specVersion: 0.0.2
      description: Subgraph for ${chain.name}
      schema:
        file: ./schema.graphql
      dataSources: ${dataSources}
    `;
  }
}
