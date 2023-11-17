import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { WalletsModule } from 'src/wallets/wallet.module';
import { LocalStrategy } from './strategy/local.strategy';
import { SessionSerializer } from './strategy/session.serializer';

@Module({
  imports: [
    JwtModule.register({}),
    PassportModule.register({
      session: true,
    }),
    WalletsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtService, LocalStrategy, SessionSerializer],
})
export class AuthModule {}
