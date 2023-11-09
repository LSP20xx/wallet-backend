import { Injectable, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { hash, verify } from 'argon2';
import { AuthDTO } from 'src/auth/dtos/auth.dto';
import { SignTokenDTO } from 'src/auth/dtos/sign-token.dto';
import { DatabaseService } from 'src/database/services/database/database.service';
import { WalletsService } from 'src/wallets/services/wallets.service';

@Injectable()
export class AuthService {
  constructor(
    private databaseService: DatabaseService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private walletsService: WalletsService,
  ) {}

  async signUpUser(
    authDto: AuthDTO,
  ): Promise<{ userId: string; token: string }> {
    try {
      const hashedPassword = await hash(authDto.password);

      const userData = {
        email: authDto.email,
        phoneNumber: authDto.phoneNumber,
        encryptedPassword: hashedPassword,
      };

      const user = await this.databaseService.user.create({
        data: userData,
      });

      delete user.encryptedPassword;

      const allowedChains = this.configService
        .get('ALLOWED_CHAINS_IDS')
        .split(',');

      for (const chainId of allowedChains) {
        await this.walletsService.createWallet(user.id, chainId);
      }

      return {
        userId: user.id,
        token: await this.signToken({
          userId: user.id,
          email: user.email,
          phoneNumber: user.phoneNumber,
        }),
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials already in use.');
        }
      }
      throw error;
    }
  }

  async signInUser(
    authDto: AuthDTO,
  ): Promise<{ userId: string; token: string }> {
    const user = await this.databaseService.user.findFirst({
      where: {
        OR: [{ email: authDto.email }, { phoneNumber: authDto.phoneNumber }],
      },
    });

    if (!user) {
      throw new ForbiddenException('Invalid credentials.');
    }

    const isPasswordValid = await verify(
      user.encryptedPassword,
      authDto.password,
    );

    if (!isPasswordValid) {
      throw new ForbiddenException('Invalid credentials.');
    }

    delete user.encryptedPassword;

    return {
      userId: user.id,
      token: await this.signToken({
        userId: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
      }),
    };
  }

  async signToken(signTokenDto: SignTokenDTO): Promise<string> {
    const payload = {
      sub: signTokenDto.userId,
      ...(signTokenDto.email && { email: signTokenDto.email }),
      ...(signTokenDto.phoneNumber && {
        phoneNumber: signTokenDto.phoneNumber,
      }),
    };

    const secret = this.configService.get<string>('JWT_SECRET');
    return this.jwtService.signAsync(payload, {
      expiresIn: '2d',
      secret: secret,
    });
  }
}
