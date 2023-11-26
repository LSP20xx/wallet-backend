import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { verify } from 'argon2';
import { Strategy } from 'passport-local';
import { DatabaseService } from 'src/database/services/database/database.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private databaseService: DatabaseService) {
    super({
      usernameField: 'login',
      passwordField: 'password',
    });
  }

  async validate(login: string, password: string): Promise<any> {
    const user = await this.databaseService.user.findFirst({
      where: {
        OR: [{ email: login }, { phoneNumber: login }],
      },
    });
    if (!user) {
      throw new UnauthorizedException('Credenciales no válidas');
    }
    const isPasswordValid = await verify(user.encryptedPassword, password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales no válidas');
    }
    delete user.encryptedPassword;
    return user;
  }
}
