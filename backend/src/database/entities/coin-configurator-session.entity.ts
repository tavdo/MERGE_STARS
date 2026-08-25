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
import { CoinPackageConfig } from './coin-package-config.entity';
import { CoinConfiguratorProduct } from './coin-configurator-product.entity';

export type ConfiguratorSessionStatus = 'draft' | 'finalized' | 'locked';

@Entity('coin_configurator_sessions')
export class CoinConfiguratorSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'package_config_id', type: 'uuid', nullable: true })
  packageConfigId: string | null;

  @ManyToOne(() => CoinPackageConfig, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'package_config_id' })
  packageConfig: CoinPackageConfig | null;

  @Column({ name: 'package_kg', type: 'decimal', precision: 8, scale: 2, default: 1 })
  packageKg: number;

  @Column({ name: 'case_weight_g', type: 'int' })
  caseWeightG: number;

  @Column({ name: 'product_capacity_g', type: 'int' })
  productCapacityG: number;

  /** Brand House source — preserved even for custom designs */
  @Column({ name: 'source_brand_house_id', type: 'varchar', length: 64, nullable: true })
  sourceBrandHouseId: string | null;

  @Column({ name: 'source_qr_ref', type: 'varchar', length: 255, nullable: true })
  sourceQrRef: string | null;

  @Column({ type: 'varchar', length: 24, default: 'draft' })
  status: ConfiguratorSessionStatus;

  @Column({ name: 'used_weight_g', type: 'int', default: 0 })
  usedWeightG: number;

  @Column({ name: 'remaining_weight_g', type: 'int', default: 500 })
  remainingWeightG: number;

  @Column({ name: 'snapshot_json', type: 'jsonb', nullable: true })
  snapshotJson: Record<string, unknown> | null;

  @Column({ name: 'case_layout_json', type: 'jsonb', nullable: true })
  caseLayoutJson: Record<string, unknown> | null;

  @Column({ name: 'finalized_at', type: 'timestamptz', nullable: true })
  finalizedAt: Date | null;

  @OneToMany(() => CoinConfiguratorProduct, (p) => p.session)
  products: CoinConfiguratorProduct[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
