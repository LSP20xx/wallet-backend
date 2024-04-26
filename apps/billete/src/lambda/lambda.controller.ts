import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { LambdaService } from './lambda.service';

@Controller('lambda')
export class LambdaController {
  constructor(private readonly lambdaService: LambdaService) {}

  // @UseGuards(AuthenticatedGuard)
  @Post('withdraw-from-kraken')
  async withdrawFromKraken(@Body() body: any) {
    return await this.lambdaService.invokeLambdaFunction(
      'WithdrawFromKraken',
      body,
    );
  }

  @Post('convert-on-kraken')
  async convertOnKraken(@Body() body: any) {
    if (!body.operation || !body.amount) {
      throw new BadRequestException('Operation and amount must be provided');
    }

    return await this.lambdaService.invokeLambdaFunction(
      'ConvertFromKraken',
      body,
    );
  }
}
