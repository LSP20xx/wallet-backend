import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { EvmChainConfigService } from './evm-chain-config.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EvmChainSubgraphConfigService {
  constructor(
    private chainConfigService: EvmChainConfigService,
    private configService: ConfigService,
  ) {}

  async generateSubgraphConfigs() {
    const chains = this.chainConfigService.allowedChains;
    chains.forEach((chain) => {
      const configContent = this.createYamlConfigForChain(chain);
      fs.writeFileSync(
        path.join(__dirname, `../subgraphs/${chain.name}_${chain.id}.yaml`),
        configContent,
      );
    });
  }

  private createYamlConfigForChain(chain: {
    id: number;
    name: string;
    rpcUrl: string;
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
