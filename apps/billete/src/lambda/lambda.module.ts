import { Module } from '@nestjs/common';
import { LambdaService } from './lambda.service';

@Module({
  providers: [LambdaService],
})
export class LambdaModule {}
