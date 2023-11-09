import { Module } from '@nestjs/common';
import { TransactionsService } from './services/transaction.service';

@Module({
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
