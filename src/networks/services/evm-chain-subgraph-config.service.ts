import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { EvmChainConfigService } from './evm-chain-config.service';

@Injectable()
export class EvmChainSubgraphConfigService {
  constructor(private chainConfigService: EvmChainConfigService) {}

  generateSubgraphConfigs() {
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
    return `
      specVersion: 0.0.2
      description: Subgraph for ${chain.name}
      schema:
        file: ./schema.graphql
      dataSources:
        - kind: ethereum/contract
          name: ContractName
          network: ${chain.name}
          source:
            address: "<contract-address>"
            abi: ContractABI
          mapping:
            kind: ethereum/events
            apiVersion: 0.0.5
            language: wasm/assemblyscript
            entities:
              - EntityName
            abis:
              - name: ContractABI
                file: ./abis/ContractABI.json
            eventHandlers:
              - event: EventName(params)
                handler: handleEventName
            file: ./src/mapping.ts
    `;
  }
}
