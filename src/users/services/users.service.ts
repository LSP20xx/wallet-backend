// user.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { UsersEntity } from '../entities/users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity)
    private userRepository: Repository<UsersEntity>,
  ) {}

  findAll(): Promise<UsersEntity[]> {
    return this.userRepository.find();
  }

  findOne(
    options: FindOneOptions<UsersEntity>,
  ): Promise<UsersEntity | undefined> {
    return this.userRepository.findOne(options);
  }

  create(user: UsersEntity): Promise<UsersEntity> {
    return this.userRepository.save(user);
  }

  update(id: string, user: UsersEntity): Promise<UsersEntity> {
    return this.userRepository.save({ ...user, userID: id });
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }
}
