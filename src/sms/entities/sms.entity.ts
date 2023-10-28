import { BaseEntity } from '../../config/base.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('sms')
export class SmsEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
  })
  createdAt: Date;
  @Column({ type: 'text', nullable: false })
  to: string;

  @Column({ type: 'text', nullable: false })
  code: string;
}
