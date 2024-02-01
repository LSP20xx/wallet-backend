import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { hash, verify } from 'argon2';
import { SignTokenDTO } from 'apps/billete/src/auth/dtos/sign-token.dto';
import { SignUpDTO } from 'apps/billete/src/auth/dtos/sign-up.dto';
import { DatabaseService } from 'apps/billete/src/database/services/database/database.service';
import { EvmWalletService } from 'apps/billete/src/wallets/services/evm-wallet.service';
import { UtxoWalletService } from 'apps/billete/src/wallets/services/utxo-wallet.service';
import { SignInDTO } from '../dtos/sign-in.dto';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private databaseService: DatabaseService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private evmWalletService: EvmWalletService,
    private utxoWalletService: UtxoWalletService,
  ) {}

  async signUpUser(signUpDTO: SignUpDTO): Promise<{ userId: string }> {
    const prisma = new PrismaClient();

    try {
      const result = await prisma.$transaction(async (transaction) => {
        const encryptedPassword = await hash(signUpDTO.password);

        const userData = {
          email: signUpDTO.email,
          phoneNumber: signUpDTO.phoneNumber,
          encryptedPassword: encryptedPassword,
          verified: false,
        };

        const user = await transaction.user.create({
          data: userData,
        });
        /* 
        const allowedChains = this.configService
          .get('ALLOWED_CHAINS_IDS')
          .split(',');

        for (const chainId of allowedChains) {
          if (chainId === '5')
            await this.evmWalletService.createWallet(
              user.id,
              chainId,
              transaction,
            );
        }

        await this.utxoWalletService.createWallet(
          user.id,
          'bitcoin',
          'mainnet',
          transaction,
        );
        await this.utxoWalletService.createWallet(
          user.id,
          'bitcoin',
          'testnet',
          transaction,
        );

        await this.utxoWalletService.createWallet(
          user.id,
          'litecoin',
          'mainnet',
          transaction,
        );
        await this.utxoWalletService.createWallet(
          user.id,
          'litecoin',
          'testnet',
          transaction,
        );
        await this.utxoWalletService.createWallet(
          user.id,
          'dogecoin',
          'mainnet',
          transaction,
        );
        await this.utxoWalletService.createWallet(
          user.id,
          'dogecoin',
          'testnet',
          transaction,
        ); */

        return {
          userId: user.id,
        };
      });
      return result;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials already in use.');
        }
      }
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  }

  async signInUser(signInDTO: SignInDTO): Promise<{
    userId: string;
  }> {
    const user = await this.databaseService.user.findFirst({
      where: {
        OR: [{ email: signInDTO.login }, { phoneNumber: signInDTO.login }],
      },
    });

    if (!user) {
      throw new ForbiddenException('Invalid credentials.');
    }

    const isPasswordValid = await verify(
      user.encryptedPassword,
      signInDTO.password,
    );

    if (!isPasswordValid) {
      throw new ForbiddenException('Invalid credentials.');
    }

    return {
      userId: user.id,
    };
  }

  generatePreVerificationToken(authData: {
    email?: string;
    phoneNumber?: string;
  }) {
    const payload = {};
    if (authData.email) {
      payload['email'] = authData.email;
    }
    if (authData.phoneNumber) {
      payload['phoneNumber'] = authData.phoneNumber;
    }

    return this.jwtService.sign(payload, {
      expiresIn: '5m',
      secret: this.configService.get<string>('JWT_SECRET'),
    });
  }

  async checkAuthData(authData: {
    email?: string;
    phoneNumber?: string;
    password: string;
    isLogin: boolean;
  }) {
    const whereClause = {};

    if (authData.email) {
      whereClause['email'] = authData.email;
    }
    if (authData.phoneNumber) {
      whereClause['phoneNumber'] = authData.phoneNumber;
    }

    if (!authData.email && !authData.phoneNumber) {
      throw new Error('Email or phone number must be provided');
    }

    const user = await this.databaseService.user.findFirst({
      where: { OR: [whereClause] },
    });

    if (!user) {
      if (authData.isLogin) {
        throw new ForbiddenException('Invalid credentials.');
      } else {
        const preRegistrationToken = this.generatePreVerificationToken({
          email: authData.email,
          phoneNumber: authData.phoneNumber,
        });

        return {
          token: preRegistrationToken,
          message: 'Verification required',
          verificationMethods: authData.email ? ['EMAIL'] : ['SMS'],
          email: authData.email,
          phoneNumber: authData.phoneNumber,
        };
      }
    } else {
      if (authData.isLogin) {
        const isPasswordValid = await verify(
          user.encryptedPassword,
          authData.password,
        );

        if (!isPasswordValid) {
          throw new ForbiddenException('Invalid credentials.');
        }
      } else {
        console.log('User already exists.');
        throw new ForbiddenException('User already exists.');
      }

      const preRegistrationToken = this.generatePreVerificationToken({
        email: user.email,
        phoneNumber: user.phoneNumber,
      });
      return {
        token: preRegistrationToken,
        message: 'Verification required',
        verificationMethods: user.verificationMethods,
        email: user.email,
        phoneNumber: user.phoneNumber,
      };
    }
  }

  async signToken(signTokenDto: SignTokenDTO): Promise<string> {
    const payload = {
      sub: signTokenDto.userId,
    };

    const secret = this.configService.get<string>('JWT_SECRET');
    return this.jwtService.signAsync(payload, {
      expiresIn: '2d',
      secret: secret,
    });
  }

  async googleLogin(req: any) {
    if (!req.user) {
      return 'No user from Google';
    }

    return {
      message: 'User information from Google',
      user: req.user,
    };
  }
}
