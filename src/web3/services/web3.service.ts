// src/web3/web3.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EncryptionsService } from 'src/encryptions/services/encryptions.service';
import { TransactionDetails } from 'src/interfaces/ITransactionDetails';
import Web3, { TransactionReceipt } from 'web3';

@Injectable()
export class Web3Service {
  private web3Instances = new Map<string, Web3>();

  constructor(
    private readonly configService: ConfigService,
    private readonly encryptionService: EncryptionsService,
  ) {}

  getWeb3Instance(chainId: string): Web3 {
    let web3 = this.web3Instances.get(chainId);

    if (!web3) {
      const rpcUrl = this.configService.get<string>(`RPC_URL_${chainId}`);
      if (!rpcUrl) {
        throw new Error(`RPC URL for chainId ${chainId} is not configured.`);
      }
      web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
      this.web3Instances.set(chainId, web3);
    }

    return web3;
  }

  getBalance(chainId: string, address: string): Promise<bigint> {
    return this.getWeb3Instance(chainId).eth.getBalance(address);
  }

  getTransaction(chainId: string, txHash: string): Promise<any> {
    return this.getWeb3Instance(chainId).eth.getTransaction(txHash);
  }

  async sendTransaction(
    chainId: string,
    details: TransactionDetails,
  ): Promise<string> {
    const transaction = {
      from: details.from,
      to: details.to,
      value: this.getWeb3Instance(chainId).utils.toWei(
        details.amount.toString(),
        'ether',
      ),
    };
    const receipt =
      await this.getWeb3Instance(chainId).eth.sendTransaction(transaction);
    const txHash = '0x' + Buffer.from(receipt.transactionHash).toString('hex');
    return txHash;
  }

  async getGasPrice(chainId: string): Promise<bigint> {
    return await this.getWeb3Instance(chainId).eth.getGasPrice();
  }

  async getTransactionCount(chainId: string, address: string): Promise<bigint> {
    return await this.getWeb3Instance(chainId).eth.getTransactionCount(address);
  }

  async getTransactionReceipt(
    chainId: string,
    txHash: string,
  ): Promise<TransactionReceipt> {
    return await this.getWeb3Instance(chainId).eth.getTransactionReceipt(
      txHash,
    );
  }

  createWallet(chainId: string): {
    address: string;
    encryptedPrivateKey: string;
  } {
    const account = this.getWeb3Instance(chainId).eth.accounts.create();
    const { encryptedData, iv } = this.encryptionService.encrypt(
      account.privateKey,
    );

    // Aquí deberías implementar la lógica para almacenar de forma segura la clave privada cifrada
    // Por ejemplo, guardarla en una base de datos con la dirección como referencia

    return {
      address: account.address,
      encryptedPrivateKey: `${iv}:${encryptedData}`, // Concatenar IV y datos cifrados
    };
  }
  unlockWallet(
    chainId: string,
    address: string,
    encryptedPrivateKey: string,
  ): boolean {
    try {
      const privateKey = this.decryptPrivateKey(encryptedPrivateKey);
      const web3 = this.getWeb3Instance(chainId);

      // Verifica si la clave privada corresponde a la dirección proporcionada
      const account = web3.eth.accounts.privateKeyToAccount(privateKey);
      if (account.address.toLowerCase() !== address.toLowerCase()) {
        console.error('The private key does not match the provided address.');
        return false;
      }

      web3.eth.accounts.wallet.add(account);
      // Asegúrate de eliminar la clave privada de la memoria después de su uso
      // Por ejemplo, después de realizar una transacción
      return true;
    } catch (error) {
      console.error('Error unlocking wallet:', error);
      return false;
    }
  }

  private decryptPrivateKey(encryptedPrivateKey: string): string {
    const [iv, encryptedData] = encryptedPrivateKey.split(':');
    return this.encryptionService.decrypt(`${iv}${encryptedData}`);
  }
}
