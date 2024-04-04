// circle.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { EncryptionsService } from '../encryptions/services/encryptions.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CircleService {
  constructor(
    private httpService: HttpService,

    private configService: ConfigService,
    private encryptionsService: EncryptionsService,
  ) {}

  private readonly API_URL = 'https://api.circle.com/v1/w3s/developer/wallets';
  private readonly API_KEY = this.configService.get('CIRCLE_API_KEY');
  private readonly CIRCLE_WALLET_SET_ID = this.configService.get(
    'CIRCLE_WALLET_SET_ID',
  );

  async createWallets(): Promise<any> {
    const entitySecretCipherText =
      this.encryptionsService.encryptWithPublicKey();
    const body = {
      idempotencyKey: uuidv4(),
      entitySecretCipherText: entitySecretCipherText,
      walletSetId: this.CIRCLE_WALLET_SET_ID,
      blockchains: ['ETH-SEPOLIA', 'AVAX-FUJI', 'MATIC-AMOY'],
      count: 20,
    };

    try {
      const response = await lastValueFrom(
        this.httpService.post(this.API_URL, body, {
          headers: { Authorization: `Bearer ${this.API_KEY}` },
        }),
      );

      return response.data;
    } catch (error) {
      throw new Error('Error creating wallet: ' + error.response.data.message);
    }
  }
}
