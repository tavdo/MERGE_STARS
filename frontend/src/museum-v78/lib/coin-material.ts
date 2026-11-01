// Founder formulation, not a certificate, assay, approved recipe or weight estimate.
// Commercial prices and financial allocations never determine material content.
export const coinMaterialSpecification = Object.freeze({
  status: 'FOUNDER_SPECIFICATION_BATCH_VERIFICATION_REQUIRED',
  metalToBaseMassRatio: '1:2',
  metalFraction: '33⅓%',
  baseFraction: '66⅔%',
  nominalMetalInputGramsPerKgComposite: '333.33',
  nominalBaseGramsPerKgComposite: '666.67',
  declaredMetalInputFineness: '999.9',
  goldDesignation: 'Nominal 8K gold composite',
  silverDesignation: 'Silver–polymer composite',
  base: 'Selected polymer / filament base',
  certified: false,
});

export function coinMaterialLabels(line: 'GOLD' | 'SILVER') {
  const gold = line === 'GOLD';
  return {
    name: gold ? coinMaterialSpecification.goldDesignation : coinMaterialSpecification.silverDesignation,
    metal: gold ? 'gold' : 'silver',
    symbol: gold ? 'Au' : 'Ag',
    compact: gold ? '8K GOLD COMPOSITE · 33⅓% Au INPUT' : 'SILVER COMPOSITE · 33⅓% Ag INPUT',
  };
}
