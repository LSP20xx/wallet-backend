import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

@Injectable()
export class VerificationsService {
  generateVerificationCode(): { code: string } {
    const code = randomBytes(3).toString('hex');
    return { code };
  }

  isCodeValid(userCode: string, storedCode: string, createdAt: Date): boolean {
    const isCodeCorrect = storedCode === userCode;
    const isCodeExpired =
      new Date().getTime() - createdAt.getTime() > 5 * 60 * 1000;
    return isCodeCorrect && !isCodeExpired;
  }
}
