import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IsEitherPhoneOrEmail } from '../../validators/is-either-phone-or-email-constraint.validator';

export class CheckAuthDataDTO {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @Length(7, 20)
  phoneNumber?: string;

  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[a-z]).{8,20}$/, {
    message: 'Password is too weak',
  })
  password: string;

  @IsNotEmpty()
  isLogin: boolean;

  @IsEitherPhoneOrEmail({
    message: 'You must provide either an email address or a phone number.',
  })
  eitherPhoneOrEmail: boolean = true;
}
