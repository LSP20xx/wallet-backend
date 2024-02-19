import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { DatabaseService } from 'apps/billete/src/database/services/database/database.service';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(
    private databaseService: DatabaseService,
    @Inject('REDIS_SERVICE') private redisClient: ClientProxy,
  ) {
    super({
      usernameField: 'login',
      passwordField: 'tempId',
    });
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

  async validate(login: string, tempId: string): Promise<any> {
    let tempPasswordResponse: { encryptedPassword: any; emailOrPhone?: string };

    try {
      tempPasswordResponse = await this.getTempPassword(tempId);
    } catch (error) {
      console.error('Error getting temp password:', error);
      throw error;
    }

    if (!tempPasswordResponse || !tempPasswordResponse.encryptedPassword) {
      throw new ForbiddenException(
        'Session expired or invalid, or key not found.',
      );
    }

    const user = await this.databaseService.user.findFirst({
      where: {
        OR: [{ email: login }, { phoneNumber: login }],
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales no válidas');
    }

    delete user.encryptedPassword;
    return user;
  }
}
