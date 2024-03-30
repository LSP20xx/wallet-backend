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
      this.subscribeToOHLCOneMinute();
      this.subscribeToOHLCFiveMinutes();
      this.subscribeToOHLCFifteenMinutes();
      this.subscribeToOHLCOneHour();
      this.subscribeToOHLCFourHours();
      this.subscribeToOHLCOneDay();
      this.subscribeToOHLCOneWeek();
      this.subscribeToOHLCOneMonth();
      this.lastHeartbeat = new Date();
    });

    this.ws.on('message', (data: WebSocket.RawData) => {
      const message = JSON.parse(data.toString());
      if (this.server) {
        if (message[2]?.includes('ohlc')) {
          this.server.emit('kraken-ohlc', message);
        } else if (message[2] == 'ticker') {
          this.server.emit('kraken-data', message);
        }
        // if (message.includes('ohlc')) {
        //   console.log('OHLC:', message.includes('ohlc'));
        //   this.server.emit('kraken-ohlc', message);
        // } else if (message.includes('ticker')) {
        //   this.server.emit('kraken-data', message);
        // }
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

  subscribeToOHLCOneMinute() {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          event: 'subscribe',
          pair: ['XBT/USD', 'ETH/USD', 'DOGE/USD', 'LTC/USD', 'USDT/USD'],
          subscription: { name: 'ohlc', interval: 1 },
        }),
      );
    }
  }

  subscribeToOHLCFiveMinutes() {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          event: 'subscribe',
          pair: ['XBT/USD', 'ETH/USD', 'DOGE/USD', 'LTC/USD', 'USDT/USD'],
          subscription: { name: 'ohlc', interval: 5 },
        }),
      );
    }
  }

  subscribeToOHLCFifteenMinutes() {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          event: 'subscribe',
          pair: ['XBT/USD', 'ETH/USD', 'DOGE/USD', 'LTC/USD', 'USDT/USD'],
          subscription: { name: 'ohlc', interval: 15 },
        }),
      );
    }
  }

  subscribeToOHLCOneHour() {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          event: 'subscribe',
          pair: ['XBT/USD', 'ETH/USD', 'DOGE/USD', 'LTC/USD', 'USDT/USD'],
          subscription: { name: 'ohlc', interval: 60 },
        }),
      );
    }
  }

  subscribeToOHLCFourHours() {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          event: 'subscribe',
          pair: ['XBT/USD', 'ETH/USD', 'DOGE/USD', 'LTC/USD', 'USDT/USD'],
          subscription: { name: 'ohlc', interval: 240 },
        }),
      );
    }
  }

  subscribeToOHLCOneDay() {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          event: 'subscribe',
          pair: ['XBT/USD', 'ETH/USD', 'DOGE/USD', 'LTC/USD', 'USDT/USD'],
          subscription: { name: 'ohlc', interval: 1440 },
        }),
      );
    }
  }

  subscribeToOHLCOneWeek() {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          event: 'subscribe',
          pair: ['XBT/USD', 'ETH/USD', 'DOGE/USD', 'LTC/USD', 'USDT/USD'],
          subscription: { name: 'ohlc', interval: 10080 },
        }),
      );
    }
  }

  subscribeToOHLCOneMonth() {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          event: 'subscribe',
          pair: ['XBT/USD', 'ETH/USD', 'DOGE/USD', 'LTC/USD', 'USDT/USD'],
          subscription: { name: 'ohlc', interval: 43200 },
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
