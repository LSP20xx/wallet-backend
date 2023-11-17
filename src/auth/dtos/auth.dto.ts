// RegisterUserDTO.ts
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  Length,
  Matches,
  MaxLength,
  MinLength,
  Validate,
} from 'class-validator';
import { IsEitherPhoneOrEmail } from 'src/validators/is-either-phone-or-email-constraint.validator';

export class AuthDTO {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @Length(7, 20)
  phoneNumber?: string;

  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(30)
  firstName: string;

  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(30)
  lastName: string;

  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password is too weak',
  })
  password: string;

  @Validate(IsEitherPhoneOrEmail, {
    message: 'You must provide either an email address or a phone number.',
  })
  isEitherPhoneOrEmail: boolean;
}
