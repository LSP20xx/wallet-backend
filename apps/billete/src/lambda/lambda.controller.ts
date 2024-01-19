import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from 'apps/billete/src/auth/guards/authenticated.guard';
import { LambdaService } from './lambda.service';

@Controller('lambda')
export class LambdaController {
  constructor(private readonly lambdaService: LambdaService) {}

  @UseGuards(AuthenticatedGuard)
  @Post('withdraw-from-kraken')
  async invoke(@Body() body: any) {
    return await this.lambdaService.invokeLambdaFunction(
      'WithdrawFromKraken',
      body,
    );
  }
}
