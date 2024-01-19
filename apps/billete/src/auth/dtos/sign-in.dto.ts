// RegisterUserDTO.ts
import { IsNotEmpty, Matches, MaxLength, MinLength } from 'class-validator';

export class SignInDTO {
  @IsNotEmpty()
  login: string;

  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password is too weak',
  })
  password: string;

  // @Validate(IsEitherPhoneOrEmail, {
  //   message: 'You must provide either an email address or a phone number.',
  // })
  // isEitherPhoneOrEmail: boolean;
}
