import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import * as moment from 'moment';
import { DatabaseService } from 'apps/billete/src/database/services/database/database.service';
import * as fs from 'fs';
import * as path from 'path';
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

    return this.httpService
      .get(url, { headers, params, responseType: 'text' })
      .pipe(
        map((response) => {
          if (typeof response.data === 'string') {
            const interval = days > 1 ? '90d' : '1d';
            const jsonData = JSON.parse(response.data).prices;
            const csvData = this.convertToCsv(jsonData);
            return this.saveCsv(csvData, coinId, interval);
          } else {
            throw new Error('Received non-CSV response');
          }
        }),
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

  private convertToCsv(data: any[]): string {
    let csvContent = 'Date,Close\n';
    data.forEach((item) => {
      const localTimestamp = new Date(item[0]);
      const utcTimestamp = new Date(localTimestamp.getTime());
      const year = utcTimestamp.getUTCFullYear();
      const month = (utcTimestamp.getUTCMonth() + 1)
        .toString()
        .padStart(2, '0');
      const day = utcTimestamp.getUTCDate().toString().padStart(2, '0');
      const hours = utcTimestamp.getUTCHours().toString().padStart(2, '0');
      const minutes = utcTimestamp.getUTCMinutes().toString().padStart(2, '0');
      const seconds = utcTimestamp.getUTCSeconds().toString().padStart(2, '0');
      const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      csvContent += `${formattedDate},${item[1]}\n`;
    });
    return csvContent;
  }

  private saveCsv = async (csv: string, name: string, interval: string) => {
    const lines = csv.split('\n');
    const csvFilePath = path.join(
      __dirname,
      '../../../data',
      `${name}_${interval}.csv`,
    );
    const csvData = lines.join('\n');
    const directory = path.dirname(csvFilePath);

    try {
      // Crear el directorio si no existe
      await fs.promises.mkdir(directory, { recursive: true });

      // Escribir los datos en el archivo CSV
      await fs.promises.writeFile(csvFilePath, csvData);
      return lines;
    } catch (error) {
      throw new Error(`Error saving CSV: ${error.message}`);
    }
  };

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
        if (typeof response.data === 'string') {
          return this.saveCsv(response.data, ticker, 'ALL');
        } else {
          throw new Error('Received non-CSV response');
        }
      }),
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
}
