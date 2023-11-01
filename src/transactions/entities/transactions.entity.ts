import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';
import { WalletsEntity } from '../../wallets/entities/wallets.entity';
import { EthereumNetworkEntity } from 'src/networks/entities/network.entity';

@Entity({ name: 'transactions' })
export class TransactionEntity extends BaseEntity {
  @Column()
  txHash: string;

  @Column()
  amount: number;

  @ManyToOne(() => WalletsEntity, (wallet) => wallet.transactions)
  wallet: WalletsEntity;

  @ManyToOne(() => EthereumNetworkEntity, (network) => network.transactions)
  network: EthereumNetworkEntity;
}
