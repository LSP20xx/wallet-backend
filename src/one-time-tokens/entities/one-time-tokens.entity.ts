import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class OneTimeTokenEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;

  @Column()
  createdAt: Date;
}
