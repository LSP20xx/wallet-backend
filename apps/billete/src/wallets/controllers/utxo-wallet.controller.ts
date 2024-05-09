import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedGuard } from 'apps/billete/src/auth/guards/authenticated.guard';
import { UtxoWalletService } from '../services/utxo-wallet.service';
import { WithdrawDto } from '../dto/withdraw.dto';

@Controller('utxo-wallet')
export class UtxoWalletController {
  constructor(private readonly utxoWalletService: UtxoWalletService) {}
  // @Post('create/:network/:newtorkType')
  // @UseGuards(AuthenticatedGuard)
  // async createWallet(
  //   @Request() req: any,
  //   @Param('network') network: string,
  //   @Param('networkType') networkType: string,
  // ) {
  //   return await this.utxoWalletService.createWallet(
  //     req.user.id,
  //     network,
  //     networkType,
  //   );
  // }

  @Post('withdraw/:blockchainId')
  @UseGuards(AuthenticatedGuard)
  async withdraw(
    @Request() req: any,
    @Param('blockchainId') blockchainId: string,
    @Body() withdrawDto: WithdrawDto,
  ): Promise<{ message: string }> {
    try {
      withdrawDto.userId = req.user.id;
      withdrawDto.blockchainId = blockchainId;
      return await this.utxoWalletService.withdraw(withdrawDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
