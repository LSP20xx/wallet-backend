// tradeOrder.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { TradeOrdersEntity } from '../entities/trade-orders.entity';

@Injectable()
export class TradeOrdersService {
  constructor(
    @InjectRepository(TradeOrdersEntity)
    private tradeOrdersRepository: Repository<TradeOrdersEntity>,
  ) {}

  findAll(): Promise<TradeOrdersEntity[]> {
    return this.tradeOrdersRepository.find();
  }

  findOne(
    options: FindOneOptions<TradeOrdersEntity>,
  ): Promise<TradeOrdersEntity | undefined> {
    return this.tradeOrdersRepository.findOne(options);
  }

  create(tradeOrder: TradeOrdersEntity): Promise<TradeOrdersEntity> {
    return this.tradeOrdersRepository.save(tradeOrder);
  }

  update(
    id: string,
    tradeOrder: TradeOrdersEntity,
  ): Promise<TradeOrdersEntity> {
    return this.tradeOrdersRepository.save({ ...tradeOrder, orderID: id });
  }

  async remove(id: string): Promise<void> {
    await this.tradeOrdersRepository.delete(id);
  }
}
