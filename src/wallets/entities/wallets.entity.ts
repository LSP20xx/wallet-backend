import Big from 'big.js';
import { EvmNetworkEntity } from '../../networks/entities/evm-network.entity';
import { EvmTokensEntity } from '../../tokens/entities/evm-tokens.entity';
import { TransactionEntity } from '../../transactions/entities/transactions.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';
import { UsersEntity } from '../../users/entities/users.entity';

@Entity({ name: 'wallets' })
export class WalletsEntity extends BaseEntity {
  @Column({
    type: 'varchar',
    default: '0',
    transformer: {
      from: (value: string) => new Big(value),
      to: (value: Big) => (value ? value.toString() : '0'),
    },
  })
  balance: Big;

  @Column({ unique: true })
  address: string;

  @Column({ unique: true })
  encryptedPrivateKey: string;

  @ManyToOne(() => UsersEntity, (user) => user.wallets)
  user: UsersEntity;

  @ManyToOne(() => EvmNetworkEntity, (network) => network.wallets)
  network: EvmNetworkEntity;

  @OneToMany(() => TransactionEntity, (transaction) => transaction.wallet)
  transactions: TransactionEntity[];

  @OneToMany(() => EvmTokensEntity, (token) => token.wallet)
  tokens: EvmTokensEntity[];
}
