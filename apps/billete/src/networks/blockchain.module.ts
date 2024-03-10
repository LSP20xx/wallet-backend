import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { DatabaseService } from 'apps/billete/src/database/services/database/database.service';
import { Web3Module } from '../web3/web3.module';
import { EvmChainController } from './controllers/evm-chain.controller';
import { EvmChainService } from './services/evm-chain.service';
import { GraphQueryService } from './services/graph-query.service';
import { existsSync, mkdirSync } from 'fs';
import { UtxoChainService } from './services/utxo-chain.service';
import { UtxoChainController } from './controllers/utxo-chain.controller';

const basePath = resolve(__dirname, '../../src/networks/subgraphs');
if (!existsSync(basePath)) {
  mkdirSync(basePath, { recursive: true });
}

@Module({
  imports: [Web3Module],
  providers: [EvmChainService, UtxoChainService, GraphQueryService],
  exports: [EvmChainService, UtxoChainService, GraphQueryService],
  controllers: [EvmChainController, UtxoChainController],
})
export class BlockchainModule implements OnModuleInit {
  private allowedChains: string[] = [];
  private networkData: {
    name: any;
    chainId: string;
    isEvmCompatible: boolean;
    nativeTokenSymbol?: string;
  }[] = [];

  constructor(
    private readonly databaseService: DatabaseService,
    private configService: ConfigService,
  ) {}
  async onModuleInit(): Promise<void> {
    await this.syncBlockchains();
    await this.generateSubgraphConfigs();
  }

  async syncBlockchains(): Promise<void> {
    const evmTokenSymbols = {
      '1': 'ETH',
      '11155111': 'ETH',
    };
    this.allowedChains = this.configService
      .get('ALLOWED_CHAINS_IDS')
      .split(',');

    this.networkData = this.allowedChains.map((chainId: string) => {
      const networkNameEnvVar = `CHAIN_${chainId}_NAME`;
      const networkName = this.configService.get(networkNameEnvVar);
      return {
        chainId: chainId.trim(),
        name: networkName || `Unknown Network for Chain ID ${chainId}`,
        isEvmCompatible: true,
        nativeTokenSymbol: evmTokenSymbols[chainId.trim()],
      };
    });

    const coinNetworks = {
      bitcoin: {
        networks: ['bitcoin-mainnet', 'bitcoin-testnet'],
        symbol: 'BTC',
      },
      litecoin: {
        networks: ['litecoin-mainnet', 'litecoin-testnet'],
        symbol: 'LTC',
      },
      dogecoin: {
        networks: ['dogecoin-mainnet', 'dogecoin-testnet'],
        symbol: 'DOGE',
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(coinNetworks).forEach(([_, { networks, symbol }]) => {
      networks.forEach((network) => {
        this.networkData.push({
          name: network,
          chainId: network.toUpperCase(),
          isEvmCompatible: false,
          nativeTokenSymbol: symbol,
        });
      });
    });

    for (const network of this.networkData) {
      const existingNetwork = await this.databaseService.blockchain.findUnique({
        where: { blockchainId: network.chainId },
      });

      if (!existingNetwork) {
        await this.databaseService.blockchain.create({
          data: {
            name: network.name,
            blockchainId: network.chainId,
            nativeTokenSymbol: network.nativeTokenSymbol,
          },
        });
      }
    }
  }

  async generateSubgraphConfigs() {
    const chains = this.networkData;
    const basePath = resolve(__dirname, '../../src/networks/subgraphs');

    chains.forEach((chain) => {
      if (chain.isEvmCompatible) {
        const configContent = this.createYamlConfigForChain(chain);
        writeFileSync(
          join(basePath, `${chain.name}-${chain.chainId}.yaml`),
          configContent,
        );
      }
    });
  }

  private createYamlConfigForChain(chain: {
    name: any;
    chainId: string;
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
