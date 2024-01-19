import { Module } from '@nestjs/common';
import { EncryptionsService } from './services/encryptions.service';
@Module({
  imports: [],
  providers: [EncryptionsService],
  controllers: [],
  exports: [EncryptionsService],
})
export class EncryptionsModule {}
