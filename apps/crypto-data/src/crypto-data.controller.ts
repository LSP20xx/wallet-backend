import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { CryptoDataService } from './crypto-data.service';

@Controller()
export class CryptoDataController {
  constructor(private readonly cryptoDataService: CryptoDataService) {}

  @EventPattern('get_crypto_data')
  async getData() {
    const result = this.cryptoDataService.getHello();
    return result;
  }
}
