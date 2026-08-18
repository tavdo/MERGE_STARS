import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CatalogCollection } from './catalog-collection.entity';

export type CatalogItemStatus = 'ACTIVE' | 'ARCHIVED';
export type CatalogLifecycle =
  | 'DRAFT'
  | 'REVIEW'
  | 'APPROVED'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'ARCHIVED';
export type CatalogOwnership = 'PRIVATE' | 'NETWORK' | 'MASTER_CATALOG';

@Entity('catalog_items')
export class CatalogItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'collection_id', type: 'uuid' })
  collectionId: string;

  @ManyToOne(() => CatalogCollection, (c) => c.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'collection_id' })
  collection: CatalogCollection;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'metal_type', type: 'varchar', nullable: true })
  metalType: string | null;

  @Column({ name: 'image_url', type: 'varchar', nullable: true })
  imageUrl: string | null;

  @Column({ name: 'model3d_url', type: 'varchar', nullable: true })
  model3dUrl: string | null;

  @Column({ name: 'model3d_format', type: 'varchar', nullable: true })
  model3dFormat: string | null;

  @Column({ type: 'varchar', default: 'ACTIVE' })
  status: CatalogItemStatus;

  /** Master Catalog house direction (not a Brand Room limit). */
  @Column({ type: 'varchar', length: 40, nullable: true })
  house: string | null;

  @Column({ type: 'varchar', length: 24, default: 'ACTIVE' })
  lifecycle: CatalogLifecycle;

  @Column({ type: 'varchar', length: 24, default: 'PRIVATE' })
  ownership: CatalogOwnership;

  /** Sale price in USD; null or 0 = not for sale */
  @Column({ name: 'price_usd', type: 'decimal', precision: 14, scale: 2, nullable: true })
  priceUsd: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

export function catalogItemView(item: CatalogItem) {
  return {
    id: item.id,
    collectionId: item.collectionId,
    title: item.title,
    description: item.description,
    metalType: item.metalType,
    imageUrl: item.imageUrl,
    model3dUrl: item.model3dUrl,
    model3dFormat: item.model3dFormat,
    hasImage: !!item.imageUrl,
    hasModel3d: !!item.model3dUrl,
    status: item.status,
    house: item.house ?? null,
    lifecycle: item.lifecycle ?? 'ACTIVE',
    ownership: item.ownership ?? 'PRIVATE',
    priceUsd: item.priceUsd != null ? Number(item.priceUsd) : null,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}
