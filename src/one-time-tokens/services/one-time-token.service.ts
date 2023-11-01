import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { OneTimeTokenEntity } from '../entities/one-time-tokens.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';

@Injectable()
export class OneTimeTokenService {
  constructor(
    @InjectRepository(OneTimeTokenEntity)
    private readonly oneTimeTokenRepository: Repository<OneTimeTokenEntity>,
  ) {}

  async createToken(): Promise<string> {
    const token = randomBytes(16).toString('hex');
    const ottEntity = this.oneTimeTokenRepository.create({
      token,
      createdAt: new Date(),
    });
    await this.oneTimeTokenRepository.save(ottEntity);
    return token;
  }

  async validateToken(token: string): Promise<boolean> {
    const ottEntity = await this.oneTimeTokenRepository.findOne({
      where: { token: token },
    });
    if (!ottEntity) return false;

    const isExpired =
      new Date().getTime() - ottEntity.createdAt.getTime() >
      240 * 60 * 60 * 1000;
    return !isExpired;
  }

  async removeToken(token: string): Promise<void> {
    const ottEntity = await this.oneTimeTokenRepository.findOne({
      where: { token: token },
    });
    if (ottEntity) {
      await this.oneTimeTokenRepository.remove(ottEntity);
    }
  }
}
