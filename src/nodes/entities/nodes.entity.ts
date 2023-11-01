import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';
import { EthereumNetworkEntity } from '../../networks/entities/network.entity';

@Entity({ name: 'nodes' })
export class NodesEntity extends BaseEntity {
  @Column()
  url: string;

  @ManyToOne(() => EthereumNetworkEntity, (network) => network.nodes)
  network: EthereumNetworkEntity;
}
