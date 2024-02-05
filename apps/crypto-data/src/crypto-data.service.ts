import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as moment from 'moment';
import * as path from 'path';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class CryptoDataService implements OnModuleInit {
  private readonly logger = new Logger(CryptoDataService.name);
  private prisma: PrismaClient = new PrismaClient();

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    @Inject('REDIS_SERVICE') private redisClient: ClientProxy,
  ) {
    this.logger.log('CryptoDataService initialized');
  }

  onModuleInit() {
    this.startCronJobs();
  }

  async updateFiveMinutesData() {
    try {
      const mainnetTokens = await this.prisma.token.findMany({
        where: { network: 'MAINNET' },
      });

      for (const token of mainnetTokens) {
        const tokenName = token.name.toLowerCase();
        const ticker = `${token.symbol.toUpperCase()}-USD`;

        const dataObservable = await this.getCoinGeckoData(
          tokenName,
          1,
          ticker,
        );

        dataObservable
          .toPromise()
          .then((data) => {
            this.redisClient
              .send(
                { cmd: 'set' },
                { key: `${tokenName}_1d`, value: JSON.stringify(data) },
              )
              .toPromise()
              .then((setResult) =>
                console.log(`Redis set result for ${tokenName}_1d:`, setResult),
              )
              .catch((err) =>
                console.error(
                  `Error setting Redis value for ${tokenName}:`,
                  err,
                ),
              );
          })
          .catch((error) =>
            console.error(`Error fetching data for ${tokenName}:`, error),
          );
      }
    } catch (error) {
      console.error('Error fetching tokens from database:', error);
    }
  }

  async updateOneHourData() {
    try {
      const mainnetTokens = await this.prisma.token.findMany({
        where: {
          network: 'MAINNET',
        },
      });
      const tickers = mainnetTokens.map(
        (token) => `${token.symbol.toUpperCase()}-USD`,
      );
      const tokenNames = mainnetTokens.map((token) => token.name.toLowerCase());

      for (let i = 0; i < mainnetTokens.length; i++) {
        const ticker = tickers[i];
        const tokenName = tokenNames[i];

        const dataObservable = await this.getCoinGeckoData(
          tokenName,
          90,
          ticker,
        );

        dataObservable
          .toPromise()
          .then((data) => {
            this.redisClient
              .send(
                { cmd: 'set' },
                { key: `${tokenName}_90d`, value: JSON.stringify(data) },
              )
              .toPromise()
              .then((setResult) =>
                console.log(
                  `Redis set result for ${tokenName}_90d:`,
                  setResult,
                ),
              )
              .catch((err) =>
                console.error(
                  `Error setting Redis value for ${tokenName}:`,
                  err,
                ),
              );
          })
          .catch((error) => {
            console.error(`Error fetching data for ${tokenName}:`, error);
          });
      }
    } catch (error) {
      console.error('Error fetching tokens from database:', error);
    }
  }

  async updateOneDayData() {
    try {
      const mainnetTokens = await this.prisma.token.findMany({
        where: {
          network: 'MAINNET',
        },
      });

      const tickers = mainnetTokens.map(
        (token) => `${token.symbol.toUpperCase()}-USD`,
      );

      const tokenNames = mainnetTokens.map((token) => token.name.toLowerCase());

      for (let i = 0; i < mainnetTokens.length; i++) {
        const ticker = tickers[i];
        const tokenName = tokenNames[i];

        const dataObservable = await this.getYahooFinanceData(ticker);

        dataObservable
          .toPromise()
          .then((data) => {
            this.redisClient
              .send(
                { cmd: 'set' },
                { key: `${tokenName}_ALL`, value: JSON.stringify(data) },
              )
              .toPromise()
              .then((setResult) =>
                console.log(
                  `Redis set result for ${tokenName}_ALL:`,
                  setResult,
                ),
              )
              .catch((err) =>
                console.error(`Error setting Redis value for ${ticker}:`, err),
              );
          })
          .catch((error) => {
            console.error(`Error fetching data for ${ticker}:`, error);
          });
      }
    } catch (error) {
      console.error('Error fetching tokens from database:', error);
    }
  }

  startCronJobs() {
    setInterval(() => {
      this.updateFiveMinutesData();
    }, 30000);
    setInterval(() => {
      this.updateOneHourData();
    }, 60000);
    setInterval(() => {
      this.updateOneDayData();
    }, 60000);
  }

  public async getCoinGeckoData(
    coinId: string,
    days: number,
    ticker: string,
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
            return this.saveCsv(csvData, ticker, interval);
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
    let csvContent: string;
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
      await fs.promises.mkdir(directory, { recursive: true });

      await fs.promises.writeFile(csvFilePath, csvData);
      return lines;
    } catch (error) {
      throw new Error(`Error saving CSV: ${error.message}`);
    }
  };

  public async getYahooFinanceData(ticker: string) {
    const currentDate = moment().format('YYYY-MM-DD');
    const previousDate = '1970-01-01';

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
