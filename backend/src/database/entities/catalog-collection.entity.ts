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
import { CatalogItem } from './catalog-item.entity';

export type CatalogVisibility = 'PUBLIC' | 'PRIVATE';

@Entity('catalog_collections')
export class CatalogCollection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'varchar', default: 'PRIVATE' })
  visibility: CatalogVisibility;

  @OneToMany(() => CatalogItem, (item) => item.collection)
  items: CatalogItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

export function catalogCollectionView(c: CatalogCollection, itemCount?: number) {
  return {
    id: c.id,
    userId: c.userId,
    title: c.title,
    description: c.description,
    slug: c.slug,
    visibility: c.visibility,
    itemCount: itemCount ?? c.items?.length ?? 0,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}
