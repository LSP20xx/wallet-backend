import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DatabaseService } from 'apps/billete/src/database/services/database/database.service';

@Injectable()
export class CryptoDataService {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    private databaseService: DatabaseService,
  ) {}

  getCoinGeckoData(coinId: string, days: number): Observable<any> {
    const interval = days === 1 ? 'minutely' : days <= 90 ? 'hourly' : 'daily';
    const params = { vs_currency: 'usd', days: days, interval: interval };
    const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`;
    const headers = {
      x_cg_demo_api_key: this.configService.get('COINGECKO_API_KEY'),
    };

    return this.httpService
      .get(url, { headers, params })
      .pipe(map((response) => response.data));
  }
}
