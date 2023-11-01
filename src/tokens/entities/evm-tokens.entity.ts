import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';
import { WalletsEntity } from '../../wallets/entities/wallets.entity';
import { EthereumNetworkEntity } from 'src/networks/entities/network.entity';

@Entity({ name: 'tokens' })
export class EvmTokensEntity extends BaseEntity {
  @Column()
  symbol: string;

  @Column()
  contractAddress: string;

  @ManyToOne(() => WalletsEntity, (wallet) => wallet.tokens)
  wallet: WalletsEntity;

  @ManyToOne(() => EthereumNetworkEntity, (network) => network.tokens)
  network: EthereumNetworkEntity;

  @OneToMany(() => EvmTokensEntity, (token) => token.network)
  tokens: EvmTokensEntity[];
}
