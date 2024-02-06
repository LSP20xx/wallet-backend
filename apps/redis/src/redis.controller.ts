import { Body, Controller, Param } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { RedisService } from './redis.service';

@Controller()
export class RedisController {
  constructor(private readonly redisService: RedisService) {}

  @EventPattern({ cmd: 'set' })
  async setKey(@Body() body: { key: string; value: string }) {
    await this.redisService.set(body.key, body.value);
    return { message: 'Value set successfully' };
  }

  @EventPattern({ cmd: 'get' })
  async getKey(data: { key: string }) {
    const value = await this.redisService.get(data.key);
    if (value === null) {
      return { message: 'Key not found' };
    }
    return { key: data.key, value };
  }

  @EventPattern({ cmd: 'del' })
  async delKey(@Param('key') key: string) {
    await this.redisService.del(key);
    return { message: 'Key deleted successfully' };
  }
}
