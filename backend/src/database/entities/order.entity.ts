import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { CoinApplication } from './coin-application.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'public_id', unique: true })
  publicId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (u) => u.orders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'application_id', nullable: true })
  applicationId: string | null;

  @ManyToOne(() => CoinApplication, (a) => a.orders, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'application_id' })
  application: CoinApplication | null;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ name: 'payment_method', default: 'bank' })
  paymentMethod: string;

  @Column({ default: 'pending' })
  status: string;

  @Column({ name: 'tracking_code', type: 'varchar', nullable: true })
  trackingCode: string | null;

  @Column({ type: 'varchar', nullable: true })
  courier: string | null;

  @Column({ name: 'est_delivery_at', type: 'timestamptz', nullable: true })
  estDeliveryAt: Date | null;

  @Column({ name: 'delivery_status', default: 'pending' })
  deliveryStatus: string;

  @Column({ name: 'shipped_at', type: 'timestamptz', nullable: true })
  shippedAt: Date | null;

  @Column({ name: 'delivered_at', type: 'timestamptz', nullable: true })
  deliveredAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

export function orderView(order: Order) {
  return {
    id: order.publicId,
    internalId: order.id,
    userId: order.userId,
    applicationId: order.applicationId,
    amount: Number(order.amount),
    paymentMethod: order.paymentMethod,
    status: order.status,
    trackingCode: order.trackingCode,
    courier: order.courier,
    estDeliveryAt: order.estDeliveryAt?.toISOString() ?? null,
    deliveryStatus: order.deliveryStatus,
    shippedAt: order.shippedAt?.toISOString() ?? null,
    deliveredAt: order.deliveredAt?.toISOString() ?? null,
    createdAt: order.createdAt.toISOString(),
  };
}
