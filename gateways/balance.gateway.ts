import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { BalancesService } from 'apps/billete/src/wallets/services/balance.service';
import { Socket } from 'socket.io';

@WebSocketGateway()
export class BalanceGateway {
  @WebSocketServer() server;

  constructor(private readonly balancesService: BalancesService) {}

  @SubscribeMessage('requestBalanceUpdate')
  async handleBalanceRequest(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ): Promise<void> {
    console.log('llega a balance gateway');
    const balances = await this.balancesService.getBalancesForUser(data.userId);
    client.emit('balance-update', balances);
  }
}
