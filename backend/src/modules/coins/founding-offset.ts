import { BadRequestException } from '@nestjs/common';
import {
  BrandLine,
  calculateBrandLinePrice,
  PRICING_RULE_VERSION,
} from './coin-pricing';

/** Pure settlement decision; caller must persist it with the ledger under a
 * transaction and unique event ID. No public endpoint accepts these assertions.
 */
export function foundingOffset(input: {
  cohortPosition: number;
  beneficiaryId: string;
  payerId: string;
  paymentVerified: boolean;
  commissionAvailableMinor: number;
  line: BrandLine;
  verifiedPricingWeightKg: string;
  eventAt: number;
  silverMinorPerKg: number;
  goldMinorPerKg?: number;
  sourceTimestamp: number;
  maxAgeMs: number;
  sourceApproved: boolean;
  lockedOutstandingMinor?: number;
}) {
  const i = input;
  if (
    !Number.isInteger(i.cohortPosition) ||
    i.cohortPosition < 1 ||
    i.cohortPosition > 1000 ||
    !i.beneficiaryId ||
    !i.payerId ||
    i.beneficiaryId === i.payerId ||
    !i.paymentVerified ||
    !Number.isSafeInteger(i.commissionAvailableMinor) ||
    i.commissionAvailableMinor <= 0
  )
    throw new BadRequestException(
      'Verified third-party payment and available founding commission required',
    );
  let outstanding = i.lockedOutstandingMinor;
  if (outstanding === undefined) {
    const age = i.eventAt - i.sourceTimestamp;
    if (
      !i.sourceApproved ||
      !Number.isFinite(age) ||
      age < 0 ||
      !Number.isFinite(i.maxAgeMs) ||
      i.maxAgeMs <= 0 ||
      age > i.maxAgeMs
    )
      throw new BadRequestException('Verified event-time price required');
    outstanding = calculateBrandLinePrice(
      i.line,
      i.verifiedPricingWeightKg,
      i.silverMinorPerKg,
      i.goldMinorPerKg,
    );
  }
  if (!Number.isSafeInteger(outstanding) || outstanding < 0)
    throw new BadRequestException('Invalid locked outstanding amount');
  const deductedMinor = Math.min(outstanding, i.commissionAvailableMinor);
  return {
    ruleVersion: PRICING_RULE_VERSION,
    lockedOutstandingBeforeMinor: outstanding,
    deductedMinor,
    outstandingMinor: outstanding - deductedMinor,
    remainingCommissionMinor: i.commissionAvailableMinor - deductedMinor,
    status: outstanding === deductedMinor ? 'SETTLED' : 'PARTIALLY_SETTLED',
  };
}
