// RegisterUserDTO.ts
import { IsNotEmpty } from 'class-validator';

export class SignInDTO {
  @IsNotEmpty()
  login: string;

  @IsNotEmpty()
  tempId: string;

  // @Validate(IsEitherPhoneOrEmail, {
  //   message: 'You must provide either an email address or a phone number.',
  // })
  // isEitherPhoneOrEmail: boolean;
}
