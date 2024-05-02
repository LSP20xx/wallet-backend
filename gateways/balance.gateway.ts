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
    console.log('Redis Message Received', message);
    if (channel === 'balanceUpdate') {
      const parsedMessage = JSON.parse(message);
      const { userId, balance } = parsedMessage;
      if (userId && balance !== undefined) {
        console.log(
          `Emitting balance update to userId: ${userId} with balance: ${balance}`,
        );
        try {
          this.server.to(userId).emit('balance-update', { balance });
        } catch (error) {
          console.error(`Error emitting to userId ${userId}:`, error);
        }
      } else {
        console.error('Invalid message format received from Redis:', message);
      }
    }
  }

  @SubscribeMessage('subscribeToBalanceUpdate')
  handleSubscribeToBalanceUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ) {
    client.join(data.userId);
    console.log(
      `Client subscribed to balance updates for userId: ${data.userId}`,
    );
    // this.server
    //   .to(data.userId)
    //   .emit('balance-update', { balance: 'Test Balance' });
  }

  @SubscribeMessage('requestBalanceUpdate')
  async handleBalanceRequest(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ): Promise<void> {
    console.log('requestBalanceUpdate', data);
    const balances = await this.balancesService.getBalancesForUser(data.userId);

    console.log('BALANCES', balances);
    client.emit('balance-update', balances);
  }
}
