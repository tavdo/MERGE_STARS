import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CoinApplication } from './coin-application.entity';
import { Order } from './order.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ name: 'personal_id', type: 'varchar', nullable: true, unique: true })
  personalId: string | null;

  @Column({ name: 'merge_id', unique: true })
  mergeId: string;

  @Column({ name: 'founder_id', type: 'varchar', nullable: true })
  founderId: string | null;

  @Column({ name: 'brand_line_id', type: 'varchar', nullable: true })
  brandLineId: string | null;

  @Column({ type: 'jsonb', default: () => `'["user"]'` })
  roles: string[];

  @Column({ default: 'active' })
  status: string;

  @Column({ name: 'kyc_status', default: 'pending' })
  kycStatus: string;

  @Column({ name: 'avatar_url', type: 'varchar', nullable: true })
  avatarUrl: string | null;

  @Column({ name: 'referred_by_id', type: 'uuid', nullable: true })
  referredById: string | null;

  @Column({ name: 'terms_accepted_at', type: 'timestamptz', nullable: true })
  termsAcceptedAt: Date | null;

  @OneToMany(() => CoinApplication, (a) => a.user)
  applications: CoinApplication[];

  @OneToMany(() => Order, (o) => o.user)
  orders: Order[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

export function userPublicView(user: User) {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    firstName: user.firstName,
    lastName: user.lastName,
    mergeId: user.mergeId,
    founderId: user.founderId,
    brandLineId: user.brandLineId,
    roles: user.roles,
    status: user.status,
    kycStatus: user.kycStatus,
    personalId: user.personalId,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt.toISOString(),
  };
}
