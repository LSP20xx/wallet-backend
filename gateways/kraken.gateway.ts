import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import BigNumber from 'bignumber.js';
import * as WebSocket from 'ws';

@WebSocketGateway()
export class KrakenGateway {
  @WebSocketServer() server: any;
  private ws: WebSocket;
  private lastHeartbeat: Date;
  private prices: Map<
    string,
    { actualPrice: BigNumber; spreadPrice: BigNumber }
  > = new Map();

  constructor() {
    this.lastHeartbeat = new Date();
    this.setInitialUSDValue();
    this.connectWebSocket();
    this.startHeartbeatCheck();
  }

  private setInitialUSDValue() {
    const actualPriceUSD = new BigNumber(1);
    const spreadPriceUSD = actualPriceUSD.multipliedBy(0.99);
    this.prices.set('USD', {
      actualPrice: actualPriceUSD,
      spreadPrice: spreadPriceUSD,
    });
    console.log('USD prices set:', {
      actualPrice: actualPriceUSD.toFixed(),
      spreadPrice: spreadPriceUSD.toFixed(),
    });
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
          let symbol = message[3].split('/')[0];
          if (symbol === 'XBT') symbol = 'BTC';
          else if (symbol === 'XDG') symbol = 'DOGE';
          const actualPrice = new BigNumber(message[1]['c'][0]);
          const spreadPrice = actualPrice.multipliedBy(0.99);
          message[1]['s'] = [spreadPrice];
          this.prices.set(symbol, { actualPrice, spreadPrice });

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

    this.ws.on('message', (data: WebSocket.RawData) => {
      const message = JSON.parse(data.toString());
      if (message[2] == 'ticker') {
        const closePrice = new BigNumber(message[1]['c'][0]);
        const spreadValue = closePrice.multipliedBy(0.99);
        message[1]['s'] = [spreadValue.toFixed()];
        this.server.emit('kraken-ticker-data', {
          symbol: message[3],
          price: spreadValue.toFixed(),
        });
      }
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

  getPrice(
    symbol: string,
  ): { actualPrice: BigNumber; spreadPrice: BigNumber } | undefined {
    return this.prices.get(symbol);
  }

  subscribeToChannels() {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          event: 'subscribe',
          pair: [
            'XBT/USD',
            'ETH/USD',
            'DOGE/USD',
            'LTC/USD',
            'USDC/USD',
            'USDT/USD',
            'SOL/USD',
          ],
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
          pair: [
            'XBT/USD',
            'ETH/USD',
            'DOGE/USD',
            'LTC/USD',
            'USDC/USD',
            'SOL/USD',
            'USDT/USD',
          ],
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
          pair: [
            'XBT/USD',
            'ETH/USD',
            'DOGE/USD',
            'LTC/USD',
            'USDC/USD',
            'SOL/USD',
            'USDT/USD',
          ],
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
          pair: [
            'XBT/USD',
            'ETH/USD',
            'DOGE/USD',
            'LTC/USD',
            'USDC/USD',
            'SOL/USD',
            'USDT/USD',
          ],
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
          pair: [
            'XBT/USD',
            'ETH/USD',
            'DOGE/USD',
            'LTC/USD',
            'USDC/USD',
            'SOL/USD',
            'USDT/USD',
          ],
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
          pair: [
            'XBT/USD',
            'ETH/USD',
            'DOGE/USD',
            'LTC/USD',
            'USDC/USD',
            'SOL/USD',
            'USDT/USD',
          ],
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
          pair: [
            'XBT/USD',
            'ETH/USD',
            'DOGE/USD',
            'LTC/USD',
            'USDC/USD',
            'SOL/USD',
          ],
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
          pair: [
            'XBT/USD',
            'ETH/USD',
            'DOGE/USD',
            'LTC/USD',
            'USDC/USD',
            'SOL/USD',
            'USDT/USD',
          ],
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
          pair: [
            'XBT/USD',
            'ETH/USD',
            'DOGE/USD',
            'LTC/USD',
            'USDC/USD',
            'SOL/USD',
            'USDT/USD',
          ],
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
