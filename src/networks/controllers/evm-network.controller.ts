import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TransactionDetails } from 'src/interfaces/ITransactionDetails';
import { Web3Service } from 'src/web3/services/web3.service';
import { TransactionReceipt } from 'web3';

@Controller('evm-network')
export class EvmNetworkController {
  constructor(private readonly web3Service: Web3Service) {}

  @Get(':chainId/balance/:address')
  async getBalance(
    @Param('chainId') chainId: string,
    @Param('address') address: string,
  ): Promise<bigint> {
    return await this.web3Service.getBalance(chainId, address);
  }
  @Get(':chainId/transaction/:txHash')
  async getTransaction(
    @Param('chainId') chainId: string,
    @Param('txHash') txHash: string,
  ): Promise<any> {
    return await this.web3Service.getTransaction(chainId, txHash);
  }

  @Post(':chainId/send-transaction')
  async sendTransaction(
    @Param('chainId') chainId: string,
    @Body() details: TransactionDetails,
  ): Promise<string> {
    return await this.web3Service.sendTransaction(chainId, details);
  }

  @Get(':chainId/gas-price')
  async getGasPrice(@Param('chainId') chainId: string): Promise<bigint> {
    return await this.web3Service.getGasPrice(chainId);
  }

  @Get(':chainId/transaction-count/:address')
  async getTransactionCount(
    @Param('chainId') chainId: string,
    @Param('address') address: string,
  ): Promise<bigint> {
    return await this.web3Service.getTransactionCount(chainId, address);
  }

  @Get(':chainId/transaction-receipt/:txHash')
  async getTransactionReceipt(
    @Param('chainId') chainId: string,
    @Param('txHash') txHash: string,
  ): Promise<TransactionReceipt> {
    return await this.web3Service.getTransactionReceipt(chainId, txHash);
  }
}
