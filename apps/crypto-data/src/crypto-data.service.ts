import { Injectable } from '@nestjs/common';

@Injectable()
export class CryptoDataService {
  getHello(): string {
    return 'Hello World!';
  }
}
