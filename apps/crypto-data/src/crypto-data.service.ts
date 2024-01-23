import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import * as moment from 'moment';
import { DatabaseService } from 'apps/billete/src/database/services/database/database.service';
import * as fs from 'fs';
@Injectable()
export class CryptoDataService {
  private readonly logger = new Logger(CryptoDataService.name);

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    private databaseService: DatabaseService,
  ) {
    this.logger.log('CryptoDataService initialized');
  }

  public async getCoinGeckoData(
    coinId: string,
    days: number,
  ): Promise<Observable<any>> {
    const apiKey = this.configService.get('COINGECKO_API_KEY');
    if (!apiKey) {
      this.logger.error('API Key is missing');
      throw new Error('API Key for CoinGecko is not configured');
    }

    const params = { vs_currency: 'usd', days: days };
    const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`;
    const headers = {
      x_cg_demo_api_key: apiKey,
    };

    this.logger.log(`Requesting CoinGecko for ${coinId}`);

    return this.httpService.get(url, { headers, params }).pipe(
      map((response) => response.data),
      catchError((error) => {
        this.logger.error(`Error status: ${error.response?.status}`);
        this.logger.error(
          `Error message: ${error.response?.data?.message || error.message}`,
        );
        return throwError(
          () =>
            new Error(`Error fetching data from CoinGecko: ${error.message}`),
        );
      }),
    );
  }
  private constructDownloadUrl(
    ticker: string,
    period1: string,
    period2: string,
    interval: string = '1d',
  ) {
    const convertToSeconds = (period: string): number => {
      return moment(period, 'YYYY-MM-DD').unix();
    };

    const p1 = convertToSeconds(period1);
    const p2 = convertToSeconds(period2);
    const url = `https://query1.finance.yahoo.com/v7/finance/download/${ticker}?period1=${p1}&period2=${p2}&interval=${interval}&events=history`;
    return url;
  }

  public async getYahooFinanceData(ticker: string, days: number) {
    const currentDate = moment().format('YYYY-MM-DD');
    const previousDate = moment().subtract(days, 'days').format('YYYY-MM-DD');

    const url = this.constructDownloadUrl(
      ticker,
      previousDate,
      currentDate,
      '1d',
    );

    return this.httpService.get(url, { responseType: 'text' }).pipe(
      map((response) => {
        const csv = response.data;
        const lines = csv.split('\n');
        const result = [];
        const headers = lines[0].split(',');
        for (let i = 1; i < lines.length; i++) {
          const obj = {};
          const currentline = lines[i].split(',');
          for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentline[j];
          }
          result.push(obj);
        }
        console.log(result);
        const csvFilePath = `../../../data/${ticker}.csv`;
        const csvData = result
          .map((obj) => Object.values(obj).join(','))
          .join('\n');
        fs.writeFileSync(csvFilePath, csvData);
        return result;
      }),
    );
  }
}
