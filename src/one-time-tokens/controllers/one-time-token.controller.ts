import { Controller, Post, HttpCode, Body } from '@nestjs/common';
import { OneTimeTokenService } from '../services/one-time-token.service';

@Controller('ott')
export class OneTimeTokenController {
  constructor(private readonly oneTimeTokenService: OneTimeTokenService) {}

  @Post('generate')
  @HttpCode(200)
  async generateToken(): Promise<{ token: string }> {
    const token = await this.oneTimeTokenService.createToken();
    return { token };
  }

  @Post('validate')
  async validateToken(
    @Body('token') token: string,
  ): Promise<{ isValid: boolean }> {
    const isValid = await this.oneTimeTokenService.validateToken(token);
    if (isValid) {
      await this.oneTimeTokenService.removeToken(token);
    }
    return { isValid };
  }
}
