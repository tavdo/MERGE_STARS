import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('coin_package_configs')
export class CoinPackageConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 80 })
  label: string;

  /** Package size in kilograms (1, 2, 5, 20, 100…) */
  @Column({ name: 'package_kg', type: 'decimal', precision: 8, scale: 2 })
  packageKg: number;

  /** Total package weight in grams (usually packageKg × 1000) */
  @Column({ name: 'total_weight_g', type: 'int' })
  totalWeightG: number;

  /** MERGE Coin case allocation in grams */
  @Column({ name: 'case_weight_g', type: 'int' })
  caseWeightG: number;

  /** Customer product content capacity in grams */
  @Column({ name: 'product_capacity_g', type: 'int' })
  productCapacityG: number;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

export function coinPackageConfigView(row: CoinPackageConfig) {
  return {
    id: row.id,
    label: row.label,
    packageKg: Number(row.packageKg),
    totalWeightG: row.totalWeightG,
    caseWeightG: row.caseWeightG,
    productCapacityG: row.productCapacityG,
    isDefault: row.isDefault,
    isActive: row.isActive,
    updatedAt: row.updatedAt.toISOString(),
  };
}
