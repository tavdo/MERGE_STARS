import { foundingOffset } from './founding-offset';
const input = {
  cohortPosition: 1,
  beneficiaryId: 'house',
  payerId: 'customer',
  paymentVerified: true,
  commissionAvailableMinor: 500000,
  line: 'silver' as const,
  verifiedPricingWeightKg: '1',
  eventAt: 1000000,
  silverMinorPerKg: 200000,
  sourceTimestamp: 999000,
  maxAgeMs: 60000,
  sourceApproved: true,
};
describe('Founding commission offset decision', () => {
  it('deducts Coin price at the commission event and retains excess', () =>
    expect(foundingOffset(input)).toMatchObject({
      deductedMinor: 400000,
      remainingCommissionMinor: 100000,
      outstandingMinor: 0,
      status: 'SETTLED',
    }));
  it('does not treat insufficient commission as paid', () =>
    expect(
      foundingOffset({ ...input, commissionAvailableMinor: 100000 }),
    ).toMatchObject({ outstandingMinor: 300000, status: 'PARTIALLY_SETTLED' }));
  it('does not reprice an existing lock when the market moves', () =>
    expect(
      foundingOffset({
        ...input,
        lockedOutstandingMinor: 300000,
        silverMinorPerKg: 900000,
      }),
    ).toMatchObject({ deductedMinor: 300000 }));
  it.each([
    { paymentVerified: false },
    { payerId: 'house' },
    { cohortPosition: 1001 },
    { sourceApproved: false },
    { sourceTimestamp: 0 },
    { commissionAvailableMinor: -1 },
    { commissionAvailableMinor: 0 },
  ])('rejects unverified eligibility/event/price %p', (patch) =>
    expect(() => foundingOffset({ ...input, ...patch })).toThrow(),
  );
});
