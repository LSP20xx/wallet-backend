import { Module } from '@nestjs/common';
import { LambdaService } from './lambda.service';
import { LambdaController } from './lambda.controller';

@Module({
  providers: [LambdaService],
  controllers: [LambdaController],
})
export class LambdaModule {}
