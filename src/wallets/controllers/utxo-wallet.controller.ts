import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UtxoWalletService } from '../services/utxo-wallet.service';
import { GetUserIdFromSub } from 'src/users/decorators/get-user-id-from-sub.decorator';

@Controller('utxo-wallet')
export class UtxoWalletController {
  constructor(private readonly utxoWalletService: UtxoWalletService) {}

  @Post('create/:network/:newtorkType')
  @UseGuards(AuthGuard('jwt'))
  async createWallet(
    @Param('network') network: string,
    @Param('networkType') networkType: string,
    @GetUserIdFromSub() userIdFromSub: string,
  ) {
    return await this.utxoWalletService.createWallet(
      userIdFromSub,
      network,
      networkType,
    );
  }
}
