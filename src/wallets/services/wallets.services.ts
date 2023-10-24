// wallet.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalletsEntity } from '../entities/wallets.entity';
import { FindOneOptions } from 'typeorm';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(WalletsEntity)
    private walletRepository: Repository<WalletsEntity>,
  ) {}

  async findAll(): Promise<WalletsEntity[]> {
    return this.walletRepository.find();
  }

  async findOne(
    options: FindOneOptions<WalletsEntity>,
  ): Promise<WalletsEntity> {
    return this.walletRepository.findOne(options);
  }

  async create(wallet: WalletsEntity): Promise<WalletsEntity> {
    return this.walletRepository.save(wallet);
  }

  async update(id: string, wallet: WalletsEntity): Promise<WalletsEntity> {
    return this.walletRepository.save({ ...wallet, walletID: id });
  }

  async remove(id: string): Promise<void> {
    await this.walletRepository.delete(id);
  }
}
