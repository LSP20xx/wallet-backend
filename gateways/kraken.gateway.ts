import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import * as WebSocket from 'ws';

@WebSocketGateway()
export class KrakenGateway {
  @WebSocketServer() server: any;
  private ws: WebSocket;
  private lastHeartbeat: Date;

  constructor() {
    this.lastHeartbeat = new Date();
    this.connectWebSocket();
    this.startHeartbeatCheck();
  }

  connectWebSocket() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
    }

    this.ws = new WebSocket('wss://ws.kraken.com/');

    this.ws.on('open', () => {
      console.log('Connection opened');
      this.subscribeToChannels();
      this.lastHeartbeat = new Date();
    });

    this.ws.on('message', (data: WebSocket.RawData) => {
      const messageString = JSON.parse(data.toString());
      if (this.server) {
        this.server.emit('kraken-data', messageString);
      } else {
        console.error('Server not initialized');
      }
      this.lastHeartbeat = new Date();
    });

    this.ws.on('error', (error) => {
      console.error('Error:', error);
      if (this.ws.readyState !== WebSocket.CLOSED) {
        this.ws.close();
      }
      setTimeout(() => this.connectWebSocket(), 5000);
    });

    this.ws.on('close', () => {
      console.log('Connection closed');
      setTimeout(() => this.connectWebSocket(), 5000);
    });

    this.ws.on('pong', () => {
      this.lastHeartbeat = new Date();
    });
  }

  subscribeToChannels() {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          event: 'subscribe',
          pair: ['XBT/USD', 'ETH/USD', 'DOGE/USD', 'LTC/USD', 'USDT/USD'],
          subscription: { name: 'ticker' },
        }),
      );
    }
  }

  startHeartbeatCheck() {
    setInterval(() => {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.ping();
      }

      if (new Date().getTime() - this.lastHeartbeat.getTime() > 10000) {
        console.log('Heartbeat perdido. Reconectando...');
        this.ws.terminate();
        this.connectWebSocket();
      }
    }, 5000);
  }
}
