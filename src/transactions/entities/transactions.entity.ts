import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';
import { WalletsEntity } from '../../wallets/entities/wallets.entity';
import { EvmNetworkEntity } from 'src/networks/entities/evm-network.entity';

@Entity({ name: 'transactions' })
export class TransactionEntity extends BaseEntity {
  @Column()
  txHash: string;

  @Column()
  amount: number;

  @ManyToOne(() => WalletsEntity, (wallet) => wallet.transactions)
  wallet: WalletsEntity;

  @ManyToOne(() => EvmNetworkEntity, (network) => network.transactions)
  network: EvmNetworkEntity;
}
