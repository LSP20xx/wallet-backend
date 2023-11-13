// src/wallets/services/bitcoin-wallet.service.ts

import { Injectable } from '@nestjs/common';
import { IBitcoinWalletService } from '../../interfaces/IBitcoinWalletService';
import { PrivateKey, Networks } from 'bitcore-lib';

@Injectable()
export class BitcoinWalletService implements IBitcoinWalletService {
  async createWallet(
    network: string,
  ): Promise<{ address: string; privateKey: string }> {
    const net = network === 'testnet' ? Networks.testnet : Networks.mainnet;
    const privateKey = new PrivateKey(null, net);
    const address = privateKey.toAddress();

    return {
      privateKey: privateKey.toString(),
      address: address.toString(),
    };
  }
}
