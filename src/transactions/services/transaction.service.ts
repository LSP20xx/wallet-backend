import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionEntity } from '../entities/transaction.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
  ) {}
  async saveTransaction(txData: any): Promise<TransactionEntity> {
    const transaction = this.transactionRepository.create(txData);
    const savedTransactions =
      await this.transactionRepository.save(transaction);
    return Array.isArray(savedTransactions)
      ? savedTransactions[0]
      : savedTransactions;
  }
}
