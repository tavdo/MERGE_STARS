import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MetalPrice } from '../../database/entities/metal-price.entity';

type Spot = { metal: string; priceUsd: number; changePct: number };

@Injectable()
export class MetalsService implements OnModuleInit {
  private readonly log = new Logger(MetalsService.name);
  private cache: Spot[] = [];

  constructor(
    @InjectRepository(MetalPrice)
    private readonly prices: Repository<MetalPrice>,
  ) {}

  async onModuleInit() {
    await this.refreshPrices();
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async refreshPrices() {
    try {
      const res = await fetch('https://data-asg.goldprice.org/dbXRates/USD', {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as {
        items?: Array<{ curr: string; xauPrice: number; xagPrice: number; xptPrice: number; xpdPrice: number }>;
      };
      const item = json.items?.[0];
      if (!item) throw new Error('No price data');

      const spots: Spot[] = [
        { metal: 'gold', priceUsd: item.xauPrice / 31.1035, changePct: 0 },
        { metal: 'silver', priceUsd: item.xagPrice / 31.1035, changePct: 0 },
        { metal: 'platinum', priceUsd: item.xptPrice / 31.1035, changePct: 0 },
        { metal: 'palladium', priceUsd: item.xpdPrice / 31.1035, changePct: 0 },
      ];

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
    } catch (e) {
      this.log.warn(`Metal price fetch failed: ${(e as Error).message}`);
      if (!this.cache.length) {
        this.cache = [
          { metal: 'silver', priceUsd: 0.897, changePct: 0 },
          { metal: 'gold', priceUsd: 67.42, changePct: 0 },
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
