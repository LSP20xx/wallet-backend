import { Injectable } from '@nestjs/common';
import * as Twilio from 'twilio';
import { SMS_VERIFICATION_MESSAGE } from '../../constants/sms-verification-message';
import { DatabaseService } from 'apps/billete/src/database/services/database/database.service';

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
}
