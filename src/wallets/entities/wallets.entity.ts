import Big from 'big.js';
import { BaseEntity } from '../../config/base.entity';
import { Currency } from '../../enums';
import { UsersEntity } from '../../users/entities/users.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity({ name: 'wallets' })
export class WalletsEntity extends BaseEntity {
  @Column({ type: 'enum', enum: Currency })
  currencyType: Currency;

  @Column({
    type: 'varchar',
    transformer: {
      from: (value: string) => new Big(value),
      to: (value: Big) => value.toString(),
    },
  })
  balance: Big;

  @Column({ unique: true })
  address: string;

  @Column({ unique: true })
  privateKey: string;

  @ManyToOne(() => UsersEntity, (user) => user.wallets)
  user: UsersEntity;
}
