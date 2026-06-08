import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Order } from './order.entity';

export type ApplicationStatus =
  | 'submitted'
  | 'under_review'
  | 'sent_to_crystal'
  | 'approved'
  | 'rejected'
  | 'funds_received'
  | 'production_queue'
  | 'in_production'
  | 'quality_check'
  | 'ready'
  | 'delivered';

@Entity('coin_applications')
export class CoinApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'public_id', unique: true })
  publicId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (u) => u.applications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'coin_type' })
  coinType: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ name: 'metal_purity', type: 'decimal', precision: 5, scale: 2, default: 999 })
  metalPurity: number;

  @Column({ name: 'coin_value', type: 'decimal', precision: 12, scale: 2 })
  coinValue: number;

  @Column({ default: 'submitted' })
  status: ApplicationStatus;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'metal_type', type: 'varchar', nullable: true })
  metalType: string | null;

  @Column({ name: 'financing_preference', type: 'varchar', nullable: true })
  financingPreference: string | null;

  @Column({ name: 'financing_term_months', type: 'int', nullable: true })
  financingTermMonths: number | null;

  @Column({ name: 'delivery_address', type: 'text', nullable: true })
  deliveryAddress: string | null;

  @Column({ name: 'additional_notes', type: 'text', nullable: true })
  additionalNotes: string | null;

  @Column({ name: 'crystal_sent', default: false })
  crystalSent: boolean;

  @OneToMany(() => Order, (o) => o.application)
  orders: Order[];

  @CreateDateColumn({ name: 'submitted_at' })
  submittedAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

export function applicationView(app: CoinApplication, userName?: string) {
  return {
    id: app.publicId,
    internalId: app.id,
    user: userName ?? app.userId,
    userId: app.userId,
    coinType: app.coinType,
    quantity: app.quantity,
    metalPurity: Number(app.metalPurity),
    coinValue: Number(app.coinValue),
    status: app.status,
    crystal: app.crystalSent ? 'Yes' : '—',
    notes: app.notes,
    metalType: app.metalType,
    financingPreference: app.financingPreference,
    financingTermMonths: app.financingTermMonths,
    deliveryAddress: app.deliveryAddress,
    additionalNotes: app.additionalNotes,
    submittedAt: app.submittedAt.toISOString(),
    updatedAt: app.updatedAt.toISOString(),
  };
}
