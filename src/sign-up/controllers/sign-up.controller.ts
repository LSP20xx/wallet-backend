import { Controller, Post, Body } from '@nestjs/common';
import { SignUpService } from '../services/sign-up.service';
import { CreateUserDTO } from '../../users/dtos/create-user.dto';
@Controller('sign-up')
export class SignUpController {
  constructor(private readonly signUpService: SignUpService) {}

  @Post()
  signUpUser(@Body() createUserDto: CreateUserDTO) {
    return this.signUpService.signUpUser(createUserDto);
  }
}
