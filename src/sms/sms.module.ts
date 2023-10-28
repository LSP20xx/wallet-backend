import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmsService } from './services/sms.service';
import { SmsEntity } from './entities/sms.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SmsEntity])],
  providers: [SmsService],
  controllers: [],
  exports: [SmsService],
})
export class SmsModule {}
