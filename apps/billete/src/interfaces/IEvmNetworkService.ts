import { TransactionDetails } from './ITransactionDetails';

interface EvmNetworkService {
  getGasPrice(): Promise<bigint>;
  getTransactionCount(address: string): Promise<bigint>;
  getTransactionReceipt(txHash: string): Promise<any>;
  getBalance(chainId: string, address: string): Promise<bigint>;
  getTransaction(txHash: string): Promise<any>;
  sendTransaction(details: TransactionDetails): Promise<string>;
}

export { EvmNetworkService };
