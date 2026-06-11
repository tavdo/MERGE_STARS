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

  @Column({ type: 'varchar', default: 'ACTIVE' })
  status: CatalogItemStatus;

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
    status: item.status,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}
