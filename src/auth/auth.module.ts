import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth/auth.service';
import { WalletsModule } from 'src/wallets/wallets.module';

@Module({
  imports: [JwtModule.register({}), WalletsModule],
  controllers: [AuthController],
  providers: [AuthService, JwtService],
})
export class AuthModule {}
