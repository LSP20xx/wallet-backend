import { Injectable } from '@nestjs/common';
import { CreateUserDTO } from '../../users/dtos/create-user.dto';
@Injectable()
export class SignUpService {
  signUpUser(createUserDto: CreateUserDTO) {
    return createUserDto;
  }
}
