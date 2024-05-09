import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { ChainType, Network, Prisma, Wallet } from '@prisma/client';
import { Queue } from 'bullmq';
import { DatabaseService } from 'apps/billete/src/database/services/database/database.service';
import { GraphQueryService } from 'apps/billete/src/networks/services/graph-query.service';
import QueueType from '../queue/types.queue';
import { WithdrawDto } from '../dto/withdraw.dto';
import { v4 as uuidv4 } from 'uuid';
import { Web3Service } from 'apps/billete/src/web3/services/web3.service';
import { ConfigService } from '@nestjs/config';

const coinsConfig = {
  ETH: {
    decimals: 18,
    companyFee: '0.0027',
  },
};

const isNativeCoin = (coin: any) => {
  return coin in coinsConfig;
};

@Injectable()
export class EvmWalletService {
  private allowedChains: string[] = [];

  constructor(
    private databaseService: DatabaseService,
    private graphQueryService: GraphQueryService,
    private web3Service: Web3Service,
    private configService: ConfigService,

    @InjectQueue(QueueType.WITHDRAW_REQUEST) private withdrawQueue: Queue,
    @InjectQueue(QueueType.ETH_TRANSACTIONS) private transactionQueue: Queue,
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
    const currentBlock = await this.web3Service
      .getWeb3Instance(chainId)
      .eth.getBlockNumber();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const previousBlock = currentBlock - BigInt(1);
    const wallets = await this.findAllByChainId(chainId);
    const addresses = wallets.map((wallet) => wallet.address);

    const batchSize = 50;
    const batches = [];

    for (let i = 0; i < addresses.length; i += batchSize) {
      batches.push(addresses.slice(i, i + batchSize));
    }

    const transfers = [];

    for (const batch of batches) {
      const formattedAddresses = batch
        .map((address: any) => `"${address}"`)
        .join(', ');
      //          transfers(where: {to_in: [${formattedAddresses}], blockNumber_gt: "${previousBlock}"}) {

      const graphqlQuery = `{
          transfers(where: {to_in: [${formattedAddresses}]}) {
            id
            from
            to
            value
            blockNumber
          }
        }`;
      const result = await this.graphQueryService.querySubgraph(graphqlQuery);
      transfers.push(...(result.data.transfers || []));
    }

    return transfers;
  }
  async createWallet(
    userId: string,
    blockchainId: string,
    transaction: Prisma.TransactionClient,
    networkType: string,
    symbol: string,
  ) {
    const tokens = await this.databaseService.token.findMany();

    const walletContract = await this.databaseService.walletContract.findFirst({
      where: { blockchainId, reserved: false },
    });
    if (!walletContract) throw new Error('No available wallets');

    const billetePlatform = await this.databaseService.platform.findUnique({
      where: { name: 'Billete' },
    });
    const krakenPlatform = await this.databaseService.platform.findUnique({
      where: { name: 'Kraken' },
    });
    const blockchain = await this.databaseService.blockchain.findUnique({
      where: { blockchainId },
    });
    if (!billetePlatform || !krakenPlatform || !blockchain)
      throw new Error('Required platform or blockchain not found');

    const billeteWalletId = uuidv4();
    const krakenWalletId = uuidv4();

    await transaction.walletContract.update({
      where: { id: walletContract.id },
      data: { reserved: true },
    });

    await transaction.wallet.create({
      data: {
        id: krakenWalletId,
        address: walletContract.address,
        balance: '0',
        user: { connect: { id: userId } },
        blockchain: { connect: { id: blockchain.id } },
        chainType: ChainType.EVM,
        network: networkType === 'MAINNET' ? Network.MAINNET : Network.TESTNET,
        platform: { connect: { id: krakenPlatform.id, name: 'Kraken' } },
        platformName: 'Kraken',

        symbol: symbol,
      },
    });

    await transaction.wallet.create({
      data: {
        id: billeteWalletId,
        balance: '0',
        user: { connect: { id: userId } },
        blockchain: { connect: { id: blockchain.id } },
        chainType: ChainType.EVM,
        network: networkType === 'MAINNET' ? Network.MAINNET : Network.TESTNET,
        platform: {
          connect: { id: billetePlatform.id, name: 'Billete' },
        },
        platformName: 'Billete',
        symbol: symbol,
      },
    });

    const tokensWithContractAddress = tokens.filter(
      (token) => token.contractAddress !== '',
    );

    for (const token of tokensWithContractAddress) {
      await transaction.walletToken.create({
        data: {
          walletId: billeteWalletId,
          tokenId: token.id,
          balance: '0',
          platformId: billetePlatform.id,
          platformName: 'Billete',
          symbol: token.symbol,
        },
      });
      await transaction.walletToken.create({
        data: {
          walletId: krakenWalletId,
          tokenId: token.id,
          balance: '0',
          platformId: krakenPlatform.id,
          platformName: 'Kraken',
          symbol: token.symbol,
        },
      });
    }
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

  async withdraw(withdrawDto: WithdrawDto): Promise<{ message: string }> {
    const companyFee = coinsConfig[withdrawDto.coin].companyFee;
    const wallet = await this.databaseService.wallet.findFirst({
      where: { address: withdrawDto.from },
    });
    if (!wallet || wallet.userId !== withdrawDto.userId) {
      throw new Error('Wallet not found');
    }
    await this.transactionQueue.add(
      'transaction',
      {
        amount: withdrawDto.amount.toString(),
        from: withdrawDto.from,
        to: withdrawDto.to,
        transactionType: 'WITHDRAWAL',
        status: 'PROCESSING',
        chainType: 'EVM',
        blockchainId: withdrawDto.blockchainId,
        walletId: wallet.id,
        userId: withdrawDto.userId,
        network: withdrawDto.blockchainId === '1' ? 'MAINNET' : 'TESTNET',
        coin: withdrawDto.coin,
        isNativeCoin: isNativeCoin(withdrawDto.coin),
        companyFee: companyFee,
        uuid: uuidv4(),
      },
      {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    );
    return { message: 'Withdrawal request received and is being processed' };
  }
}
