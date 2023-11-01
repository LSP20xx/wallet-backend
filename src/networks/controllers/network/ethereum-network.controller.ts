import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { EthereumNetworkService } from 'src/networks/services/ethereum-network.service';
import { TransactionDetails } from 'src/interfaces/ITransactionDetails';
import { TransactionReceipt } from 'web3';

@Controller('ethereum-network')
export class EthereumNetworkController {
  constructor(
    private readonly ethereumNetworkService: EthereumNetworkService,
  ) {}

  @Get('balance/:address')
  async getBalance(@Param('address') address: string): Promise<bigint> {
    return await this.ethereumNetworkService.getBalance(address);
  }

  @Get('transaction/:txHash')
  async getTransaction(@Param('txHash') txHash: string): Promise<any> {
    return await this.ethereumNetworkService.getTransaction(txHash);
  }

  @Post('send-transaction')
  async sendTransaction(@Body() details: TransactionDetails): Promise<string> {
    return await this.ethereumNetworkService.sendTransaction(details);
  }

  @Get('gas-price')
  async getGasPrice(): Promise<bigint> {
    return await this.ethereumNetworkService.getGasPrice();
  }

  @Get('transaction-count/:address')
  async getTransactionCount(
    @Param('address') address: string,
  ): Promise<bigint> {
    return await this.ethereumNetworkService.getTransactionCount(address);
  }

  @Get('transaction-receipt/:txHash')
  async getTransactionReceipt(
    @Param('txHash') txHash: string,
  ): Promise<TransactionReceipt> {
    return await this.ethereumNetworkService.getTransactionReceipt(txHash);
  }
}
