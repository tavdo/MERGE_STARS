import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

export type WalletTxType = 'credit' | 'debit';

@Entity('wallet_transactions')
export class WalletTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  /** credit = earnings in, debit = spent on order */
  @Column({ type: 'varchar', length: 16 })
  type: WalletTxType;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  amount: number;

  /** Running balance after this transaction */
  @Column({ name: 'balance_after', type: 'decimal', precision: 14, scale: 2 })
  balanceAfter: number;

  /** catalog_sale | admin_credit | coin_order | adjustment */
  @Column({ type: 'varchar', length: 64 })
  reason: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  note: string | null;

  @Column({ name: 'order_id', type: 'uuid', nullable: true })
  orderId: string | null;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string | null;

  @Column({ type: 'jsonb', nullable: true })
  meta: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

export function walletTxView(row: WalletTransaction) {
  return {
    id: row.id,
    type: row.type,
    amount: Number(row.amount),
    balanceAfter: Number(row.balanceAfter),
    reason: row.reason,
    note: row.note,
    orderId: row.orderId,
    meta: row.meta,
    createdAt: row.createdAt.toISOString(),
  };
}
