import { BaseEntity } from '../../config/base.entity';
import { TradeOrdersEntity } from '../../trade-orders/entities/trade-orders.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { WalletsEntity } from '../../wallets/entities/wallets.entity';
import { SessionEntity } from '../../session/entities/session.entity';

@Entity({ name: 'users' })
export class UsersEntity extends BaseEntity {
  @Column({ unique: true })
  phoneNumber: string;

  @Column()
  encryptedPassword: string;
  /*
  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  userRole: UserRole;
  */
  @OneToMany(() => WalletsEntity, (wallet) => wallet.user)
  wallets: WalletsEntity[];

  @OneToMany(() => TradeOrdersEntity, (order) => order.seller)
  sellOrders: TradeOrdersEntity[];

  @OneToMany(() => TradeOrdersEntity, (order) => order.buyer)
  buyOrders: TradeOrdersEntity[];

  @OneToMany(() => SessionEntity, (session) => session.user)
  sessions: SessionEntity[];
}
