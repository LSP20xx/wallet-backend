import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as moment from 'moment';
import * as path from 'path';
import { Observable, of, throwError } from 'rxjs';
import { catchError, delay, map, retryWhen } from 'rxjs/operators';

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

  calculateOHLC(trades: any, interval: number) {
    const ohlc = [];
    let currentInterval = [];
    let startTime = trades[0][2];

    trades.forEach((trade) => {
      if (trade[2] - startTime < interval) {
        currentInterval.push(trade);
      } else {
        const open = currentInterval[0][0];
        const high = Math.max(...currentInterval.map((t) => t[0]));
        const low = Math.min(...currentInterval.map((t) => t[0]));
        const close = currentInterval[currentInterval.length - 1][0];
        ohlc.push([startTime, open, high, low, close]);
        startTime = trade[2];
        currentInterval = [trade];
      }
    });

    if (currentInterval.length > 0) {
      const open = currentInterval[0][0];
      const high = Math.max(...currentInterval.map((t) => t[0]));
      const low = Math.min(...currentInterval.map((t) => t[0]));
      const close = currentInterval[currentInterval.length - 1][0];
      ohlc.push([startTime, open, high, low, close]);
    }

    return ohlc;
  }

  async updateOneMinuteDataFromKraken() {
    try {
      const tokens = await this.prisma.token.findMany();

      console.log('Fetching data for 5 minutes from Kraken');

      for (const token of tokens) {
        const ticker = `${token.symbol.toUpperCase()}/USD`;
        const dataObservable = await this.getKrakenOhlcData(ticker, 5, 0);

        dataObservable
          .toPromise()
          .then((data) => {
            this.redisClient
              .send(
                { cmd: 'set' },
                {
                  key: `${token.name.toLowerCase()}_5m`,
                  value: JSON.stringify(data),
                },
              )
              .toPromise()
              .then((setResult) =>
                console.log(
                  `Redis set result for ${token.name.toLowerCase()}_5m:`,
                  setResult,
                ),
              )
              .catch((err) =>
                console.error(
                  `Error setting Redis value for ${token.name.toLowerCase()}:`,
                  err,
                ),
              );
          })
          .catch((error) =>
            console.error(
              `Error fetching data for ${token.name.toLowerCase()}:`,
              error,
            ),
          );
      }
    } catch (error) {
      console.error('Error fetching tokens from database:', error);
    }
  }

  async updateFiveMinutesDataFromKraken() {
    try {
      const tokens = await this.prisma.token.findMany();

      console.log('Fetching data for 5 minutes from Kraken');

      for (const token of tokens) {
        const ticker = `${token.symbol.toUpperCase()}/USD`;
        const dataObservable = await this.getKrakenOhlcData(ticker, 5, 0);

        dataObservable
          .toPromise()
          .then((data) => {
            this.redisClient
              .send(
                { cmd: 'set' },
                {
                  key: `${token.name.toLowerCase()}_5m`,
                  value: JSON.stringify(data),
                },
              )
              .toPromise()
              .then((setResult) =>
                console.log(
                  `Redis set result for ${token.name.toLowerCase()}_5m:`,
                  setResult,
                ),
              )
              .catch((err) =>
                console.error(
                  `Error setting Redis value for ${token.name.toLowerCase()}:`,
                  err,
                ),
              );
          })
          .catch((error) =>
            console.error(
              `Error fetching data for ${token.name.toLowerCase()}:`,
              error,
            ),
          );
      }
    } catch (error) {
      console.error('Error fetching tokens from database:', error);
    }
  }

  async updateFifteenMinutesDataFromKraken() {
    try {
      const tokens = await this.prisma.token.findMany();

      console.log('Fetching data for 15 minutes from Kraken');

      for (const token of tokens) {
        const ticker = `${token.symbol.toUpperCase()}/USD`;
        const dataObservable = await this.getKrakenOhlcData(ticker, 15, 0);

        dataObservable
          .toPromise()
          .then((data) => {
            this.redisClient
              .send(
                { cmd: 'set' },
                {
                  key: `${token.name.toLowerCase()}_15m`,
                  value: JSON.stringify(data),
                },
              )
              .toPromise()
              .then((setResult) =>
                console.log(
                  `Redis set result for ${token.name.toLowerCase()}_15m:`,
                  setResult,
                ),
              )
              .catch((err) =>
                console.error(
                  `Error setting Redis value for ${token.name.toLowerCase()}:`,
                  err,
                ),
              );
          })
          .catch((error) =>
            console.error(
              `Error fetching data for ${token.name.toLowerCase()}:`,
              error,
            ),
          );
      }
    } catch (error) {
      console.error('Error fetching tokens from database:', error);
    }
  }

  async updateOneHourDataFromKraken() {
    try {
      const tokens = await this.prisma.token.findMany();

      console.log('Fetching data for 1 hour from Kraken');

      for (const token of tokens) {
        const ticker = `${token.symbol.toUpperCase()}/USD`;
        const dataObservable = await this.getKrakenOhlcData(ticker, 60, 0);

        dataObservable
          .toPromise()
          .then((data) => {
            this.redisClient
              .send(
                { cmd: 'set' },
                {
                  key: `${token.name.toLowerCase()}_1h`,
                  value: JSON.stringify(data),
                },
              )
              .toPromise()
              .then((setResult) =>
                console.log(
                  `Redis set result for ${token.name.toLowerCase()}_1h:`,
                  setResult,
                ),
              )
              .catch((err) =>
                console.error(
                  `Error setting Redis value for ${token.name.toLowerCase()}:`,
                  err,
                ),
              );
          })
          .catch((error) =>
            console.error(
              `Error fetching data for ${token.name.toLowerCase()}:`,
              error,
            ),
          );
      }
    } catch (error) {
      console.error('Error fetching tokens from database:', error);
    }
  }

  async updateFourHoursDataFromKraken() {
    try {
      const tokens = await this.prisma.token.findMany();

      console.log('Fetching data for 4 hours from Kraken');

      for (const token of tokens) {
        const ticker = `${token.symbol.toUpperCase()}/USD`;
        const dataObservable = await this.getKrakenOhlcData(ticker, 240, 0);

        dataObservable
          .toPromise()
          .then((data) => {
            this.redisClient
              .send(
                { cmd: 'set' },
                {
                  key: `${token.name.toLowerCase()}_4h`,
                  value: JSON.stringify(data),
                },
              )
              .toPromise()
              .then((setResult) =>
                console.log(
                  `Redis set result for ${token.name.toLowerCase()}_4h:`,
                  setResult,
                ),
              )
              .catch((err) =>
                console.error(
                  `Error setting Redis value for ${token.name.toLowerCase()}:`,
                  err,
                ),
              );
          })
          .catch((error) =>
            console.error(
              `Error fetching data for ${token.name.toLowerCase()}:`,
              error,
            ),
          );
      }
    } catch (error) {
      console.error('Error fetching tokens from database:', error);
    }
  }

  async updateOneDayDataFromKraken() {
    try {
      const tokens = await this.prisma.token.findMany();

      console.log('Fetching data for 1 day from Kraken');

      for (const token of tokens) {
        const ticker = `${token.symbol.toUpperCase()}/USD`;
        const dataObservable = await this.getKrakenOhlcData(ticker, 1440, 0);

        dataObservable
          .toPromise()
          .then((data) => {
            this.redisClient
              .send(
                { cmd: 'set' },
                {
                  key: `${token.name.toLowerCase()}_1d`,
                  value: JSON.stringify(data),
                },
              )
              .toPromise()
              .then((setResult) =>
                console.log(
                  `Redis set result for ${token.name.toLowerCase()}_1d:`,
                  setResult,
                ),
              )
              .catch((err) =>
                console.error(
                  `Error setting Redis value for ${token.name.toLowerCase()}:`,
                  err,
                ),
              );
          })
          .catch((error) =>
            console.error(
              `Error fetching data for ${token.name.toLowerCase()}:`,
              error,
            ),
          );
      }
    } catch (error) {
      console.error('Error fetching tokens from database:', error);
    }
  }

  async updateOneWeekDataFromKraken() {
    try {
      const tokens = await this.prisma.token.findMany();

      console.log('Fetching data for 1 week from Kraken');

      for (const token of tokens) {
        const ticker = `${token.symbol.toUpperCase()}/USD`;
        const dataObservable = await this.getKrakenOhlcData(ticker, 10080, 0);

        dataObservable
          .toPromise()
          .then((data) => {
            this.redisClient
              .send(
                { cmd: 'set' },
                {
                  key: `${token.name.toLowerCase()}_1w`,
                  value: JSON.stringify(data),
                },
              )
              .toPromise()
              .then((setResult) =>
                console.log(
                  `Redis set result for ${token.name.toLowerCase()}_1w:`,
                  setResult,
                ),
              )
              .catch((err) =>
                console.error(
                  `Error setting Redis value for ${token.name.toLowerCase()}:`,
                  err,
                ),
              );
          })
          .catch((error) =>
            console.error(
              `Error fetching data for ${token.name.toLowerCase()}:`,
              error,
            ),
          );
      }
    } catch (error) {
      console.error('Error fetching tokens from database:', error);
    }
  }

  async updateOneMonthDataFromKraken() {
    try {
      const tokens = await this.prisma.token.findMany();

      console.log('Fetching data for 1 month from Kraken');

      for (const token of tokens) {
        const ticker = `${token.symbol.toUpperCase()}/USD`;
        const dataObservable = await this.getKrakenOhlcData(ticker, 43200, 0);

        dataObservable
          .toPromise()
          .then((data) => {
            this.redisClient
              .send(
                { cmd: 'set' },
                {
                  key: `${token.name.toLowerCase()}_1m`,
                  value: JSON.stringify(data),
                },
              )
              .toPromise()
              .then((setResult) =>
                console.log(
                  `Redis set result for ${token.name.toLowerCase()}_1m:`,
                  setResult,
                ),
              )
              .catch((err) =>
                console.error(
                  `Error setting Redis value for ${token.name.toLowerCase()}:`,
                  err,
                ),
              );
          })
          .catch((error) =>
            console.error(
              `Error fetching data for ${token.name.toLowerCase()}:`,
              error,
            ),
          );
      }
    } catch (error) {
      console.error('Error fetching tokens from database:', error);
    }
  }

  async updateFiveMinutesData() {
    try {
      const tokens = await this.prisma.token.findMany();

      console.log('Fetching data for 5 minutes');

      for (const token of tokens) {
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

  async updateNinetyDaysData() {
    try {
      const tokens = await this.prisma.token.findMany();
      const tickers = tokens.map(
        (token) => `${token.symbol.toUpperCase()}-USD`,
      );
      const tokenNames = tokens.map((token) => token.name.toLowerCase());

      console.log('Fetching data for 90 days');

      for (let i = 0; i < tokens.length; i++) {
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
      const tokens = await this.prisma.token.findMany();

      const tickers = tokens.map(
        (token) => `${token.symbol.toUpperCase()}-USD`,
      );

      const tokenNames = tokens.map((token) => token.name.toLowerCase());

      console.log('Fetching data for 1 day');

      for (let i = 0; i < tokens.length; i++) {
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
      console.log('Updating 5 minutes data');
      this.updateOneMinuteDataFromKraken();
      this.updateFiveMinutesDataFromKraken();
      this.updateFifteenMinutesDataFromKraken();
    }, 30000);
    setInterval(() => {
      console.log('Updating 1 hour data');

      this.updateNinetyDaysData();
      this.updateOneHourDataFromKraken();
      this.updateFourHoursDataFromKraken();
      this.updateOneDayDataFromKraken();
      this.updateOneWeekDataFromKraken();
      this.updateOneMonthDataFromKraken();
    }, 60000);
  }
  public async getCoinGeckoOhlcData(
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
    const url = `https://api.coingecko.com/api/v3/coins/${coinId}/ohlc`;
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
            console.log('data:', response.data);
            const jsonData = JSON.parse(response.data);
            const csvData = this.convertToCsv(jsonData, false);
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

  public async getKrakenOhlcData(
    pair: string,
    interval: number,
    since: number,
  ): Promise<Observable<any>> {
    console.log('llega a getKrakenOhlcData');
    const url = `https://api.kraken.com/0/public/OHLC?pair=${pair}&interval=${interval}&since=${since}`;
    return this.httpService.get(url, { responseType: 'text' }).pipe(
      map((response) => {
        if (typeof response.data === 'string') {
          const parsedData = JSON.parse(response.data);
          if (!parsedData.result || !parsedData.result[pair]) {
            this.logger.warn(`No data found for pair ${pair}, skipping.`);
            return of([]);
          }
          const jsonData = parsedData.result[pair];
          const csvData = this.convertToCsv(jsonData, true);
          return this.saveCsv(csvData, pair, interval.toString());
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
          () => new Error(`Error fetching data from Kraken: ${error.message}`),
        );
      }),
    );
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
        retryWhen((errors) =>
          errors.pipe(
            delay(5000), // Delay for 5 seconds before retrying
            catchError((error) => {
              if (error.response?.status === 429) {
                return throwError(
                  () =>
                    new Error(
                      `Gave up fetching data from CoinGecko: ${error.message}`,
                    ),
                );
              } else {
                return throwError(() => error);
              }
            }),
          ),
        ),
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

  private convertToCsv(data: any[], inMilliseconds = true): string {
    let csvContent = 'Date,Open,High,Low,Close\n';
    data.forEach((item) => {
      const localTimestamp = new Date(item[0] * (inMilliseconds ? 1 : 1000));
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
      csvContent += `${formattedDate},${item[1]},${item[2]},${item[3]},${item[4]}\n`;
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
