import { Module } from '@nestjs/common';
import { TransactionsService } from './services/transaction.service';
import { TransactionsController } from './controllers/transaction.controller'; // Import the controller

@Module({
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
