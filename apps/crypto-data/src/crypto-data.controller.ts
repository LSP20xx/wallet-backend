import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { CryptoDataService } from './crypto-data.service';

@Controller()
export class CryptoDataController {
  constructor(private readonly cryptoDataService: CryptoDataService) {}

  @EventPattern('get_yahoo_finance_data')
  async getYahooFinanceData(data: { coinId: string; days: number }) {
    const { coinId } = data;
    const result = this.cryptoDataService.getYahooFinanceData(coinId);
    return result;
  }

  @EventPattern('get_coin_gecko_data')
  async getCoinGeckoData(data: {
    coinId: string;
    days: number;
    ticker: string;
  }) {
    const { coinId, days, ticker } = data;
    const result = this.cryptoDataService.getCoinGeckoData(
      coinId,
      days,
      ticker,
    );
    return result;
  }
}
