import { IsNotEmpty, IsString } from 'class-validator';

export class SendTransactionDto {
  @IsNotEmpty()
  @IsString()
  from: string;
  @IsNotEmpty()
  @IsString()
  to: string;
  @IsNotEmpty()
  @IsString()
  amount: string;
  @IsNotEmpty()
  @IsString()
  encryptedPrivateKey: string;
}
