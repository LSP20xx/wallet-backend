// RegisterUserDTO.ts
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  Length,
  // MaxLength,
  // MinLength,
} from 'class-validator';
// import { IsEitherPhoneOrEmail } from 'apps/billete/src/validators/is-either-phone-or-email-constraint.validator';

export class SignUpDTO {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @Length(7, 20)
  phoneNumber?: string;

  // @IsOptional()
  // @MinLength(3)
  // @MaxLength(30)
  // firstName: string;

  // @IsOptional()
  // @MinLength(3)
  // @MaxLength(30)
  // lastName: string;

  @IsNotEmpty()
  tempId: string;

  // @IsEitherPhoneOrEmail({
  //   message: 'You must provide either an email address or a phone number.',
  // })
  // eitherPhoneOrEmail: boolean = true;
}
