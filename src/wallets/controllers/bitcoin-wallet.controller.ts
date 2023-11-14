import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BitcoinWalletService } from '../services/bitcoin-wallet.service';
import { GetUserIdFromSub } from 'src/users/decorators/get-user-id-from-sub.decorator';

@Controller('bitcoin-wallet')
export class BitcoinWalletController {
  constructor(private readonly bitcoinWalletService: BitcoinWalletService) {}

  @Post('create/:network')
  @UseGuards(AuthGuard('jwt'))
  async createWallet(
    @Param('network') network: string,
    @GetUserIdFromSub() userIdFromSub: string,
  ) {
    return await this.bitcoinWalletService.createWallet(userIdFromSub, network);
  }
}
