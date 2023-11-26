import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { ChainType, Network, Prisma, Wallet } from '@prisma/client';
import { Queue } from 'bullmq';
import { DatabaseService } from 'src/database/services/database/database.service';
import { GraphQueryService } from 'src/networks/services/graph-query.service';
import QueueType from '../queue/types.queue';
import { WithdrawDto } from '../dto/withdraw.dto';

@Injectable()
export class EvmWalletService {
  constructor(
    private databaseService: DatabaseService,
    private graphQueryService: GraphQueryService,
    @InjectQueue(QueueType.WITHDRAW_REQUEST) private withdrawQueue: Queue,
  ) {}

  async findAll(): Promise<Wallet[]> {
    return this.databaseService.wallet.findMany();
  }

  async findOne(id: string): Promise<Wallet | null> {
    return this.databaseService.wallet.findUnique({
      where: { id },
    });
  }

  async findAllByChainId(blockchainId: string): Promise<Wallet[]> {
    return this.databaseService.wallet.findMany({
      where: { blockchain: { blockchainId } },
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

  async createWallet(
    userId: string,
    blockchainId: string,
    transaction?: Prisma.TransactionClient,
  ): Promise<Wallet> {
    const walletContract = await this.databaseService.walletContract.findFirst({
      where: { blockchainId: blockchainId, reserved: false },
    });

    const blockchain = await this.databaseService.blockchain.findUnique({
      where: { blockchainId: blockchainId },
    });

    if (!walletContract) {
      throw new Error('No available wallets');
    }

    await transaction.walletContract.update({
      where: { id: walletContract.id },
      data: { reserved: true },
    });

    return transaction.wallet.create({
      data: {
        address: walletContract.address,
        balance: '0',
        user: { connect: { id: userId } },
        blockchain: { connect: { id: blockchain.id } },
        chainType: ChainType.EVM,
        network: blockchainId === '5' ? Network.TESTNET : Network.MAINNET,
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

  async withdraw(withdrawDto: WithdrawDto) {
    const withdrawRequest = await this.withdrawQueue.add('request', {
      withdrawDto,
    });

    return withdrawRequest.asJSON();
  }
}
