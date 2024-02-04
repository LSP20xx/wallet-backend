import {
  ForbiddenException,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { SignTokenDTO } from 'apps/billete/src/auth/dtos/sign-token.dto';
import { SignUpDTO } from 'apps/billete/src/auth/dtos/sign-up.dto';
import { DatabaseService } from 'apps/billete/src/database/services/database/database.service';
import { EvmWalletService } from 'apps/billete/src/wallets/services/evm-wallet.service';
import { UtxoWalletService } from 'apps/billete/src/wallets/services/utxo-wallet.service';
import { hash, verify } from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { SignInDTO } from '../dtos/sign-in.dto';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private databaseService: DatabaseService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private evmWalletService: EvmWalletService,
    private utxoWalletService: UtxoWalletService,
    @Inject('REDIS_SERVICE') private redisClient: ClientProxy,
  ) {}

  async signUpUser(signUpDTO: SignUpDTO): Promise<{ userId: string }> {
    const prisma = new PrismaClient();

    try {
      const result = await prisma.$transaction(async (transaction) => {
        const tempPasswordResponse = await this.getTempPassword(
          signUpDTO.tempId,
        );

        if (!tempPasswordResponse || !tempPasswordResponse.encryptedPassword) {
          throw new ForbiddenException(
            'Session expired or invalid, or key not found.',
          );
        }

        const userData = {
          email: signUpDTO.email,
          phoneNumber: signUpDTO.phoneNumber,
          encryptedPassword: tempPasswordResponse.encryptedPassword,
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
    const tempPasswordResponse = await this.getTempPassword(signInDTO.tempId);

    if (!tempPasswordResponse || !tempPasswordResponse.encryptedPassword) {
      throw new ForbiddenException('Session expired or invalid.');
    }

    const user = await this.databaseService.user.findFirst({
      where: {
        OR: [{ email: signInDTO.login }, { phoneNumber: signInDTO.login }],
      },
    });

    if (!user) {
      throw new ForbiddenException('Invalid credentials.');
    }

    if (user.encryptedPassword !== tempPasswordResponse.encryptedPassword) {
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
        const tempId = await this.storeTempPassword(
          authData.email ?? authData.phoneNumber,
          authData.password,
        );

        const preRegistrationToken = this.generatePreVerificationToken({
          email: authData.email,
          phoneNumber: authData.phoneNumber,
        });

        return {
          tempId: tempId,
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

      const tempId = await this.storeTempPassword(
        user.email ?? user.phoneNumber,
        authData.password,
      );

      if (tempId) {
        return {
          tempId: tempId,
          token: preRegistrationToken,
          message: 'Verification required',
          verificationMethods: user.verificationMethods,
          email: user.email,
          phoneNumber: user.phoneNumber,
        };
      }
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

  async onModuleInit() {
    await this.redisClient.connect();
  }

  async storeTempPassword(
    emailOrPhone: string,
    password: string,
  ): Promise<string> {
    const tempId = uuidv4();
    const encryptedPassword = await hash(password);

    this.redisClient
      .send(
        { cmd: 'set' },
        {
          key: tempId,
          value: JSON.stringify({ emailOrPhone, encryptedPassword }),
          expire: 300,
        },
      )
      .toPromise();

    return tempId;
  }
  async getTempPassword(
    tempId: string,
  ): Promise<{ emailOrPhone: string; encryptedPassword: string }> {
    const data = await this.redisClient
      .send({ cmd: 'get' }, { key: tempId })
      .toPromise();

    if (!data) {
      throw new Error('Temporal data not found or expired');
    }

    console.log('temp data', data);
    if (data.value && typeof data.value === 'string') {
      const parsedValue = JSON.parse(data.value);
      console.log('parsedValue', parsedValue);
      return parsedValue;
    } else {
      throw new Error('Invalid data format from Redis');
    }
  }
}
