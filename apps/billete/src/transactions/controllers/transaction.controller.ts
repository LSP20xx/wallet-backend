import { Controller, Get, Param } from '@nestjs/common';
import { TransactionsService } from '../services/transaction.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionService: TransactionsService) {}

  @Get(':userId')
  async getAllTransactions(@Param('userId') userId: string) {
    return this.transactionService.getAllTransactions(userId);
  }

  @Get(':userId/:transactionId')
  async getTransaction(
    @Param('userId') userId: string,
    @Param('transactionId') transactionId: string,
  ) {
    return this.transactionService.getTransaction(userId, transactionId);
  }
}

}
