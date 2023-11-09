import { IsEmail, IsOptional, Length } from 'class-validator';

export class SignTokenDTO {
  userId: string;
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @Length(7, 20)
  phoneNumber?: string;
}
