import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CheckPasswordDTO {
  @IsNotEmpty()
  login: string;

  @IsString()
  @MinLength(8)
  @MaxLength(20)
  password: string;
}
