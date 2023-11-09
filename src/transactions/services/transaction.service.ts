import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/services/database/database.service';
import { Transaction } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(private databaseService: DatabaseService) {}

  async saveTransaction(txData: any): Promise<Transaction> {
    const transaction = await this.databaseService.transaction.create({
      data: txData,
    });
    return transaction;
  }
}
