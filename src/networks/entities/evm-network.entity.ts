import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';
import { WalletsEntity } from '../../wallets/entities/wallets.entity';
import { TransactionEntity } from '../../transactions/entities/transactions.entity';
import { EvmTokensEntity } from '../../tokens/entities/evm-tokens.entity';

@Entity({ name: 'evm-networks' })
export class EvmNetworkEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Column()
  name: string;

  @Column()
  chainId: string;

  @OneToMany(() => WalletsEntity, (wallet) => wallet.network)
  wallets: WalletsEntity[];

  @OneToMany(() => TransactionEntity, (transaction) => transaction.network)
  transactions: TransactionEntity[];

  @OneToMany(() => EvmTokensEntity, (token) => token.wallet)
  tokens: EvmTokensEntity[];
}
