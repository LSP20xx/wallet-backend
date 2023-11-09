import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { SendVerificationDto } from '../dtos/send-sms-code.dto';
import { SmsService } from '../../sms/services/sms.service';
import { EncryptionsService } from '../../encryptions/services/encryptions.service';
import { VerificationsService } from '../services/verifications.service';
import { VerifySmsCodeDto } from '../dtos/verify-sms-code.dto';

@Controller('verification')
export class VerificationController {
  constructor(
    private readonly smsService: SmsService,
    private readonly encryptionsService: EncryptionsService,
    private readonly verificationsService: VerificationsService,
  ) {}

  @Post('send-sms-code')
  async sendSMSCode(@Body() sendVerificationDto: SendVerificationDto) {
    const { code } = this.verificationsService.generateVerificationCode();

    const { smsMessage } = this.smsService.createSMSMessage(code);

    const smsResult = await this.smsService.sendSMS(
      sendVerificationDto.to,
      smsMessage,
    );

    const { encryptedData } = this.encryptionsService.encrypt(code);

    await this.smsService.createSMSRecord(
      sendVerificationDto.to,
      encryptedData,
    );

    return {
      smsResult,
    };
  }

  @Post('verify-sms-code')
  async verifySmsCode(@Body() verifySmsCodeDto: VerifySmsCodeDto) {
    const { to, code } = verifySmsCodeDto;

    const smsRecord = await this.smsService.findLatestSMSByPhoneNumber(to);
    if (!smsRecord) {
      throw new HttpException(
        'No SMS record found for this phone number',
        HttpStatus.NOT_FOUND,
      );
    }

    const decryptedCode = this.encryptionsService.decrypt(smsRecord.code);

    const isValid = this.verificationsService.isCodeValid(
      code,
      decryptedCode,
      smsRecord.createdAt,
    );
    return { isValid };
  }
}
