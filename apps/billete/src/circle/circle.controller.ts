import { Controller, Post } from '@nestjs/common';
import { CircleService } from './circle.service';

@Controller('circle')
export class CircleController {
  constructor(private readonly circleService: CircleService) {}

  @Post()
  async createWallets(): Promise<any> {
    return this.circleService.createWallets();
  }
}
