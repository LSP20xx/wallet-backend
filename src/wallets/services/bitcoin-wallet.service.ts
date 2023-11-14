import { Injectable } from '@nestjs/common';
import { IBitcoinWalletService } from '../../interfaces/IBitcoinWalletService';
import { PrivateKey, Networks } from 'bitcore-lib';
import { DatabaseService } from 'src/database/services/database/database.service';
import { ChainType, Network, Wallet } from '@prisma/client';
import { EncryptionsService } from 'src/encryptions/services/encryptions.service';

@Injectable()
export class BitcoinWalletService implements IBitcoinWalletService {
  constructor(
    private databaseService: DatabaseService,
    private encryptionService: EncryptionsService,
  ) {}

  async createWallet(userId: string, network: string): Promise<Wallet> {
    const net = network === 'testnet' ? Networks.testnet : Networks.mainnet;
    const privateKey = new PrivateKey(null, net);
    const address = privateKey.toAddress();

    // Encrypt the private key
    const encryptedPrivateKeyObject = this.encryptionService.encrypt(
      privateKey.toString(),
    );
    const encryptedPrivateKey = `${encryptedPrivateKeyObject.encryptedData}:${encryptedPrivateKeyObject.iv}`;

    return this.databaseService.wallet.create({
      data: {
        address: address.toString(),
        encryptedPrivateKey: encryptedPrivateKey,
        balance: '0',
        user: { connect: { id: userId } },
        chainType: ChainType.BTC,
        network: network === 'mainnet' ? Network.MAINNET : Network.TESTNET,
      },
    });
  }
}
