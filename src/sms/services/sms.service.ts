import { Injectable } from '@nestjs/common';
import * as Twilio from 'twilio';
import { SMS_VERIFICATION_MESSAGE } from '../../constants/sms-verification-message';
import { Sms } from '@prisma/client';
import { DatabaseService } from 'src/database/services/database/database.service';

@Injectable()
export class SmsService {
  private client: Twilio.Twilio;

  constructor(private databaseService: DatabaseService) {
    this.client = Twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );
  }

  createSMSMessage(code: string): { smsMessage: string } {
    return { smsMessage: `${SMS_VERIFICATION_MESSAGE} ${code}` };
  }

  async sendSMS(to: string, body: string): Promise<any> {
    return this.client.messages.create({
      body: body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to,
    });
  }

  async createSMSRecord(to: string, code: string): Promise<{ smsRecord: Sms }> {
    return {
      smsRecord: await this.databaseService.sms.create({
        data: { to, code },
      }),
    };
  }

  async findLatestSMSByPhoneNumber(phoneNumber: string): Promise<Sms | null> {
    return this.databaseService.sms.findFirst({
      where: { to: phoneNumber },
      orderBy: { createdAt: 'desc' },
    });
  }
}
