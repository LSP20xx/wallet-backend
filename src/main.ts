import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as passport from 'passport';
import * as morgan from 'morgan';
import RedisStore from 'connect-redis';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { CORS } from './constants';
import { ValidationPipe } from '@nestjs/common';
import { config } from 'dotenv';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const redisClient = new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
  });

  const redisStore = new RedisStore(redisClient as any);

  app.use(morgan('dev'));

  app.use(
    session({
      store: redisStore,
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: parseInt(process.env.SESSION_MAX_AGE),
      },
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');

  app.enableCors(CORS);

  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(configService.get('PORT'));

  config();

  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
