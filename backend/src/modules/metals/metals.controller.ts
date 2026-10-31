import { Controller, Get } from '@nestjs/common';
import {
  calculateBrandLinePrice,
  PRICING_RULE_VERSION,
} from '../coins/coin-pricing';
import { MetalsService } from './metals.service';

@Controller('metals')
export class MetalsController {
  constructor(private readonly metals: MetalsService) {}

  @Get('brand-line-reference')
  reference() {
    const metals = this.metals.getLive();
    const ag = metals.find((m) => m.metal === 'silver');
    const au = metals.find((m) => m.metal === 'gold');
    const cents = (value: number) => Math.round(value * 100);
    return {
      ruleVersion: PRICING_RULE_VERSION,
      currency: 'USD',
      pricingWeightKg: '1',
      kind: 'REFERENCE_ONLY',
      finalOrderAllowed: false,
      metals,
      silverMinor: ag
        ? calculateBrandLinePrice('silver', '1', cents(ag.pricePerKgUsd))
        : null,
      goldMinor:
        au
          ? calculateBrandLinePrice(
              'gold',
              '1',
              0,
              cents(au.pricePerKgUsd),
            )
          : null,
      premiumMinor: null,
      premiumStatus: 'Premium Line pricing pending verification.',
    };
  }

  @Get('live')
  live() {
    return this.metals.getLive();
  }
}
