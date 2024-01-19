import { Injectable } from '@nestjs/common';
import { TransactionDetails } from 'apps/billete/src/interfaces/ITransactionDetails';
import { TransactionReceipt } from 'web3';
import { Web3Service } from '../../web3/services/web3.service';

@Injectable()
export class EvmChainService {
  constructor(private web3Service: Web3Service) {
    this.web3Service = web3Service;
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
