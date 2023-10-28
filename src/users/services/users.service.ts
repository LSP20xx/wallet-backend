// user.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { UsersEntity } from '../entities/users.entity';
import { UserDTO } from '../dtos/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly userRepository: Repository<UsersEntity>,
  ) {}

  public async findAll(): Promise<UsersEntity[]> {
    return this.userRepository.find();
  }

  public async findOne(
    options: FindOneOptions<UsersEntity>,
  ): Promise<UsersEntity | undefined> {
    return this.userRepository.findOne(options);
  }

  public async create(user: UserDTO): Promise<UsersEntity> {
    return this.userRepository.save(user);
  }

  public async update(id: string, user: UsersEntity): Promise<UsersEntity> {
    return this.userRepository.save({ ...user, userID: id });
  }

  public async remove(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }
}
