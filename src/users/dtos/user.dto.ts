import { IsNotEmpty } from 'class-validator';
import { UserRole } from '../../enums/user-role.enum';

export class UserDTO {
  @IsNotEmpty()
  phoneNumber?: string;

  @IsNotEmpty()
  encryptedPassword?: string;

  userRole?: UserRole;
}
