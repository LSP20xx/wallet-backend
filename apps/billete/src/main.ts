import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as passport from 'passport';
import * as morgan from 'morgan';
import * as fs from 'fs';
import * as path from 'path';
import RedisStore from 'connect-redis';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { CORS } from './constants';
import { ValidationPipe } from '@nestjs/common';
import { config } from 'dotenv';

async function bootstrap() {
  config();

  const app = await NestFactory.create(AppModule);

  const redisClient = new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
  });

  const redisStore = new RedisStore({ client: redisClient });
  const logDirectory = path.join(__dirname, '..', '..', 'access.log');
  console.log('__dirname', __dirname);
  console.log('logDirectory', logDirectory);

  const accessLogStream = fs.createWriteStream(logDirectory, { flags: 'a' });

  app.use(morgan('combined', { stream: accessLogStream }));

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

  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
