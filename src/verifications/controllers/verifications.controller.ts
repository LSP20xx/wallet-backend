import { Controller, Post, Body } from '@nestjs/common';
import { SendVerificationDto } from '../dtos/send-sms-code.dto';
import { SmsService } from 'src/sms/services/sms.service';
import { EncryptionsService } from 'src/encryptions/services/encryptions.service';
import { VerificationsService } from '../services/verifications.service';

@Controller('verification')
export class VerificationController {
  constructor(
    private readonly smsService: SmsService,
    private readonly encryptionsService: EncryptionsService,
    private readonly verificationsService: VerificationsService,
  ) {}

  @Post('send-sms-verification')
  async sendSMSVerification(@Body() sendVerificationDto: SendVerificationDto) {
    const { code } = this.verificationsService.generateVerificationCode();

    const { smsMessage } = this.smsService.createSMSMessage(code);

    const smsResult = await this.smsService.sendSMS(
      sendVerificationDto.to,
      smsMessage,
    );

    const { encryptedData } = this.encryptionsService.encrypt(code);

    const { smsRecord } = await this.smsService.createSMSRecord(
      sendVerificationDto.to,
      encryptedData,
    );

    await this.smsService.saveSMSRecord(smsRecord);
    return {
      smsResult,
    };
  }
}
