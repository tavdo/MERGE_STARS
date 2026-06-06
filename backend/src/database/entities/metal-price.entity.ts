import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('metal_prices')
export class MetalPrice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  metal: string;

  @Column({ name: 'price_usd', type: 'decimal', precision: 12, scale: 4 })
  priceUsd: number;

  @Column({ name: 'change_pct', type: 'decimal', precision: 6, scale: 3, default: 0 })
  changePct: number;

  @CreateDateColumn({ name: 'recorded_at' })
  recordedAt: Date;
}
