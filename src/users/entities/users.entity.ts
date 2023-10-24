import { BaseEntity } from '../../config/base.entity';
import { UserRole } from '../../enums/user-role.enum';
import { TradeOrdersEntity } from '../../trade-orders/entities/trade-orders.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { WalletsEntity } from '../../wallets/entities/wallets.entity';
@Entity({ name: 'users' })
export class UsersEntity extends BaseEntity {
  @Column({ unique: true })
  phoneNumber: number;
  @Column()
  encryptedPassword: string;
  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  userRole: UserRole;
  @OneToMany(() => WalletsEntity, (wallet) => wallet.user)
  wallets: WalletsEntity[];

  @OneToMany(() => TradeOrdersEntity, (order) => order.seller)
  sellOrders: TradeOrdersEntity[];

  @OneToMany(() => TradeOrdersEntity, (order) => order.buyer)
  buyOrders: TradeOrdersEntity[];
}
