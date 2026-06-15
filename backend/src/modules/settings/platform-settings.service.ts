import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PlatformSettings,
  platformSettingsView,
} from '../../database/entities/platform-settings.entity';

export type PlatformSettingsPatch = Partial<{
  tickerEnabled: boolean;
  aiEnabled: boolean;
  autoVerify: boolean;
  platformShare: string;
  brandShare: string;
  referrerShare: string;
}>;

@Injectable()
export class PlatformSettingsService implements OnModuleInit {
  private cache: PlatformSettings | null = null;

  constructor(
    @InjectRepository(PlatformSettings)
    private readonly settings: Repository<PlatformSettings>,
  ) {}

  async onModuleInit() {
    await this.getRow();
  }

  private async getRow() {
    if (this.cache) return this.cache;
    let row = await this.settings.findOne({ where: { id: 1 } });
    if (!row) {
      row = this.settings.create({ id: 1 });
      row = await this.settings.save(row);
    }
    this.cache = row;
    return row;
  }

  async get() {
    return platformSettingsView(await this.getRow());
  }

  async getPublic() {
    const s = await this.get();
    return {
      aiEnabled: s.aiEnabled,
      tickerEnabled: s.tickerEnabled,
    };
  }

  async update(patch: PlatformSettingsPatch) {
    const row = await this.getRow();
    if (patch.tickerEnabled !== undefined) row.tickerEnabled = patch.tickerEnabled;
    if (patch.aiEnabled !== undefined) row.aiEnabled = patch.aiEnabled;
    if (patch.autoVerify !== undefined) row.autoVerify = patch.autoVerify;
    if (patch.platformShare !== undefined) row.platformShare = patch.platformShare.trim();
    if (patch.brandShare !== undefined) row.brandShare = patch.brandShare.trim();
    if (patch.referrerShare !== undefined) row.referrerShare = patch.referrerShare.trim();
    this.cache = await this.settings.save(row);
    return platformSettingsView(this.cache);
  }

  async isAiEnabled() {
    return (await this.getRow()).aiEnabled;
  }

  async isTickerEnabled() {
    return (await this.getRow()).tickerEnabled;
  }

  async referrerShareLabel() {
    return (await this.getRow()).referrerShare;
  }
}
