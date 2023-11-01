import { Controller, Post, Body, Delete, Param } from '@nestjs/common';
import { SessionService } from '../services/session.service';

@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  createSession(@Body('userId') userId: string, @Body('token') token: string) {
    return this.sessionService.createSession(userId, token);
  }

  @Delete(':token')
  deleteSession(@Param('token') token: string) {
    return this.sessionService.deleteSession(token);
  }
}
