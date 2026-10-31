import { MetalsService } from './metals.service';
import { MetalPrice } from '../../database/entities/metal-price.entity';
import { Repository } from 'typeorm';
import { PlatformSettingsService } from '../settings/platform-settings.service';

describe('Verified LIVE references', () => {
  const originalEnv = { ...process.env };
  const make = () =>
    new MetalsService(
      { findOne: async () => null } as unknown as Repository<MetalPrice>,
      { isTickerEnabled: async () => true } as PlatformSettingsService,
    );
  beforeEach(() => {
    process.env.METALS_APPROVED_SOURCE = 'https://api.gold-api.com';
    process.env.METALS_MAX_AGE_SECONDS = '900';
  });
  afterEach(() => {
    process.env = { ...originalEnv };
    jest.restoreAllMocks();
  });
  it('refuses missing data, without fabricated display prices', async () => {
    const s = make();
    expect(s.getLive()).toEqual([]);
    await expect(s.getQuote('silver')).rejects.toThrow('unavailable');
  });
  it('requires approved source and freshness policy', async () => {
    delete process.env.METALS_APPROVED_SOURCE;
    const fetcher = jest.spyOn(global, 'fetch');
    const s = make();
    await s.refreshPrices();
    expect(fetcher).not.toHaveBeenCalled();
    expect(s.getLive()).toEqual([]);
  });
  it('never turns an API failure into a current price', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('offline'));
    const s = make();
    await s.refreshPrices();
    expect(s.getLive()).toEqual([]);
  });
  it('rejects a provider response without its own timestamp', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ price: 30 }),
    } as Response);
    const s = make();
    await s.refreshPrices();
    expect(s.getLive()).toEqual([]);
  });
});
