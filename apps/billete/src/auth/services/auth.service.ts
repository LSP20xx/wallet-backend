import {
  ForbiddenException,
  Inject,
  Injectable,
  OnModuleInit,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient, VerificationMethod } from '@prisma/client';
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
import { CheckAuthDataDTO } from '../dtos/check-auth-data.dto';
import { FiatWalletsService } from '../../wallets/services/fiat-wallets.service';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private databaseService: DatabaseService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private evmWalletService: EvmWalletService,
    private utxoWalletService: UtxoWalletService,
    private fiatWalletService: FiatWalletsService,
    @Inject('REDIS_SERVICE') private redisClient: ClientProxy,
  ) {}

  async storeTempSession(emailOrPhone: string): Promise<string> {
    const tempId = uuidv4();

    this.redisClient
      .send(
        { cmd: 'set' },
        {
          key: tempId,
          value: emailOrPhone,
          expire: 259200,
        },
      )
      .toPromise();

    return tempId;
  }
  async signUpUser(signUpDTO: SignUpDTO): Promise<{ userId: string }> {
    const prisma = new PrismaClient();

    const platforms = [
      { name: 'Kraken', currencyCode: 'USD', currencyName: 'Dollar' },
    ];

    let userId;

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

        // const sessionTempId = await this.storeTempSession(
        //   signUpDTO.email ?? signUpDTO.phoneNumber,
        // );

        const userData = {
          email: signUpDTO.email,
          phoneNumber: signUpDTO.phoneNumber,
          encryptedPassword: tempPasswordResponse.encryptedPassword,
          verified: false,
          verificationMethods: signUpDTO.email
            ? [VerificationMethod.EMAIL]
            : [VerificationMethod.SMS],
        };

        const user = await transaction.user.create({
          data: userData,
        });

        const allowedChains = this.configService
          .get('ALLOWED_CHAINS_IDS')
          .split(',');

        for (const chainId of allowedChains) {
          if (chainId === '11155111')
            await this.evmWalletService.createWallet(
              user.id,
              chainId,
              transaction,
              'TESTNET',
              'ETH',
            );
        }

        // await this.utxoWalletService.createWallet(
        //   user.id,
        //   'bitcoin',
        //   'mainnet',
        //   transaction,
        // );
        await this.utxoWalletService.createWallet(
          user.id,
          'bitcoin',
          'testnet',
          'BTC',
          transaction,
        );

        // await this.utxoWalletService.createWallet(
        //   user.id,
        //   'litecoin',
        //   'mainnet',
        //   transaction,
        // );
        await this.utxoWalletService.createWallet(
          user.id,
          'litecoin',
          'testnet',
          'LTC',
          transaction,
        );
        // await this.utxoWalletService.createWallet(
        //   user.id,
        //   'dogecoin',
        //   'mainnet',
        //   transaction,
        // );
        await this.utxoWalletService.createWallet(
          user.id,
          'dogecoin',
          'testnet',
          'DOGE',
          transaction,
        );
        userId = user.id;
        return {
          userId: user.id,
          completeName: user.completeName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          verified: user.verified,
          verificationMethods: user.verificationMethods,
          termsAndConditionsAccepted: false,
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
      const userCheck = await this.databaseService.user.findUnique({
        where: { id: userId },
      });

      if (!userCheck) {
        console.error('El usuario no fue creado correctamente.');
        throw new Error('Error en la creación del usuario.');
      }

      for (const platform of platforms) {
        let existingPlatform = await this.databaseService.platform.findUnique({
          where: { name: platform.name },
          include: { fiatWallets: true },
        });

        const currency = await this.databaseService.fiatCurrency.findUnique({
          where: { code: platform.currencyCode },
        });

        if (!currency) {
          throw new Error(`La moneda ${platform.currencyCode} no se encontró`);
        }

        if (!existingPlatform) {
          existingPlatform = await this.databaseService.platform.create({
            data: { name: platform.name },
            include: { fiatWallets: true },
          });
        }
        await this.fiatWalletService.createWallet(
          userId,
          currency.id,
          currency.name,
          currency.code,
          '0',
          existingPlatform.id,
          platform.name,
        );
      }

      await prisma.$disconnect();
    }
  }

  async signInUser(signInDTO: SignInDTO): Promise<{
    userId: string;
    completeName: string;
    email: string;
    phoneNumber: string;
    verified: boolean;
    verificationMethods: string[];
  }> {
    const user = await this.databaseService.user.findFirst({
      where: {
        OR: [{ email: signInDTO.login }, { phoneNumber: signInDTO.login }],
      },
    });

    if (!user) {
      throw new ForbiddenException('Invalid credentials.');
    }

    return {
      userId: user.id,
      completeName: user.completeName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      verified: user.verified,
      verificationMethods: user.verificationMethods,
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

  async checkAuthData(checkAuthDataDTO: CheckAuthDataDTO) {
    const whereClause = {};

    if (checkAuthDataDTO.email) {
      whereClause['email'] = checkAuthDataDTO.email;
    }
    if (checkAuthDataDTO.phoneNumber) {
      whereClause['phoneNumber'] = checkAuthDataDTO.phoneNumber;
    }

    if (!checkAuthDataDTO.email && !checkAuthDataDTO.phoneNumber) {
      throw new Error('Email or phone number must be provided');
    }

    const user = await this.databaseService.user.findFirst({
      where: { OR: [whereClause] },
    });

    if (!user) {
      if (checkAuthDataDTO.isLogin) {
        throw new ForbiddenException('Invalid credentials.');
      } else {
        const tempId = await this.storeTempPassword(
          checkAuthDataDTO.email ?? checkAuthDataDTO.phoneNumber,
          checkAuthDataDTO.password,
        );

        const preVerificationToken = this.generatePreVerificationToken({
          email: checkAuthDataDTO.email,
          phoneNumber: checkAuthDataDTO.phoneNumber,
        });

        return {
          tempId: tempId,
          preVerificationToken: preVerificationToken,
          message: 'Verification required',
          verificationMethods: checkAuthDataDTO.email ? ['EMAIL'] : ['SMS'],
          email: checkAuthDataDTO.email,
          phoneNumber: checkAuthDataDTO.phoneNumber,
        };
      }
    } else {
      if (checkAuthDataDTO.isLogin) {
        const isPasswordValid = await verify(
          user.encryptedPassword,
          checkAuthDataDTO.password,
        );

        if (!isPasswordValid) {
          throw new ForbiddenException('Invalid credentials.');
        }
      } else {
        throw new ForbiddenException('User already exists.');
      }

      const preVerificationToken = this.generatePreVerificationToken({
        email: user.email,
        phoneNumber: user.phoneNumber,
      });

      const tempId = await this.storeTempPassword(
        user.email ?? user.phoneNumber,
        checkAuthDataDTO.password,
      );

      if (tempId) {
        return {
          tempId: tempId,
          preVerificationToken: preVerificationToken,
          message: 'Verification required',
          verificationMethods: checkAuthDataDTO.email ? ['EMAIL'] : ['SMS'],
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
      expiresIn: '7d',
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

    if (data.value && typeof data.value === 'string') {
      const parsedValue = JSON.parse(data.value);
      return parsedValue;
    } else {
      throw new Error('Invalid data format from Redis');
    }
  }

  async acceptTermsAndConditions(userId: string) {
    const user = await this.databaseService.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    user.termsAndConditionsAccepted = true;

    await this.databaseService.user.update({
      where: {
        id: userId,
      },
      data: {
        termsAndConditionsAccepted: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return true;
  }

  async updatePersonalInformation(
    userId: string,
    personalInfo: { completeName: string; dateOfBirth: Date },
  ) {
    const user = await this.databaseService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    user.completeName = personalInfo.completeName;
    user.dateOfBirth = personalInfo.dateOfBirth;

    await this.databaseService.user.update({
      where: { id: userId },
      data: {
        completeName: user.completeName,
        dateOfBirth: user.dateOfBirth,
      },
    });

    return { message: 'Personal information updated successfully' };
  }
}
