import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'apps/billete/src/database/services/database/database.service';
import { Transaction } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(private databaseService: DatabaseService) {}

  async getAllTransactions(userId: string): Promise<Transaction[]> {
    return this.databaseService.transaction.findMany({
      where: {
        userId: userId,
      },
    });
  }

  async getTransaction(
    userId: string,
    transactionId: string,
  ): Promise<Transaction | null> {
    return this.databaseService.transaction.findFirst({
      where: {
        AND: [{ userId: userId }, { id: transactionId }],
      },
    });
  }

  async saveTransaction(txData: any): Promise<Transaction> {
    const transaction = await this.databaseService.transaction.create({
      data: txData,
    });
    return transaction;
  }
}
