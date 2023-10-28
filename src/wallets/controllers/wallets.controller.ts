// wallet.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { WalletsEntity } from '../entities/wallets.entity';
import { FindOneOptions } from 'typeorm';
import { WalletsService } from '../services/wallets.service';
@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletService: WalletsService) {}

  @Get()
  findAll(): Promise<WalletsEntity[]> {
    return this.walletService.findAll();
  }

  @Get(':id')
  findOne(
    @Param() options: FindOneOptions<WalletsEntity>,
  ): Promise<WalletsEntity> {
    return this.walletService.findOne(options);
  }

  @Post()
  create(@Body() wallet: WalletsEntity): Promise<WalletsEntity> {
    return this.walletService.create(wallet);
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
