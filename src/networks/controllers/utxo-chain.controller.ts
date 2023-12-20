/* eslint-disable @typescript-eslint/no-unused-vars */
// src/bitcoin/bitcoin.controller.ts
import { Controller, Post, Param } from '@nestjs/common';
import { UxtoChainService } from '../services/utxo-chain.service';

@Controller('bitcoin')
export class UxtoChainController {
  constructor(private uxtoChainService: UxtoChainService) {}

  @Post(':txid')
  handleTransaction(@Param('txid') txid: string) {
    //this.uxtoChainService.handleTransaction(txid);
  }
}
