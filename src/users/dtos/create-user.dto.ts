import {
  IsNotEmpty,
  IsPhoneNumber,
  IsNumberString,
  Length,
} from 'class-validator';
import { UserRole } from '../../enums/user-role.enum';

export class CreateUserDTO {
  @IsNotEmpty()
  @IsPhoneNumber()
  phoneNumber?: string;

  @IsNotEmpty()
  encryptedPassword?: string;

  @IsNotEmpty()
  @IsNumberString()
  @Length(6, 6)
  smsCode?: string;

  userRole?: UserRole;
}
