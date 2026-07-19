import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { CatalogItem } from './catalog-item.entity';
import { CatalogCollection } from './catalog-collection.entity';

@Entity('catalog_orders')
export class CatalogOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'public_id', unique: true })
  publicId: string;

  @Index()
  @Column({ name: 'buyer_id' })
  buyerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'buyer_id' })
  buyer: User;

  @Index()
  @Column({ name: 'seller_id' })
  sellerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'seller_id' })
  seller: User;

  @Column({ name: 'item_id', type: 'uuid' })
  itemId: string;

  @ManyToOne(() => CatalogItem, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'item_id' })
  item: CatalogItem | null;

  @Column({ name: 'collection_id', type: 'uuid' })
  collectionId: string;

  @ManyToOne(() => CatalogCollection, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'collection_id' })
  collection: CatalogCollection | null;

  @Column({ name: 'item_title', type: 'varchar', length: 160 })
  itemTitle: string;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  amount: number;

  /** Brand share credited to seller wallet */
  @Column({ name: 'seller_earnings', type: 'decimal', precision: 14, scale: 2 })
  sellerEarnings: number;

  @Column({ name: 'brand_share_label', type: 'varchar', length: 32 })
  brandShareLabel: string;

  @Column({ type: 'varchar', length: 32, default: 'paid' })
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  meta: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

export function catalogOrderView(row: CatalogOrder) {
  return {
    id: row.publicId,
    itemId: row.itemId,
    itemTitle: row.itemTitle,
    collectionId: row.collectionId,
    amount: Number(row.amount),
    sellerEarnings: Number(row.sellerEarnings),
    brandShareLabel: row.brandShareLabel,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}
