import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from '../services/users.service';
// import { User } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  // @Get()
  // findAll(): Promise<User[]> {
  //   return this.userService.findAll();
  // }

  @Get('user-info/:userId')
  getUserInfoById(@Param('userId') userId: string): Promise<{
    firstName: string;
    lastName: string;
    language: string;
    localCurrency: string;
    notifyByEmail: boolean;
    notifyByPush: boolean;
    notifyBySms: boolean;
    notifyByWhatsApp: boolean;
  } | null> {
    return this.userService.getUserInfoById(userId);
  }

  // @Put(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateUserDto: Partial<User>,
  // ): Promise<User> {
  //   return this.userService.update(id, updateUserDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string): Promise<void> {
  //   return this.userService.remove(id);
  // }
}
