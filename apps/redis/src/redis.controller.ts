import { Body, Controller, Param } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { RedisService } from './redis.service';

@Controller()
export class RedisController {
  constructor(private readonly redisService: RedisService) {}

  @EventPattern('set')
  async setKey(@Body() body: { key: string; value: string }) {
    await this.redisService.set(body.key, body.value);
    return { message: 'Value set successfully' };
  }

  @EventPattern('get')
  async getKey(data: { key: string }) {
    console.log(`Key: ${data.key}`);
    const value = await this.redisService.get(data.key);
    if (value === null) {
      return { message: 'Key not found' };
    }
    console.log(`Value: ${value}`);
    return { key: data.key, value };
  }

  @EventPattern('del/:key')
  async delKey(@Param('key') key: string) {
    await this.redisService.del(key);
    return { message: 'Key deleted successfully' };
  }
}
