import { Injectable } from '@nestjs/common';
import { Wallet } from '@prisma/client';
import { DatabaseService } from 'src/database/services/database/database.service';
import { EncryptionsService } from 'src/encryptions/services/encryptions.service';
import { Web3Service } from 'src/web3/services/web3.service';

@Injectable()
export class WalletsService {
  constructor(
    private web3Service: Web3Service,
    private encryptionService: EncryptionsService,
    private databaseService: DatabaseService,
  ) {}

  async findAll(): Promise<Wallet[]> {
    return this.databaseService.wallet.findMany();
  }

  async findOne(id: string): Promise<Wallet | null> {
    return this.databaseService.wallet.findUnique({
      where: { id },
    });
  }

  async createWallet(userId: string, chainId: string): Promise<Wallet> {
    const chain = await this.databaseService.evmChain.findUnique({
      where: { chainId: chainId },
    });
    console.log(chain);

    const account = this.web3Service
      .getWeb3Instance(chainId)
      .eth.accounts.create();
    const encryptedPrivateKeyObject = this.encryptionService.encrypt(
      account.privateKey,
    );

    const encryptedPrivateKey = `${encryptedPrivateKeyObject.encryptedData}:${encryptedPrivateKeyObject.iv}`;

    return this.databaseService.wallet.create({
      data: {
        address: account.address,
        encryptedPrivateKey: encryptedPrivateKey,
        balance: '0',
        user: { connect: { id: userId } },
        chain: { connect: { id: chain.id } },
      },
    });
  }

  async update(id: string, walletData: Partial<Wallet>): Promise<Wallet> {
    return this.databaseService.wallet.update({
      where: { id },
      data: walletData,
    });
  }

  async remove(id: string): Promise<void> {
    await this.databaseService.wallet.delete({
      where: { id },
    });
  }
}
