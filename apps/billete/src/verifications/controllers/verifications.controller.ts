import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { DatabaseService } from '../../database/services/database/database.service';
import { EncryptionsService } from '../../encryptions/services/encryptions.service';
import { SmsService } from '../../sms/services/sms.service';
import { SendVerificationDto } from '../dtos/send-sms-code.dto';
import { VerifySmsCodeDto } from '../dtos/verify-sms-code.dto';
import { VerificationsService } from '../services/verifications.service';

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

    // const smsResult = await this.smsService.sendSMS(
    //   sendVerificationDto.to,
    //   smsMessage,
    // );

    const encryptedCode = this.encryptionsService.encrypt(code);

    await this.verificationsService.createVerificationRecord(
      sendVerificationDto.to,
      encryptedCode,
    );

    return {
      smsMessage,
    };
  }

  @Post('verify-sms-code')
  async verifySmsCode(@Body() verifySmsCodeDto: VerifySmsCodeDto) {
    const { to, code } = verifySmsCodeDto;

    console.log('verifySmsCodeDto', verifySmsCodeDto);

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

    return { isVerified: true };
  }
}
