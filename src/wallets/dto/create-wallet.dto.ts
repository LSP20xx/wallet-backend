import { IsNotEmpty, IsString } from 'class-validator';

export class CreateWalletDto {
  @IsNotEmpty()
  @IsString()
  readonly userId: string;

  @IsNotEmpty()
  @IsString()
  readonly networkId: string;
}
