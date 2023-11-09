import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Get,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';

import { Web3Service } from '../../web3/services/web3.service';
import { SendTransactionDto } from '../dto/send-transaction.dto';
import { WalletsService } from '../services/wallets.service';
import { TransactionsService } from '../../transactions/services/transaction.service';
import { AuthGuard } from '@nestjs/passport';
import { Wallet } from '@prisma/client';
import { CreateWalletDto } from '../dto/create-wallet.dto';

@Controller('evm-wallets')
export class WalletsController {
  constructor(
    private readonly walletService: WalletsService,
    private readonly web3Service: Web3Service,
    private readonly transactionsService: TransactionsService,
  ) {}

  @Get()
  findAll(): Promise<Wallet[]> {
    return this.walletService.findAll();
  }
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Wallet | null> {
    return await this.walletService.findOne(id);
  }

  // Crear un nuevo monedero
  @Post(':chainId')
  async createWallet(
    @Param('chainId') chainId: string,
    @Body() createWalletDto: CreateWalletDto,
  ): Promise<Wallet> {
    return await this.walletService.createWallet(
      chainId,
      createWalletDto.userId,
      createWalletDto.networkId,
    );
  }
  @Post(':chainId/send')
  @UseGuards(AuthGuard('jwt'))
  async send(
    @Param('chainId') chainId: string,
    @Body() sendTransactionDto: SendTransactionDto,
  ): Promise<string> {
    try {
      const isUnlocked = this.web3Service.unlockWallet(
        chainId,
        sendTransactionDto.from,
        sendTransactionDto.encryptedPrivateKey,
      );

      if (!isUnlocked) {
        throw new HttpException(
          'No se pudo desbloquear la wallet.',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const txHash = await this.web3Service.sendTransaction(
        chainId,
        sendTransactionDto,
        sendTransactionDto.encryptedPrivateKey,
      );

      const txData = {
        txHash,
        from: sendTransactionDto.from,
        to: sendTransactionDto.to,
        amount: sendTransactionDto.amount,
      };

      await this.transactionsService.saveTransaction(txData);

      return txHash;
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
