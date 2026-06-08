import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MetalPrice } from '../../database/entities/metal-price.entity';

type Spot = { metal: string; priceUsd: number; changePct: number };

type MetalsGatewayLike = { broadcastPrices(data: unknown): void };

@Injectable()
export class MetalsService implements OnModuleInit {
  private readonly log = new Logger(MetalsService.name);
  private cache: Spot[] = [];
  private gateway: MetalsGatewayLike | null = null;

  constructor(
    @InjectRepository(MetalPrice)
    private readonly prices: Repository<MetalPrice>,
  ) {}

  async onModuleInit() {
    await this.refreshPrices();
  }

  setGateway(gateway: MetalsGatewayLike) {
    this.gateway = gateway;
  }

  private readonly troyOzGrams = 31.1034768;

  private async fetchMetalSpot(
    metal: string,
    symbol: string,
  ): Promise<Spot | null> {
    try {
      const res = await fetch(`https://api.gold-api.com/price/${symbol}`, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'MERGE-STARS/1.0 (+https://mergestars.com)',
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { price?: number };
      if (!json.price || json.price <= 0) throw new Error('Invalid price');
      return {
        metal,
        priceUsd: +(json.price / this.troyOzGrams).toFixed(4),
        changePct: 0,
      };
    } catch (e) {
      this.log.warn(`${metal} fetch failed: ${(e as Error).message}`);
      return null;
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async refreshPrices() {
    try {
      const fetched = await Promise.all([
        this.fetchMetalSpot('gold', 'XAU'),
        this.fetchMetalSpot('silver', 'XAG'),
        this.fetchMetalSpot('platinum', 'XPT'),
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
      if (!this.cache.length) {
        this.cache = [
          { metal: 'silver', priceUsd: 1.09, changePct: 0 },
          { metal: 'gold', priceUsd: 139.1, changePct: 0 },
          { metal: 'platinum', priceUsd: 32.15, changePct: 0 },
          { metal: 'palladium', priceUsd: 28.5, changePct: 0 },
        ];
      }
    }
  }

  getLive() {
    return this.cache.map((s) => ({
      ...s,
      pricePerKgUsd: +(s.priceUsd * 1000).toFixed(2),
    }));
  }

  getSilverSpot() {
    return this.cache.find((s) => s.metal === 'silver') ?? { metal: 'silver', priceUsd: 0.897, changePct: 0 };
  }
}
