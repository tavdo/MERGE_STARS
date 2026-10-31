import { BadRequestException } from '@nestjs/common';
export const PRICING_RULE_VERSION = 'brand-line-2026-10-09-v2';
export type BrandLine = 'silver' | 'gold' | 'premium';

/** Pricing kg is independent of physical kg. Round integer money once. */
export function calculateBrandLinePrice(
  line: BrandLine,
  weightKg: string,
  silverMinorPerKg: number,
  goldMinorPerKg?: number,
): number {
  if (line === 'premium')
    throw new BadRequestException('Premium Line pricing pending verification.');
  if (
    !['silver', 'gold'].includes(line) ||
    !/^\d{1,6}(\.\d{1,6})?$/.test(weightKg)
  )
    throw new BadRequestException('Invalid verified pricing basis');
  const [whole, fraction = ''] = weightKg.split('.');
  const weight = BigInt(whole) * 1000000n + BigInt(fraction.padEnd(6, '0'));
  const prices =
    line === 'gold' ? [goldMinorPerKg] : [silverMinorPerKg];
  if (weight <= 0n || prices.some((p) => !Number.isSafeInteger(p) || p! <= 0))
    throw new BadRequestException('Verified metal prices are required');
  const basis =
    line === 'silver' ? BigInt(silverMinorPerKg) * 2n : BigInt(goldMinorPerKg!);
  const total = (weight * basis + 500000n) / 1000000n;
  if (total <= 0n || total > BigInt(Number.MAX_SAFE_INTEGER))
    throw new BadRequestException('Price outside supported precision');
  return Number(total);
}
