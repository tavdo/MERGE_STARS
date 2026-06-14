import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('brand_line_profiles')
export class BrandLineProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', unique: true })
  userId: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', nullable: true })
  name: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'logo_url', type: 'varchar', nullable: true })
  logoUrl: string | null;

  @Column({ name: 'profile_views', type: 'int', default: 0 })
  profileViews: number;

  @Column({ name: 'qr_scans', type: 'int', default: 0 })
  qrScans: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

export function brandLineProfileView(
  row: BrandLineProfile,
  activeProducts = 0,
) {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    description: row.description,
    logoUrl: row.logoUrl,
    profileViews: row.profileViews,
    qrScans: row.qrScans,
    activeProducts,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
