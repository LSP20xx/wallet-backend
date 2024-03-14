import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { DatabaseService } from '../../database/services/database/database.service';
import { EmailService } from '../../email/email.service';
import { EncryptionsService } from '../../encryptions/services/encryptions.service';
import { SmsService } from '../../sms/services/sms.service';
import { SendVerificationDto } from '../dtos/send-sms-code.dto';
import { VerifyCodeDto } from '../dtos/verify-sms-code.dto';
import { VerificationsService } from '../services/verifications.service';

@Controller('verification')
export class VerificationController {
  constructor(
    private readonly smsService: SmsService,
    private readonly emailService: EmailService,
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
  @Post('send-email-code')
  async sendEmailCode(
    @Res() response, // Asegúrate de inyectar el objeto de respuesta aquí
    @Body() emailData: { to: string; subject: string; template: string },
  ) {
    try {
      const { code } = this.verificationsService.generateVerificationCode();

      const context = {
        verificationCode: code,
      };

      await this.emailService.sendMail(
        emailData.to,
        emailData.subject,
        emailData.template,
        context,
      );

      const encryptedCode = this.encryptionsService.encrypt(code);

      await this.verificationsService.createVerificationRecord(
        emailData.to,
        encryptedCode,
      );

      return response.status(200).json({
        message: 'Verification code sent successfully.',
        data: {
          email: emailData.to,
        },
      });
    } catch (error) {
      console.error('Error sending verification code:', error);
      return response.status(500).json({
        message: 'Failed to send verification code.',
        error: error.toString(),
      });
    }
  }

  @Post('verify-sms-code')
  async verifySmsCode(@Body() verifyCodeDto: VerifyCodeDto) {
    const { to, code } = verifyCodeDto;

    console.log('verifyCodeDto', verifyCodeDto);

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

  @Post('verify-email-code')
  async verifyEmailCode(@Body() verifyCodeDto: VerifyCodeDto) {
    console.log('verifyCodeDto', verifyCodeDto);
    const { to, code } = verifyCodeDto;

    const emailRecord =
      await this.verificationsService.findLatestEmailByEmailAddress(to);
    if (!emailRecord) {
      throw new HttpException(
        'No email record found for this email address',
        HttpStatus.NOT_FOUND,
      );
    }

    const decryptedCode = this.encryptionsService.decrypt(emailRecord.code);

    const isValid = this.verificationsService.isCodeValid(
      code,
      decryptedCode,
      emailRecord.createdAt,
    );

    if (!isValid) {
      throw new HttpException('Invalid code', HttpStatus.BAD_REQUEST);
    }

    return { isVerified: true };
  }
}
