import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalletsEntity } from '../entities/wallets.entity';
import { FindOneOptions } from 'typeorm';
import { Web3Service } from 'src/web3/services/web3.service';
import { EncryptionsService } from 'src/encryptions/services/encryptions.service';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(WalletsEntity)
    private walletRepository: Repository<WalletsEntity>,
    private web3Service: Web3Service,
    private encryptionService: EncryptionsService,
  ) {}

  async findAll(): Promise<WalletsEntity[]> {
    return this.walletRepository.find();
  }

  async findOne(
    options: FindOneOptions<WalletsEntity>,
  ): Promise<WalletsEntity> {
    return this.walletRepository.findOne(options);
  }

  async createWallet(chainId: string): Promise<WalletsEntity> {
    const account = this.web3Service
      .getWeb3Instance(chainId)
      .eth.accounts.create();
    const encryptedPrivateKeyObject = this.encryptionService.encrypt(
      account.privateKey,
    );

    const encryptedPrivateKey = `${encryptedPrivateKeyObject.encryptedData}:${encryptedPrivateKeyObject.iv}`;

    const newWallet = this.walletRepository.create({
      address: account.address,
      encryptedPrivateKey: encryptedPrivateKey,
    });

    return this.walletRepository.save(newWallet);
  }

  async update(id: string, wallet: WalletsEntity): Promise<WalletsEntity> {
    return this.walletRepository.save({ ...wallet, walletID: id });
  }

  async remove(id: string): Promise<void> {
    await this.walletRepository.delete(id);
  }
}
