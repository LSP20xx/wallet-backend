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
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
// import { TransactionsService } from '../../transactions/services/transaction.service';
// import { Web3Service } from '../../web3/services/web3.service';
import { WithdrawDto } from '../dto/withdraw.dto';
import { EvmWalletService } from '../services/evm-wallet.service';
import { JobJson } from 'bullmq';

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
    @Param('chainId') chainId: string,
  ): Promise<Wallet> {
    return await this.walletService.createWallet(req.user.id, chainId);
  }

  @Post('withdraw/:chainId')
  @UseGuards(AuthenticatedGuard)
  async withdraw(
    @Request() req: any,
    @Param('chainId') chainId: string,
    @Body() withdrawDto: WithdrawDto,
  ): Promise<JobJson> {
    try {
      withdrawDto.userId = req.user.id;
      withdrawDto.chainId = chainId;
      console.log(withdrawDto);
      // const isUnlocked = this.web3Service.unlockWallet(
      //   chainId,
      //   sendTransactionDto.from,
      //   sendTransactionDto.encryptedPrivateKey,
      // );

      // if (!isUnlocked) {
      //   throw new HttpException(
      //     'No se pudo desbloquear la wallet.',
      //     HttpStatus.UNAUTHORIZED,
      //   );
      // }

      // const txHash = await this.web3Service.sendTransaction(
      //   chainId,
      //   sendTransactionDto,
      //   sendTransactionDto.encryptedPrivateKey,
      // );

      // const txData = {
      //   txHash,
      //   from: sendTransactionDto.from,
      //   to: sendTransactionDto.to,
      //   amount: sendTransactionDto.amount,
      // };

      // await this.transactionsService.saveTransaction(txData);

      // return txHash;
      return await this.walletService.withdraw(withdrawDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('transfers/:chainId')
  @UseGuards(AuthenticatedGuard)
  async getTransfersForChain(@Param('chainId') chainId: string) {
    try {
      const transfers = await this.walletService.getTransfersForChain(chainId);
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
