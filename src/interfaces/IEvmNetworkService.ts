import { NetworkService } from './INetworkService';

interface EvmNetworkService extends NetworkService {
  getGasPrice(): Promise<bigint>;
  getTransactionCount(address: string): Promise<bigint>;
  getTransactionReceipt(txHash: string): Promise<any>;
}

export { EvmNetworkService };
