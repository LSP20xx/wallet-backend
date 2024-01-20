import { NestFactory } from '@nestjs/core';
import { CryptoDataModule } from './crypto-data.module';
import { Transport } from '@nestjs/microservices';

async function createMicroservice() {
  const app = await NestFactory.createMicroservice(CryptoDataModule, {
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: 3002,
    },
  });
  await app.listen();
}
createMicroservice();
