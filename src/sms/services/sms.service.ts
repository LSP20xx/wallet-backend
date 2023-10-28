import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as Twilio from 'twilio';
import { Repository } from 'typeorm';
import { SmsEntity } from '../entities/sms.entity';
import { SMS_VERIFICATION_MESSAGE } from 'src/constants/sms-verification-message';

@Injectable()
export class SmsService {
  private client: Twilio.Twilio;

  constructor(
    @InjectRepository(SmsEntity)
    private smsRepository: Repository<SmsEntity>,
  ) {
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

  async createSMSRecord(
    to: string,
    code: string,
  ): Promise<{ smsRecord: SmsEntity }> {
    const smsRecord = this.smsRepository.create({ to, code });
    return { smsRecord };
  }
  async saveSMSRecord(smsRecord: SmsEntity): Promise<SmsEntity> {
    return this.smsRepository.save(smsRecord);
  }
}
