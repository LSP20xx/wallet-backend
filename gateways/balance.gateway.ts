import { OnModuleInit } from '@nestjs/common';
import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { BalancesService } from 'apps/billete/src/wallets/services/balance.service';
import { Redis } from 'ioredis';
import { Socket } from 'socket.io';
@WebSocketGateway()
export class BalanceGateway implements OnModuleInit {
  @WebSocketServer() server;
  private redisSubscriber: Redis;

  constructor(private readonly balancesService: BalancesService) {
    this.redisSubscriber = new Redis();
  }

  onModuleInit() {
    this.redisSubscriber.subscribe('balanceUpdate');
    this.redisSubscriber.on('message', this.handleRedisMessage.bind(this));
  }

  private handleRedisMessage(channel: string, message: string) {
    if (channel === 'balanceUpdate') {
      const { userId, balance } = JSON.parse(message);
      this.server.to(userId).emit('balance-update', { balance });
    }
  }

  @SubscribeMessage('requestBalanceUpdate')
  async handleBalanceRequest(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ): Promise<void> {
    console.log('requestBalanceUpdate', data);
    const balances = await this.balancesService.getBalancesForUser(data.userId);
    client.emit('balance-update', balances);
  }
}
