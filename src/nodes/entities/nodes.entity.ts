import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';
import { EvmNetworkEntity } from '../../networks/entities/evm-network.entity';

@Entity({ name: 'nodes' })
export class NodesEntity extends BaseEntity {
  @Column()
  url: string;

  @ManyToOne(() => EvmNetworkEntity, (network) => network.nodes)
  network: EvmNetworkEntity;
}
