import { Module } from '@nestjs/common';
import { CircleService } from './circle.service';
import { EncryptionsModule } from '../encryptions/encryptions.module';

@Module({
  imports: [EncryptionsModule],
  providers: [CircleService],
})
export class CircleModule {}
