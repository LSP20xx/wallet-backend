import { Injectable } from '@nestjs/common';
import { ChainType, Network, Prisma, Wallet } from '@prisma/client';
import { networks, payments, Psbt } from 'bitcoinjs-lib';
import { ECPairFactory, ECPairInterface } from 'ecpair';
import * as tinysecp from 'tiny-secp256k1';
import { DatabaseService } from 'apps/billete/src/database/services/database/database.service';
import { EncryptionsService } from 'apps/billete/src/encryptions/services/encryptions.service';
import { IUtxoWalletService } from '../../interfaces/IUtxoWalletService';
import { TransactionsService } from 'apps/billete/src/transactions/services/transaction.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { v4 as uuidv4 } from 'uuid';
import QueueType from '../queue/types.queue';

@Injectable()
export class UtxoWalletService implements IUtxoWalletService {
  private ECPair = ECPairFactory(tinysecp);
  constructor(
    private databaseService: DatabaseService,
    private encryptionService: EncryptionsService,
    private transactionsService: TransactionsService,
    @InjectQueue(QueueType.BTC_TRANSACTIONS) private transactionQueue: Queue,
  ) {}

  private getNetworksConfig(coinType: string, networkType: string) {
    const networksConfig = {
      bitcoin: {
        mainnet: networks.bitcoin,
        testnet: networks.testnet,
      },
      litecoin: {
        mainnet: {
          messagePrefix: '\x19Litecoin Signed Message:\n',
          bech32: 'ltc',
          bip32: {
            public: 0x019da462,
            private: 0x019d9cfe,
          },
          pubKeyHash: 0x30,
          scriptHash: 0x32,
          wif: 0xb0,
        },
        testnet: {
          messagePrefix: '\x19Litecoin Signed Message:\n',
          bech32: 'tltc',
          bip32: {
            public: 0x0436f6e1,
            private: 0x0436ef7d,
          },
          pubKeyHash: 0x6f,
          scriptHash: 0x3a,
          wif: 0xef,
        },
      },
      dogecoin: {
        mainnet: {
          name: 'livenet',
          messagePrefix: '\x19Dogecoin Signed Message:\n',
          bip32: {
            public: 0x02facafd,
            private: 0x02fac398,
          },
          pubKeyHash: 0x1e,
          scriptHash: 0x16,
          wif: 0x9e,
        },
        testnet: {
          name: 'testnet',
          messagePrefix: '\x19Dogecoin Signed Message:\n',
          bip32: {
            public: 0x043587cf,
            private: 0x04358394,
          },
          pubKeyHash: 0x71,
          scriptHash: 0xc4,
          wif: 0xf1,
        },
      },
    };
    return networksConfig[coinType]?.[networkType] || null;
  }

  private getChainTypeEnum(coinType: string): ChainType {
    switch (coinType.toLowerCase()) {
      case 'bitcoin':
        return ChainType.UTXO;
      case 'litecoin':
        return ChainType.UTXO;
      case 'dogecoin':
        return ChainType.UTXO;
      default:
        throw new Error(`Tipo de moneda no soportado: ${coinType}`);
    }
  }

  async createWallet(
    userId: string,
    coinType: string,
    networkType: string,
    symbol: string,
    transaction?: Prisma.TransactionClient,
  ): Promise<{ billeteWallet: Wallet; krakenWallet: Wallet }> {
    const netConfig = this.getNetworksConfig(coinType, networkType);

    if (!netConfig) {
      throw new Error(
        `Configuración de red no encontrada para ${coinType} en ${networkType}`,
      );
    }

    const keyPair = this.ECPair.makeRandom({ network: netConfig });
    const address = payments.p2pkh({
      pubkey: keyPair.publicKey,
      network: netConfig,
    }).address;

    const chainTypeEnum = this.getChainTypeEnum(coinType);
    const blockchainId = `${coinType.toUpperCase()}-${networkType.toUpperCase()}`;
    const blockchain = await this.databaseService.blockchain.findUnique({
      where: { blockchainId: blockchainId },
    });

    const privateKey = keyPair.toWIF();
    const encryptedPrivateKey = this.encryptionService.encrypt(privateKey);

    const platforms = await this.databaseService.platform.findMany({
      where: {
        name: {
          in: ['Billete', 'Kraken'],
        },
      },
    });

    const billetePlatformId = platforms.find((p) => p.name === 'Billete')?.id;
    const krakenPlatformId = platforms.find((p) => p.name === 'Kraken')?.id;

    const billeteWalletData = {
      data: {
        address: address,
        encryptedPrivateKey: encryptedPrivateKey,
        balance: '0',
        user: { connect: { id: userId } },
        chainType: chainTypeEnum,
        network: networkType === 'mainnet' ? Network.MAINNET : Network.TESTNET,
        blockchain: { connect: { id: blockchain.id } },
        platform: {
          connect: { id: billetePlatformId },
        },
        platformName: 'Billete',
        symbol: symbol,
      },
    };

    const krakenWalletData = {
      data: {
        balance: '0',
        user: { connect: { id: userId } },
        chainType: chainTypeEnum,
        network: networkType === 'mainnet' ? Network.MAINNET : Network.TESTNET,
        blockchain: { connect: { id: blockchain.id } },
        platform: { connect: { id: krakenPlatformId } },
        symbol: symbol,
        platformName: 'Kraken',
      },
    };

    if (transaction) {
      const krakenWallet = await transaction.wallet.create(krakenWalletData);
      const billeteWallet = await transaction.wallet.create(billeteWalletData);
      return { billeteWallet, krakenWallet };
    } else {
      const krakenWallet =
        await this.databaseService.wallet.create(krakenWalletData);
      const billeteWallet =
        await this.databaseService.wallet.create(billeteWalletData);
      return { billeteWallet, krakenWallet };
    }
  }

