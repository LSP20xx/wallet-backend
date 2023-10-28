import { Module } from '@nestjs/common';
import { VerificationController } from './controllers/verifications.controller';
import { SmsModule } from 'src/sms/sms.module';
import { VerificationsService } from './services/verifications.service';
import { EncryptionsService } from 'src/encryptions/services/encryptions.service';

@Module({
  imports: [SmsModule],
  controllers: [VerificationController],
  providers: [VerificationsService, EncryptionsService],
  exports: [VerificationsModule],
})
export class VerificationsModule {}
