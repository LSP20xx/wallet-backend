// one-time-tokens.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OneTimeTokenEntity } from './entities/one-time-tokens.entity';
import { OneTimeTokenService } from './services/one-time-token.service';
import { OneTimeTokenController } from './controllers/one-time-token.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OneTimeTokenEntity])],
  providers: [OneTimeTokenService],
  controllers: [OneTimeTokenController],
  exports: [OneTimeTokenService],
})
export class OneTimeTokenModule {}
