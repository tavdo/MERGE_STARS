import { MetalsController } from './metals.controller';
import { MetalsService } from './metals.service';

describe('Brand Line reference under corrected rule', () => {
  it('quotes Gold from gold alone, even when silver is unavailable', () => {
    const service = { getLive: () => [{ metal: 'gold', pricePerKgUsd: 100000 }] } as unknown as MetalsService;
    expect(new MetalsController(service).reference()).toMatchObject({
      ruleVersion: 'brand-line-2026-10-09-v2', goldMinor: 10000000,
      silverMinor: null, finalOrderAllowed: false, kind: 'REFERENCE_ONLY',
    });
  });
  it('does not invent a quote when neither metal is available', () => {
    const service = { getLive: () => [] } as unknown as MetalsService;
    expect(new MetalsController(service).reference()).toMatchObject({ goldMinor: null, silverMinor: null });
  });
});
