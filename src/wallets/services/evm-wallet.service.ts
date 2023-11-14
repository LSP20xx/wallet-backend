import { Injectable } from '@nestjs/common';
import { Wallet, ChainType, Network } from '@prisma/client';
import { DatabaseService } from 'src/database/services/database/database.service';
import { EncryptionsService } from 'src/encryptions/services/encryptions.service';
import { GraphQueryService } from 'src/networks/services/graph-query.service';
import { Web3Service } from 'src/web3/services/web3.service';

@Injectable()
export class EvmWalletService {
  constructor(
    private web3Service: Web3Service,
    private encryptionService: EncryptionsService,
    private databaseService: DatabaseService,
    private graphQueryService: GraphQueryService,
  ) {}

  async findAll(): Promise<Wallet[]> {
    return this.databaseService.wallet.findMany();
  }

  async findOne(id: string): Promise<Wallet | null> {
    return this.databaseService.wallet.findUnique({
      where: { id },
    });
  }

  async findAllByChainId(chainId: string): Promise<Wallet[]> {
    return this.databaseService.wallet.findMany({
      where: { blockchain: { chainId } },
    });
  }

  async getTransfersForChain(chainId: string) {
    const wallets = await this.findAllByChainId(chainId);

    const addresses = wallets.map((wallet) => wallet.address);

    const graphqlQuery = `{
      transfers(where: {from_in: ${JSON.stringify(
        addresses,
      )}, to_in: ${JSON.stringify(addresses)}}) {
        id
        from
        to
        value
      }
    }`;
    const result = await this.graphQueryService.querySubgraph(graphqlQuery);

    return result;
  }

  async createWallet(userId: string, chainId: string): Promise<Wallet> {
    const blockchain = await this.databaseService.blockchain.findUnique({
      where: { chainId: chainId },
    });

    if (!blockchain) {
      throw new Error('Blockchain not found');
    }

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
        blockchain: { connect: { id: blockchain.id } },
        chainType: ChainType.EVM,
        network: chainId === '5' ? Network.TESTNET : Network.MAINNET,
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
