import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionEntity } from '../entities/session.entity';
import { UsersService } from '../../users/services/users.service';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(SessionEntity)
    private readonly sessionRepository: Repository<SessionEntity>,
    private readonly usersService: UsersService,
  ) {}

  async createSession(userId: string, token: string): Promise<SessionEntity> {
    const user = await this.usersService.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new Error('User not found');
    }

    const session = this.sessionRepository.create({ user, token });
    return this.sessionRepository.save(session);
  }

  async findSessionByToken(token: string): Promise<SessionEntity | null> {
    return this.sessionRepository.findOne({ where: { token } });
  }

  async deleteSession(token: string): Promise<void> {
    const session = await this.findSessionByToken(token);
    if (session) {
      await this.sessionRepository.delete(session.id);
    }
  }
}
