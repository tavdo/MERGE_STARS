import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('platform_settings')
export class PlatformSettings {
  @PrimaryColumn({ type: 'int', default: 1 })
  id: number;

  @Column({ name: 'ticker_enabled', default: true })
  tickerEnabled: boolean;

  @Column({ name: 'ai_enabled', default: true })
  aiEnabled: boolean;

  @Column({ name: 'auto_verify', default: false })
  autoVerify: boolean;

  @Column({ name: 'platform_share', default: '1/2' })
  platformShare: string;

  @Column({ name: 'brand_share', default: '1/4' })
  brandShare: string;

  @Column({ name: 'referrer_share', default: '1/4' })
  referrerShare: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

export function platformSettingsView(row: PlatformSettings) {
  return {
    tickerEnabled: row.tickerEnabled,
    aiEnabled: row.aiEnabled,
    autoVerify: row.autoVerify,
    platformShare: row.platformShare,
    brandShare: row.brandShare,
    referrerShare: row.referrerShare,
    updatedAt: row.updatedAt.toISOString(),
  };
}
