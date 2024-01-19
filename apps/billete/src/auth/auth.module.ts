import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { WalletsModule } from 'apps/billete/src/wallets/wallet.module';
import { LocalStrategy } from './strategy/local.strategy';
import { SessionSerializer } from './strategy/session.serializer';
import { EncryptionsService } from 'apps/billete/src/encryptions/services/encryptions.service';
//import { GoogleStrategy } from './strategy/google.strategy';

@Module({
  imports: [
    JwtModule.register({}),
    PassportModule.register({
      session: true,
    }),
    WalletsModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtService,
    LocalStrategy,
    //GoogleStrategy,
    SessionSerializer,
    EncryptionsService,
  ],
})
export class AuthModule {}
