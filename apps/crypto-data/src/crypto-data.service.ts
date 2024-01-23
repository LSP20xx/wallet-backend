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

  private validateHeaders(headers: string[]): boolean {
    const expectedHeaders = [
      'Date',
      'Open',
      'High',
      'Low',
      'Close',
      'Adj Close',
      'Volume',
    ];
    return (
      headers.length === expectedHeaders.length &&
      headers.every((header, index) => header === expectedHeaders[index])
    );
  }

  private saveCsv = async (csv: string, ticker: string, interval: string) => {
    const lines = csv.split('\n');
    const headers = lines[0].split(',');

    if (!this.validateHeaders(headers)) {
      throw new Error('Invalid CSV headers');
    }

    const csvFilePath = path.join(
      __dirname,
      '../../../data',
      `${ticker}_${interval}.csv`,
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
      // Proporciona un mensaje de error más específico
      throw new Error(`Error saving CSV: ${error.message}`);
    }
  };

  public async getYahooFinanceData(
    ticker: string,
    days: number,
    interval: string = '1d',
  ) {
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
        this.saveCsv(csv, ticker, interval);
        const lines = csv.split('\n');
        const result = [];
        const headers = lines[0].split(',');

        if (!this.validateHeaders(headers)) {
          throw new Error('Encabezados del CSV no válidos');
        }

        result.push(headers);
        for (let i = 1; i < lines.length; i++) {
          const obj = {};
          const currentline = lines[i].split(',');
          for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentline[j];
          }
          result.push(obj);
        }

        const csvFilePath = path.join(
          __dirname,
          '../../../data',
          `${ticker}_1d.csv`,
        );

        const csvData = result
          .map((obj) => Object.values(obj).join(','))
          .join('\n');
        const directory = path.dirname(csvFilePath);
        if (!fs.existsSync(directory)) {
          fs.mkdirSync(directory, { recursive: true });
        }
        fs.writeFileSync(csvFilePath, csvData);
        return result;
      }),
    );
  }
}
