import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';

import { Wallet } from '@prisma/client';
import { AuthenticatedGuard } from 'apps/billete/src/auth/guards/authenticated.guard';
// import { TransactionsService } from '../../transactions/services/transaction.service';
// import { Web3Service } from '../../web3/services/web3.service';
import { WithdrawDto } from '../dto/withdraw.dto';
import { EvmWalletService } from '../services/evm-wallet.service';

@Controller('evm-wallet')
export class EvmWalletController {
  constructor(private readonly walletService: EvmWalletService) {}

  @Get()
  @UseGuards(AuthenticatedGuard)
  findAll(@Request() req: any): Promise<Wallet[]> {
    console.log(req.user);
    return this.walletService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Wallet | null> {
    return await this.walletService.findOne(id);
  }

  @Post('create/:chainId')
  @UseGuards(AuthenticatedGuard)
  async createWallet(
    @Request() req: any,
    @Param('blockchainId') blockchainId: string,
  ): Promise<Wallet> {
    return await this.walletService.createWallet(req.user.id, blockchainId);
  }

  @Post('withdraw')
  // @UseGuards(AuthenticatedGuard)
  async withdraw(
    @Body() withdrawDto: WithdrawDto,
  ): Promise<{ message: string }> {
    try {
      return await this.walletService.withdraw(withdrawDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('transfers/:blockchainId')
  @UseGuards(AuthenticatedGuard)
  async getTransfersForChain(@Param('blockchainId') blockchainId: string) {
    try {
      const transfers =
        await this.walletService.getTransfersForChain(blockchainId);
      return transfers;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() wallet: Wallet): Promise<Wallet> {
    return this.walletService.update(id, wallet);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.walletService.remove(id);
  }
}
