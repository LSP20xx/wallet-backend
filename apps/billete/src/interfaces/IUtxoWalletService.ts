// src/interfaces/IBitcoinWalletService.ts

import { Wallet } from '@prisma/client';

export interface IUtxoWalletService {
  createWallet(
    userId: string,
    network: string,
    networkType: string,
  ): Promise<Wallet>;
}
