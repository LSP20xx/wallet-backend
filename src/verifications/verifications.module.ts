import { Module } from '@nestjs/common';
import { VerificationController } from './controllers/verifications.controller';
import { VerificationsService } from './services/verifications.service';
import { SmsModule } from '../sms/sms.module';
import { EncryptionsService } from '../encryptions/services/encryptions.service';
@Module({
  imports: [SmsModule],
  controllers: [VerificationController],
  providers: [VerificationsService, EncryptionsService],
  exports: [VerificationsModule],
})
export class VerificationsModule {}
