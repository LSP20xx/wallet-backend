import { Controller } from '@nestjs/common';
import { TransactionsService } from '../services/transaction.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionService: TransactionsService) {}
}
