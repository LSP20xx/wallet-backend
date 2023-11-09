import { Injectable } from '@nestjs/common';
import { TransactionDetails } from 'src/interfaces/ITransactionDetails';
import { TransactionReceipt } from 'web3';
import { Web3Service } from '../../web3/services/web3.service';
import { DatabaseService } from 'src/database/services/database/database.service';

@Injectable()
export class EvmNetworkService {
  constructor(
    private web3Service: Web3Service,
    private databaseService: DatabaseService,
  ) {
    this.web3Service = web3Service;
  }

  async syncEvmNetworks(): Promise<void> {
    const networks = [
      {
        chainId: process.env.NETWORK_CHAIN_ID_1,
        name: process.env.NETWORK_NAME_1,
      },
    ];

    for (const network of networks) {
      const existingNetwork = await this.databaseService.evmNetwork.findUnique({
        where: { chainId: network.chainId },
      });

      if (!existingNetwork) {
        await this.databaseService.evmNetwork.create({
          data: {
            name: network.name,
            chainId: network.chainId,
          },
        });
      }
    }
  }

  async getBalance(chainId: string, address: string): Promise<bigint> {
    return this.web3Service.getBalance(chainId, address);
  }

  async getTransaction(chainId: string, txHash: string): Promise<any> {
    return this.web3Service.getTransaction(chainId, txHash);
  }

  async sendTransaction(
    chainId: string,
    details: TransactionDetails,
    encryptedPrivateKey: string,
  ): Promise<string> {
    return this.web3Service.sendTransaction(
      chainId,
      details,
      encryptedPrivateKey,
    );
  }

  async getGasPrice(chainId: string): Promise<bigint> {
    return this.web3Service.getGasPrice(chainId);
  }

  async getTransactionCount(chainId: string, address: string): Promise<bigint> {
    return this.web3Service.getTransactionCount(chainId, address);
  }

  async getTransactionReceipt(
    chainId: string,
    txHash: string,
  ): Promise<TransactionReceipt> {
    return this.web3Service.getTransactionReceipt(chainId, txHash);
  }
}
