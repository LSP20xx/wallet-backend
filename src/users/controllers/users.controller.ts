// user.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { UsersEntity } from '../entities/users.entity';
import { FindOneOptions } from 'typeorm';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  findAll(): Promise<UsersEntity[]> {
    return this.userService.findAll();
  }

  @Post()
  create(@Body() user: UsersEntity): Promise<UsersEntity> {
    return this.userService.create(user);
  }

  @Get(':id')
  findOne(@Param() options: FindOneOptions<UsersEntity>): Promise<UsersEntity> {
    return this.userService.findOne(options);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() user: UsersEntity,
  ): Promise<UsersEntity> {
    return this.userService.update(id, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.userService.remove(id);
  }
}
