import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Observable, from, throwError } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import * as moment from 'moment';
import * as fs from 'fs';
import * as path from 'path';
// import { from } from 'rxjs';
import { PrismaClient } from '@prisma/client';
import { ClientProxy } from '@nestjs/microservices';
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

  async setKey(key: string, value: string) {
    console.log('Setting key', key);
    console.log('Setting value', value);
    return this.redisClient.send('set', {
      key,
      value,
    });
  }

  async getKey(key: string) {
    return this.redisClient.send('get', {
      key,
    });
  }

  async updateFiveMinutesData() {
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

      from(this.getCoinGeckoData(tokenName, 1, ticker))
        .pipe(
          mergeMap((data) => data),
          map((data) => {
            console.log('Data', data);
            this.setKey(`${tokenName}_1d`, JSON.stringify(data));
            return data;
          }),
        )
        .subscribe({
          next: (processedData) => {
            const dataString = JSON.stringify(processedData);
            this.setKey(`${tokenName}_1d`, dataString);
          },
          error: (error) => console.error('Error processing data:', error),
        });
      /* from(this.getCoinGeckoData(tokenName, 90))
        .pipe(
          map((data) => {
            data.subscribe((data) => {
              this.setKey(`${tokenName}_90d`, JSON.stringify(data));
              return data;
            });
          }),
        )
        .subscribe({
          next: async (processedData) => {
            const dataString = JSON.stringify(processedData);
            this.setKey(`${tokenName}_90d`, dataString);
          },
          error: (error) => {
            console.error('Error processing data:', error);
          },
        }); */
    }
    /*  for (const tokenName of tokensNames) {
      from(this.getCoinGeckoData(tokenName, 1))
        .pipe(
          map((data) => {
            data.subscribe((data) => {
              this.setKey(`${tokenName}_1d`, JSON.stringify(data));
              return data;
            });
          }),
        )
        .subscribe({
          next: async (processedData) => {
            const dataString = JSON.stringify(processedData);
            this.setKey(`${tokenName}_1d`, dataString);
          },
          error: (error) => {
            console.error('Error processing data:', error);
          },
        });
    } */
  }

  async updateOneHourData() {
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

      from(this.getCoinGeckoData(tokenName, 90, ticker))
        .pipe(
          mergeMap((data) => data),
          map((data) => {
            this.setKey(`${tokenName}_90d`, JSON.stringify(data));
            return data;
          }),
        )
        .subscribe({
          next: (processedData) => {
            const dataString = JSON.stringify(processedData);
            this.setKey(`${tokenName}_90d`, dataString);
          },
          error: (error) => console.error('Error processing data:', error),
        });
      /* from(this.getCoinGeckoData(tokenName, 90))
        .pipe(
          map((data) => {
            data.subscribe((data) => {
              this.setKey(`${tokenName}_90d`, JSON.stringify(data));
              return data;
            });
          }),
        )
        .subscribe({
          next: async (processedData) => {
            const dataString = JSON.stringify(processedData);
            this.setKey(`${tokenName}_90d`, dataString);
          },
          error: (error) => {
            console.error('Error processing data:', error);
          },
        }); */
    }
    /*  for (const tokenName of tokensNames) {
      from(this.getCoinGeckoData(tokenName, 1))
        .pipe(
          map((data) => {
            data.subscribe((data) => {
              this.setKey(`${tokenName}_1d`, JSON.stringify(data));
              return data;
            });
          }),
        )
        .subscribe({
          next: async (processedData) => {
            const dataString = JSON.stringify(processedData);
            this.setKey(`${tokenName}_1d`, dataString);
          },
          error: (error) => {
            console.error('Error processing data:', error);
          },
        });
    } */
  }

  startCronJobs() {
    setInterval(() => {
      this.updateFiveMinutesData();
    }, 30000);
    setInterval(() => {
      this.updateOneHourData();
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
