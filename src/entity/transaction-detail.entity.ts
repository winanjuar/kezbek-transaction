import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('transaction_detail')
export class TransactionDetail {
  @PrimaryColumn('uuid')
  transaction_id: string;

  @Column()
  transaction_time: Date;

  @Index()
  @Column('uuid')
  customer_id: string;

  @Column()
  customer_name: string;

  @Column()
  customer_email: string;

  @Column()
  customer_phone: string;

  @Column()
  tier: string;

  @Column()
  remark: string;

  @Column()
  total_trx: number;

  @Index()
  @Column('uuid')
  partner_id: string;

  @Column()
  partner_api_key: string;

  @Column()
  partner_name: string;

  @Column()
  quantity: number;

  @Column()
  act_trx: number;

  @Column()
  promo_code: string;

  @Column('decimal')
  prosentase: number;

  @Column('decimal')
  point_transaction: number;

  @Column('decimal')
  point_loyalty: number;

  @Column('decimal')
  point_total: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
