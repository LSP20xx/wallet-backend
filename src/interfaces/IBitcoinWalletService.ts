// src/interfaces/IBitcoinWalletService.ts

import { Wallet } from '@prisma/client';

export interface IBitcoinWalletService {
  createWallet(userId: string, network: string): Promise<Wallet>;
}
