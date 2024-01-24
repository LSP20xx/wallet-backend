import { NestFactory } from '@nestjs/core';
import { DatabaseModule } from './database.module';
import { Transport } from '@nestjs/microservices';

async function createMicroservice() {
  const app = await NestFactory.createMicroservice(DatabaseModule, {
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: 3004,
    },
  });
  await app.listen();
}
createMicroservice();
