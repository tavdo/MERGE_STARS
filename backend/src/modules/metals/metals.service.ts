import {
  Injectable,
  Logger,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MetalPrice } from '../../database/entities/metal-price.entity';
import { PlatformSettingsService } from '../settings/platform-settings.service';

const METAL_DISPLAY_ORDER = ['silver', 'gold', 'palladium'] as const;

type Spot = {
  metal: string;
  priceUsd: number;
  changePct: number;
  source: string;
  sourceTimestamp: string;
  retrievedAt: string;
};

type MetalsGatewayLike = { broadcastPrices(data: unknown): void };

@Injectable()
export class MetalsService implements OnModuleInit {
  private readonly log = new Logger(MetalsService.name);
  private cache: Spot[] = [];
  private gateway: MetalsGatewayLike | null = null;

  constructor(
    @InjectRepository(MetalPrice)
    private readonly prices: Repository<MetalPrice>,
    private readonly platformSettings: PlatformSettingsService,
  ) {}

  async onModuleInit() {
    await this.refreshPrices();
  }

  setGateway(gateway: MetalsGatewayLike) {
    this.gateway = gateway;
  }

  private readonly troyOzGrams = 31.1034768;

  private maxAgeMs(): number {
    const seconds = Number(process.env.METALS_MAX_AGE_SECONDS);
    return Number.isSafeInteger(seconds) && seconds > 0 ? seconds * 1000 : 0;
  }

  private isFresh(spot: Spot): boolean {
    const age = Date.now() - Date.parse(spot.sourceTimestamp);
    const retrievalAge = Date.now() - Date.parse(spot.retrievedAt);
    return (
      process.env.METALS_APPROVED_SOURCE === spot.source &&
      this.maxAgeMs() > 0 &&
      Number.isFinite(age) &&
      age >= 0 &&
      age <= this.maxAgeMs() &&
      Number.isFinite(retrievalAge) &&
      retrievalAge >= 0 &&
      retrievalAge <= this.maxAgeMs()
    );
  }

  private async fetchMetalSpot(
    metal: string,
    symbol: string,
  ): Promise<Spot | null> {
    try {
      if (
        process.env.METALS_APPROVED_SOURCE !== 'https://api.gold-api.com' ||
        !this.maxAgeMs()
      )
        return null;
      const res = await fetch(`https://api.gold-api.com/price/${symbol}`, {
        signal: AbortSignal.timeout(8000),
        headers: {
          Accept: 'application/json',
          'User-Agent': 'MERGE-STARS/1.0 (+https://mergestars.com)',
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { price?: number; updatedAt?: string };
      const sourceTime = Date.parse(json.updatedAt ?? '');
      if (
        !Number.isFinite(sourceTime) ||
        sourceTime > Date.now() ||
        Date.now() - sourceTime > this.maxAgeMs()
      )
        throw new Error('Unverified source timestamp');
      if (!Number.isFinite(json.price) || json.price! <= 0)
        throw new Error('Invalid price');
      return {
        metal,
        priceUsd: +(json.price / this.troyOzGrams).toFixed(4),
        changePct: 0,
        source: 'https://api.gold-api.com',
        sourceTimestamp: new Date(sourceTime).toISOString(),
        retrievedAt: new Date().toISOString(),
      };
    } catch (e) {
      this.log.warn(`${metal} fetch failed: ${(e as Error).message}`);
      return null;
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async refreshPrices() {
    try {
      const tickerOn = await this.platformSettings.isTickerEnabled();
      if (!tickerOn) {
        this.cache = [];
        this.gateway?.broadcastPrices([]);
        return;
      }
      const fetched = await Promise.all([
        this.fetchMetalSpot('silver', 'XAG'),
        this.fetchMetalSpot('gold', 'XAU'),
        this.fetchMetalSpot('palladium', 'XPD'),
      ]);
      const spots = fetched.filter((s): s is Spot => s !== null);
      if (!spots.length) throw new Error('No live metal prices');

      for (const s of spots) {
        const prev = await this.prices.findOne({
          where: { metal: s.metal },
          order: { recordedAt: 'DESC' },
        });
        if (prev) {
          const prevPrice = Number(prev.priceUsd);
          s.changePct = prevPrice
            ? +(((s.priceUsd - prevPrice) / prevPrice) * 100).toFixed(3)
            : 0;
        }
        await this.prices.save(
          this.prices.create({
            metal: s.metal,
            priceUsd: s.priceUsd,
            changePct: s.changePct,
          }),
        );
      }
      this.cache = spots;
      this.gateway?.broadcastPrices(this.getLive());
    } catch (e) {
      this.log.warn(`Metal price fetch failed: ${(e as Error).message}`);
      // Clear unavailable values; never broadcast an invented or stale live price.
      this.cache = [];
      this.gateway?.broadcastPrices([]);
    }
  }

  getLive() {
    const ordered = METAL_DISPLAY_ORDER.map((metal) =>
      this.cache.find((s) => s.metal === metal),
    ).filter((s): s is Spot => s != null && this.isFresh(s));
    return ordered.map((s) => ({
      ...s,
      validUntil: new Date(
        Date.parse(s.sourceTimestamp) + this.maxAgeMs(),
      ).toISOString(),
      pricePerKgUsd: +(s.priceUsd * 1000).toFixed(2),
    }));
  }

  getSilverSpot() {
    return this.getLive().find((s) => s.metal === 'silver') ?? null;
  }

  async getQuote(metal: string) {
    const latest = this.getLive().find((s) => s.metal === metal);
    if (!latest)
      throw new ServiceUnavailableException(
        'A recent metal price with approved source and timestamp is unavailable.',
      );
    return { ...latest, recordedAt: new Date(latest.sourceTimestamp) };
  }
}
