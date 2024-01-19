/* eslint-disable @typescript-eslint/no-unused-vars */
// src/bitcoin/bitcoin.controller.ts
import { Controller, Post, Param } from '@nestjs/common';
import { UtxoChainService } from '../services/utxo-chain.service';

@Controller('bitcoin')
export class UtxoChainController {
  constructor(private utxoChainService: UtxoChainService) {}

  @Post(':txid')
  handleTransaction(@Param('txid') txid: string) {
    //this.utxoChainService.handleTransaction(txid);
  }
}
