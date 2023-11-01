// user.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { UsersEntity } from '../entities/users.entity';
import { CreateUserDTO } from '../dtos/create-user.dto';

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

  public async create(createUser: CreateUserDTO): Promise<UsersEntity> {
    return this.userRepository.save(createUser);
  }

  public async update(id: string, user: UsersEntity): Promise<UsersEntity> {
    return this.userRepository.save({ ...user, userID: id });
  }

  public async remove(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }
}
