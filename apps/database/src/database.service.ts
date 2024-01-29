import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DatabaseService {
  private prisma: PrismaClient;

  constructor(configService: ConfigService) {
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: configService.get('DATABASE_URL'),
        },
      },
    });
  }
}
