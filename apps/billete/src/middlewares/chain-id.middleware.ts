import {
  Injectable,
  NestMiddleware,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ChainIdMiddleware implements NestMiddleware {
  private readonly allowedChainIds = new Set(
    process.env.ALLOWED_CHAIN_IDS.split(','),
  );

  use(req: Request, res: Response, next: NextFunction) {
    const chainIdHeader = req.headers['x-chain-id'];
    const chainId = Array.isArray(chainIdHeader)
      ? chainIdHeader[0]
      : chainIdHeader;

    if (!chainId || !this.allowedChainIds.has(chainId)) {
      throw new BadRequestException('Invalid or missing chain ID.');
    }

    req['chainId'] = chainId;
    next();
  }
}
