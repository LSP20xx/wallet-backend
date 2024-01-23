import { NestFactory } from '@nestjs/core';
import { RedisModule } from './redis.module';
import { Transport } from '@nestjs/microservices';

async function createMicroservice() {
  const app = await NestFactory.createMicroservice(RedisModule, {
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: 3003,
    },
  });
  await app.listen();
}
createMicroservice();
