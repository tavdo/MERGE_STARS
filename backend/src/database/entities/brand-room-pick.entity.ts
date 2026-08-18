import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { CatalogItem } from './catalog-item.entity';
import { User } from './user.entity';

/** Brand Room catalog entry: reference to a Master Product, never a copy. */
@Entity('brand_room_picks')
@Unique('UQ_brand_room_picks_user_item', ['userId', 'catalogItemId'])
@Index('IDX_brand_room_picks_user', ['userId'])
export class BrandRoomPick {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'catalog_item_id', type: 'uuid' })
  catalogItemId: string;

  @ManyToOne(() => CatalogItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'catalog_item_id' })
  catalogItem: CatalogItem;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
