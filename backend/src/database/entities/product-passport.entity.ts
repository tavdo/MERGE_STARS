import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('product_passports')
export class ProductPassport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'public_id', unique: true })
  publicId: string;

  @Column({ name: 'owner_user_id' })
  ownerUserId: string;

  @Column({ name: 'configurator_product_id', type: 'uuid' })
  configuratorProductId: string;

  @Column({ name: 'session_id', type: 'uuid' })
  sessionId: string;

  @Column({ name: 'brand_house_id', type: 'varchar', length: 64, nullable: true })
  brandHouseId: string | null;

  @Column({ name: 'source_qr_ref', type: 'varchar', length: 255, nullable: true })
  sourceQrRef: string | null;

  @Column({ name: 'product_type', type: 'varchar', length: 40 })
  productType: string;

  @Column({ type: 'varchar', length: 160 })
  title: string;

  @Column({ type: 'text', nullable: true })
  prompt: string | null;

  @Column({ name: 'model3d_url', type: 'varchar', length: 512, nullable: true })
  model3dUrl: string | null;

  @Column({ name: 'estimated_weight_g', type: 'int', nullable: true })
  estimatedWeightG: number | null;

  @Column({ name: 'verified_weight_g', type: 'int', nullable: true })
  verifiedWeightG: number | null;

  @Column({ type: 'varchar', length: 16, default: 'private' })
  visibility: string;

  @Column({ name: 'catalog_item_id', type: 'uuid', nullable: true })
  catalogItemId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

export function productPassportView(p: ProductPassport) {
  return {
    id: p.id,
    publicId: p.publicId,
    ownerUserId: p.ownerUserId,
    configuratorProductId: p.configuratorProductId,
    sessionId: p.sessionId,
    brandHouseId: p.brandHouseId,
    sourceQrRef: p.sourceQrRef,
    productType: p.productType,
    title: p.title,
    prompt: p.prompt,
    model3dUrl: p.model3dUrl,
    estimatedWeightG: p.estimatedWeightG,
    verifiedWeightG: p.verifiedWeightG,
    weightG: p.verifiedWeightG ?? p.estimatedWeightG,
    visibility: p.visibility,
    catalogItemId: p.catalogItemId,
    createdAt: p.createdAt.toISOString(),
  };
}
