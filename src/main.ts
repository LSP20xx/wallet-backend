import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as morgan from 'morgan';
import { CORS } from './constants';
import { ValidationPipe } from '@nestjs/common';
import { config } from 'dotenv';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(morgan('dev'));

  app.useGlobalPipes(
    new ValidationPipe({
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');

  app.enableCors(CORS);

  await app.listen(configService.get('PORT'));

  config();

  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
