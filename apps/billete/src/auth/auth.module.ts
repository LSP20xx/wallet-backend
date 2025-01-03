import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { WalletsModule } from 'apps/billete/src/wallets/wallet.module';
import { LocalStrategy } from './strategy/local.strategy';
import { SessionSerializer } from './strategy/session.serializer';
import { EncryptionsService } from 'apps/billete/src/encryptions/services/encryptions.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DocumentUploadService } from '../document-upload/document-upload.service';
import { MulterModule } from '@nestjs/platform-express';

//import { GoogleStrategy } from './strategy/google.strategy';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    PassportModule.register({
      session: true,
    }),
    WalletsModule,
    ClientsModule.register([
      {
        name: 'REDIS_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 3003,
        },
      },
    ]),
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtService,
    LocalStrategy,
    //GoogleStrategy,
    SessionSerializer,
    EncryptionsService,
    DocumentUploadService,
  ],
})
export class AuthModule {}
