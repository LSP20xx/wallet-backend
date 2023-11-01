import { Injectable } from '@nestjs/common';
import { NetworkService } from '../../interfaces/INetworkService';
import { TransactionDetails } from 'src/interfaces/ITransactionDetails';
import { EvmNetworkService } from 'src/interfaces/IEvmNetworkService';
import { TransactionReceipt } from 'web3';
import Web3 from 'web3';

@Injectable()
export class EthereumNetworkService
  implements NetworkService, EvmNetworkService
{
  private web3: Web3;

  constructor() {
    this.web3 = new Web3(process.env.ETHEREUM_TESTNET_RPC);
  }

  async getBalance(address: string): Promise<bigint> {
    return await this.web3.eth.getBalance(address);
  }

  async getTransaction(txHash: string): Promise<any> {
    return await this.web3.eth.getTransaction(txHash);
  }

  async sendTransaction(details: TransactionDetails): Promise<string> {
    const transaction = {
      from: details.from,
      to: details.to,
      value: this.web3.utils.toWei(details.amount.toString(), 'ether'),
    };
    const receipt = await this.web3.eth.sendTransaction(transaction);
    const txHash = '0x' + Buffer.from(receipt.transactionHash).toString('hex');
    return txHash;
  }
  async getGasPrice(): Promise<bigint> {
    return await this.web3.eth.getGasPrice();
  }

  async getTransactionCount(address: string): Promise<bigint> {
    return await this.web3.eth.getTransactionCount(address);
  }

  async getTransactionReceipt(txHash: string): Promise<TransactionReceipt> {
    return await this.web3.eth.getTransactionReceipt(txHash);
  }
}
