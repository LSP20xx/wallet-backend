// tradeOrder.entity.ts
import Big from 'big.js';
import { UsersEntity } from '../../users/entities/users.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity()
export class TradeOrdersEntity {
  @PrimaryGeneratedColumn('uuid')
  orderID: string;

  @ManyToOne(() => UsersEntity)
  seller: UsersEntity;

  @ManyToOne(() => UsersEntity)
  buyer: UsersEntity;

  @Column({
    type: 'varchar',
    transformer: {
      from: (value: string) => new Big(value),
      to: (value: Big) => value.toString(),
    },
  })
  balance: Big;

  @Column({
    type: 'varchar',
    transformer: {
      from: (value: string) => new Big(value),
      to: (value: Big) => value.toString(),
    },
  })
  pricePerUnit: Big;
  /*
  @Column()
  currencyType: Currency;

  @Column()
  tradeStatus: TradeStatus;*/
}
