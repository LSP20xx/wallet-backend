import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';
import { WalletsEntity } from '../../wallets/entities/wallets.entity';
import { EvmNetworkEntity } from '../../networks/entities/evm-network.entity';

@Entity({ name: 'transactions' })
export class TransactionEntity extends BaseEntity {
  @Column()
  txHash: string;

  @Column()
  from: string;

  @Column()
  to: string;

  @Column()
  amount: number;

  @ManyToOne(() => WalletsEntity, (wallet) => wallet.transactions)
  wallet: WalletsEntity;

  @ManyToOne(() => EvmNetworkEntity, (network) => network.transactions)
  network: EvmNetworkEntity;
}
