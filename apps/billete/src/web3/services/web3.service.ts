// src/web3/web3.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EncryptionsService } from 'apps/billete/src/encryptions/services/encryptions.service';
import { TransactionDetails } from 'apps/billete/src/interfaces/ITransactionDetails';
import Web3, { TransactionReceipt } from 'web3';

@Injectable()
export class Web3Service {
  private web3Instances = new Map<string, Web3>();

  constructor(
    private readonly configService: ConfigService,
    private readonly encryptionService: EncryptionsService,
  ) {}

  getWeb3Instance(blockchainId: string): Web3 {
    let web3 = this.web3Instances.get(blockchainId);

    if (!web3) {
      const rpcUrl = this.configService.get<string>(`RPC_URL_${blockchainId}`);
      if (!rpcUrl) {
        throw new Error(
          `RPC URL for blockchainId ${blockchainId} is not configured.`,
        );
      }
      web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
      this.web3Instances.set(blockchainId, web3);
    }

    return web3;
  }

  getBalance(blockchainId: string, address: string): Promise<bigint> {
    return this.getWeb3Instance(blockchainId).eth.getBalance(address);
  }

  getTransaction(blockchainId: string, txHash: string): Promise<any> {
    return this.getWeb3Instance(blockchainId).eth.getTransaction(txHash);
  }

  async sendTransaction(
    blockchainId: string,
    details: TransactionDetails,
    encryptedPrivateKey: string,
  ): Promise<string> {
    const web3 = this.getWeb3Instance(blockchainId);
    const privateKey = this.encryptionService.decrypt(encryptedPrivateKey);
    const gasPrice = await this.getGasPrice(blockchainId);

    const gas = await this.estimateGas(
      blockchainId,
      details.from,
      details.to,
      details.amount.toString(),
    );

    const transaction = {
      from: details.from,
      to: details.to,
      value: web3.utils.toWei(details.amount.toString(), 'ether'),
      gas,
      gasPrice,
    };

    const signedTransaction = await web3.eth.accounts.signTransaction(
      transaction,
      privateKey,
    );

    const receipt = await web3.eth.sendSignedTransaction(
      signedTransaction.rawTransaction,
    );

    const txHash = '0x' + receipt.transactionHash.slice(2);
    return txHash;
  }

  async getGasPrice(blockchainId: string): Promise<bigint> {
    return await this.getWeb3Instance(blockchainId).eth.getGasPrice();
  }

  async estimateGas(
    blockchainId: string,
    from: string,
    to: string,
    value: string,
  ): Promise<bigint> {
    const web3 = this.getWeb3Instance(blockchainId);
    const gasEstimate = await web3.eth.estimateGas({
      from,
      to,
      value: web3.utils.toWei(value, 'ether'),
    });
    return gasEstimate;
  }

  async getTransactionCount(
    blockchainId: string,
    address: string,
  ): Promise<bigint> {
    return await this.getWeb3Instance(blockchainId).eth.getTransactionCount(
      address,
    );
  }

  async getTransactionReceipt(
    blockchainId: string,
    txHash: string,
  ): Promise<TransactionReceipt> {
    return await this.getWeb3Instance(blockchainId).eth.getTransactionReceipt(
      txHash,
    );
  }

  createWallet(blockchainId: string): {
    address: string;
    encryptedPrivateKey: string;
  } {
    const account = this.getWeb3Instance(blockchainId).eth.accounts.create();
    const encryptedData = this.encryptionService.encrypt(account.privateKey);

    return {
      address: account.address,
      encryptedPrivateKey: encryptedData,
    };
  }
  unlockWallet(
    blockchainId: string,
    address: string,
    encryptedPrivateKey: string,
  ): boolean {
    try {
      const privateKey = this.encryptionService.decrypt(encryptedPrivateKey);
      const web3 = this.getWeb3Instance(blockchainId);

      const account = web3.eth.accounts.privateKeyToAccount(privateKey);
      if (account.address.toLowerCase() !== address.toLowerCase()) {
        console.error('The private key does not match the provided address.');
        return false;
      }

      web3.eth.accounts.wallet.add(account);
      return true;
    } catch (error) {
      console.error('Error unlocking wallet:', error);
      return false;
    }
  }
}
