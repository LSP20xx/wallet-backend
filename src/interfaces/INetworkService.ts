import { TransactionDetails } from './ITransactionDetails';

interface NetworkService {
  getBalance(address: string): Promise<bigint>;
  getTransaction(txHash: string): Promise<any>;
  sendTransaction(details: TransactionDetails): Promise<string>;
}

export { NetworkService };
