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
import { DatabaseService } from '../../database/services/database/database.service';

@Controller('verification')
export class VerificationController {
  constructor(
    private readonly smsService: SmsService,
    private readonly encryptionsService: EncryptionsService,
    private readonly verificationsService: VerificationsService,
    private readonly databaseService: DatabaseService,
  ) {}

  @Post('send-sms-code')
  async sendSMSCode(@Body() sendVerificationDto: SendVerificationDto) {
    console.log('sendVerificationDto', sendVerificationDto);
    const { code } = this.verificationsService.generateVerificationCode();

    const { smsMessage } = this.smsService.createSMSMessage(code);

    console.log('smsMessage', smsMessage);

    const smsResult = await this.smsService.sendSMS(
      sendVerificationDto.to,
      smsMessage,
    );

    console.log('smsResult', smsResult);

    const encryptedCode = this.encryptionsService.encrypt(code);

    await this.verificationsService.createVerificationRecord(
      sendVerificationDto.to,
      encryptedCode,
    );

    return {
      smsResult,
    };
  }

  @Post('verify-sms-code')
  async verifySmsCode(@Body() verifySmsCodeDto: VerifySmsCodeDto) {
    const { to, code } = verifySmsCodeDto;

    const smsRecord =
      await this.verificationsService.findLatestSMSByPhoneNumber(to);
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

    if (!isValid) {
      throw new HttpException('Invalid code', HttpStatus.BAD_REQUEST);
    }

    return { isValid };
  }
}
