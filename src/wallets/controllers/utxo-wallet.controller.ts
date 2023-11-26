import { Controller, Param, Post, Request, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { UtxoWalletService } from '../services/utxo-wallet.service';

@Controller('utxo-wallet')
export class UtxoWalletController {
  constructor(private readonly utxoWalletService: UtxoWalletService) {}
  @Post('create/:network/:newtorkType')
  @UseGuards(AuthenticatedGuard)
  async createWallet(
    @Request() req: any,
    @Param('network') network: string,
    @Param('networkType') networkType: string,
  ) {
    return await this.utxoWalletService.createWallet(
      req.user.id,
      network,
      networkType,
    );
  }
}
