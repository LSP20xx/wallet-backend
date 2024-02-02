import { Injectable } from '@nestjs/common';
import { VerificationToken } from '@prisma/client';
import { randomBytes } from 'crypto';
import { DatabaseService } from '../../database/services/database/database.service';

@Injectable()
export class VerificationsService {
  constructor(private databaseService: DatabaseService) {}
  generateVerificationCode() {
    let code = parseInt(randomBytes(3).toString('hex'), 16);
    code = Math.floor(code % 900000) + 100000;
    return { code: code.toString() };
  }

  isCodeValid(userCode: string, storedCode: string, createdAt: Date): boolean {
    const isCodeCorrect = storedCode === userCode;
    const isCodeExpired =
      new Date().getTime() - createdAt.getTime() > 5 * 60 * 1000;
    return isCodeCorrect && !isCodeExpired;
  }

  async createVerificationRecord(
    to: string,
    code: string,
  ): Promise<{ record: VerificationToken }> {
    return {
      record: await this.databaseService.verificationToken.create({
        data: { to, code },
      }),
    };
  }

  async findLatestSMSByPhoneNumber(
    phoneNumber: string,
  ): Promise<VerificationToken | null> {
    return this.databaseService.verificationToken.findFirst({
      where: { to: phoneNumber },
      orderBy: { createdAt: 'desc' },
    });
  }
}
