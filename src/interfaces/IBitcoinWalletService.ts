// src/interfaces/IBitcoinWalletService.ts

export interface IBitcoinWalletService {
  createWallet(
    network: string,
  ): Promise<{ address: string; privateKey: string }>;
}
