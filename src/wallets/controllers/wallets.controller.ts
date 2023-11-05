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
} from '@nestjs/common';

import { Web3Service } from '../../web3/services/web3.service';
import { SendTransactionDto } from '../dto/send-transaction.dto';
import { WalletsEntity } from '../entities/wallets.entity';
import { WalletsService } from '../services/wallets.service';
import { TransactionsService } from '../../transactions/services/transaction.service';

@Controller('evm-wallets')
export class WalletsController {
  constructor(
    private readonly walletService: WalletsService,
    private readonly web3Service: Web3Service,
    private readonly transactionsService: TransactionsService,
  ) {}

  @Get()
  findAll(): Promise<WalletsEntity[]> {
    return this.walletService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<WalletsEntity> {
    return this.walletService.findOne({ where: { id } });
  }

  @Post(':chainId')
  createWallet(@Param('chainId') chainId: string): Promise<WalletsEntity> {
    return this.walletService.createWallet(chainId);
  }

  @Post(':chainId/send')
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
  update(
    @Param('id') id: string,
    @Body() wallet: WalletsEntity,
  ): Promise<WalletsEntity> {
    return this.walletService.update(id, wallet);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.walletService.remove(id);
  }
}
