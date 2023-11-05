import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';
import { WalletsEntity } from '../../wallets/entities/wallets.entity';
import { EvmNetworkEntity } from '../../networks/entities/evm-network.entity';
import { TransactionEntity } from '../../transactions/entities/transaction.entity';

@Entity({ name: 'evm-tokens' })
export class EvmTokensEntity extends BaseEntity {
  @Column()
  symbol: string;

  @Column()
  contractAddress: string;

  @ManyToOne(() => WalletsEntity, (wallet) => wallet.tokens)
  wallet: WalletsEntity;

  @ManyToOne(() => EvmNetworkEntity, (network) => network.tokens)
  network: EvmNetworkEntity;

  @OneToMany(() => EvmTokensEntity, (token) => token.network)
  tokens: EvmTokensEntity[];

  @OneToMany(() => TransactionEntity, (transaction) => transaction.network)
  transactions: TransactionEntity[];
}
