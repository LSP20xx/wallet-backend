import { Body, Controller, Get } from '@nestjs/common';
import { BitcoinWalletService } from '../services/bitcoin-wallet.service';

@Controller('bitcoin-wallet')
export class BitcoinWalletController {
  constructor(private readonly bitcoinWalletService: BitcoinWalletService) {}

  @Get('create')
  async createWallet(
    @Body('userId') userId: string,
    @Body('network') network: string,
  ) {
    return await this.bitcoinWalletService.createWallet(userId, network);
  }
}
