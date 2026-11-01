import type { CoinMetalReference } from './coin-sky-prices';

// Exact unit conversion, not another quote source. NIST OWM conversion table.
export const gramsPerTroyOunce = 31.1034768;
export const coinMarketReferences = Object.freeze({
  units: 'https://www.nist.gov/document/precious-metals-conversion-information-march2015pdf',
  benchmark: 'https://www.lbma.org.uk/prices-and-data/lbma-precious-metal-prices',
});
export type MetalDisplayUnit = 'kg' | 'oz t' | 'g';
export function metalRateInUnit(reference:CoinMetalReference|null,unit:MetalDisplayUnit){
  if(!reference||!Number.isFinite(reference.amount)||reference.amount<=0)return null;
  const amount=unit==='oz t'?reference.amount*gramsPerTroyOunce/1000:unit==='g'?reference.amount/1000:unit==='kg'?reference.amount:NaN;
  return Number.isFinite(amount)&&amount>0?amount:null;
}
export function displayUsd(amount:number|null){
  return amount!==null&&Number.isFinite(amount)?new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:2,maximumFractionDigits:2}).format(amount):'—';
}
