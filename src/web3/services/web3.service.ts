// src/web3/web3.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TransactionDetails } from 'src/interfaces/ITransactionDetails';
import Web3, { TransactionReceipt } from 'web3';

@Injectable()
export class Web3Service {
  private web3Instances = new Map<string, Web3>();

  constructor(private configService: ConfigService) {}

  getWeb3Instance(chainId: string): Web3 {
    let web3 = this.web3Instances.get(chainId);

    if (!web3) {
      const rpcUrl = this.configService.get<string>(`RPC_URL_${chainId}`);
      if (!rpcUrl) {
        throw new Error(`RPC URL for chainId ${chainId} is not configured.`);
      }
      web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
      this.web3Instances.set(chainId, web3);
    }

    return web3;
  }

  getBalance(chainId: string, address: string): Promise<bigint> {
    return this.getWeb3Instance(chainId).eth.getBalance(address);
  }

  getTransaction(chainId: string, txHash: string): Promise<any> {
    return this.getWeb3Instance(chainId).eth.getTransaction(txHash);
  }

  async sendTransaction(
    chainId: string,
    details: TransactionDetails,
  ): Promise<string> {
    const transaction = {
      from: details.from,
      to: details.to,
      value: this.getWeb3Instance(chainId).utils.toWei(
        details.amount.toString(),
        'ether',
      ),
    };
    const receipt =
      await this.getWeb3Instance(chainId).eth.sendTransaction(transaction);
    const txHash = '0x' + Buffer.from(receipt.transactionHash).toString('hex');
    return txHash;
  }

  async getGasPrice(chainId: string): Promise<bigint> {
    return await this.getWeb3Instance(chainId).eth.getGasPrice();
  }

  async getTransactionCount(chainId: string, address: string): Promise<bigint> {
    return await this.getWeb3Instance(chainId).eth.getTransactionCount(address);
  }

  async getTransactionReceipt(
    chainId: string,
    txHash: string,
  ): Promise<TransactionReceipt> {
    return await this.getWeb3Instance(chainId).eth.getTransactionReceipt(
      txHash,
    );
  }
}
