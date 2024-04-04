import { Module } from '@nestjs/common';
import { CircleService } from './circle.service';
import { EncryptionsModule } from '../encryptions/encryptions.module';
import { HttpModule } from '@nestjs/axios';
import { CircleController } from './circle.controller';

@Module({
  imports: [EncryptionsModule, HttpModule],
  providers: [CircleService],
  controllers: [CircleController],
})
export class CircleModule {}
