import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CoinConfiguratorSession } from './coin-configurator-session.entity';

export type ConfiguratorProductStatus =
  | 'drafting'
  | 'generating'
  | 'generated'
  | 'approved'
  | 'cad_review'
  | 'verified';

export type ConfiguratorProductVisibility = 'private' | 'catalog';

@Entity('coin_configurator_products')
export class CoinConfiguratorProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'session_id' })
  sessionId: string;

  @ManyToOne(() => CoinConfiguratorSession, (s) => s.products, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session: CoinConfiguratorSession;

  @Column({ name: 'product_type', type: 'varchar', length: 40 })
  productType: string;

  @Column({ type: 'varchar', length: 160 })
  title: string;

  @Column({ type: 'text', nullable: true })
  prompt: string | null;

  @Column({ name: 'meshy_job_id', type: 'varchar', length: 64, nullable: true })
  meshyJobId: string | null;

  @Column({ name: 'model3d_url', type: 'varchar', length: 512, nullable: true })
  model3dUrl: string | null;

  @Column({ type: 'varchar', length: 24, default: 'drafting' })
  status: ConfiguratorProductStatus;

  @Column({ name: 'estimated_weight_g', type: 'int', nullable: true })
  estimatedWeightG: number | null;

  @Column({ name: 'verified_weight_g', type: 'int', nullable: true })
  verifiedWeightG: number | null;

  @Column({ type: 'varchar', length: 16, default: 'private' })
  visibility: ConfiguratorProductVisibility;

  @Column({ name: 'catalog_item_id', type: 'uuid', nullable: true })
  catalogItemId: string | null;

  @Column({ name: 'passport_id', type: 'uuid', nullable: true })
  passportId: string | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ name: 'approved_at', type: 'timestamptz', nullable: true })
  approvedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

export function configuratorProductView(p: CoinConfiguratorProduct) {
  return {
    id: p.id,
    sessionId: p.sessionId,
    productType: p.productType,
    title: p.title,
    prompt: p.prompt,
    meshyJobId: p.meshyJobId,
    model3dUrl: p.model3dUrl,
    status: p.status,
    estimatedWeightG: p.estimatedWeightG,
    verifiedWeightG: p.verifiedWeightG,
    weightG: p.verifiedWeightG ?? p.estimatedWeightG,
    visibility: p.visibility,
    catalogItemId: p.catalogItemId,
    passportId: p.passportId,
    sortOrder: p.sortOrder,
    approvedAt: p.approvedAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}