  async withdraw(withdrawDto: any): Promise<{ message: string }> {
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
        fee: withdrawDto.fee.toString(),
        feePrice: withdrawDto.feePrice.toString(),
        from: withdrawDto.from,
        to: withdrawDto.to,
        transactionType: 'WITHDRAWAL',
        status: 'PROCESSING',
        chainType: 'UTXO',
        blockchainId: withdrawDto.blockchainId,
        walletId: wallet.id,
        userId: withdrawDto.userId,
        network: withdrawDto.blockchainId === 'MAINNET' ? 'MAINNET' : 'TESTNET',
        coin: withdrawDto.coin,
        isNativeCoin: true,
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

  async unlockWallet(
    encryptedPrivateKey: string,
    netConfig: any,
  ): Promise<ECPairInterface | null> {
    try {
      const decryptedPrivateKey =
        this.encryptionService.decrypt(encryptedPrivateKey);
      const keyPair = this.ECPair.fromWIF(decryptedPrivateKey, netConfig);
      return keyPair;
    } catch (error) {
      console.error('Error al desbloquear la wallet:', error);
      return null;
    }
  }

  async sendTransaction(
    coinType: string,
    networkType: string,
    fromAddress: string,
    toAddress: string,
    amount: number,
    encryptedPrivateKey: string,
    utxos: { txId: string; index: number; value: number }[],
  ): Promise<string> {
    const netConfig = this.getNetworksConfig(coinType, networkType);

    if (!netConfig) {
      throw new Error(
        `Configuración de red no encontrada para ${coinType} en ${networkType}`,
      );
    }

    const decryptedPrivateKey =
      this.encryptionService.decrypt(encryptedPrivateKey);
    const keyPair = this.ECPair.fromWIF(decryptedPrivateKey, netConfig);

    const psbt = new Psbt({ network: netConfig });
    let totalUtxoValue = 0;
    utxos.forEach((utxo) => {
      psbt.addInput({
        hash: utxo.txId,
        index: utxo.index,
      });
      totalUtxoValue += utxo.value;
    });

    const estimatedTxSize = utxos.length * 180 + 2 * 34 + 10;
    const fee = await this.getTransactionFee(coinType, estimatedTxSize);

    psbt.addOutput({
      address: toAddress,
      value: amount,
    });

    const change = totalUtxoValue - amount - fee;
    if (change > 0) {
      psbt.addOutput({ address: fromAddress, value: change });
    }

    psbt.signAllInputs(keyPair);
    psbt.finalizeAllInputs();
    const txHex = psbt.extractTransaction().toHex();

    const txData = {
      txHash: txHex,
      from: fromAddress,
      to: toAddress,
      amount: amount,
    };
    await this.transactionsService.saveTransaction(txData);

    return txHex;
  }

  async getTransactionFee(coinType: string, txSizeInBytes: number) {
    const url = `https://api.blockcypher.com/v1/${coinType}/main`;
    const response = await fetch(url);
    const data = await response.json();

    const feePerKb = data.medium_fee_per_kb;
    const feePerByte = feePerKb / 1024;
    const totalFee = feePerByte * txSizeInBytes;

    return totalFee;
  }
}
