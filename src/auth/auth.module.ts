import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { WalletsModule } from 'src/wallets/wallet.module';
import { LocalStrategy } from './strategy/local.strategy';
import { SessionSerializer } from './strategy/session.serializer';
import { EncryptionsService } from 'src/encryptions/services/encryptions.service';

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
    SessionSerializer,
    EncryptionsService,
  ],
})
export class AuthModule {}
