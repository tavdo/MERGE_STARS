import { CORE_ORIGIN, pricesEnvelope, type CorePrices } from './core-contract';

export const coinSkyRefreshMs = 60000;
// Experience positions and declared reference specifications, never a weight,
// commercial quote, entitlement, material certificate or pricing calculation.
export const coinSkyLines = [
  { line: 'GOLD', metal: 'gold', symbol: 'Au', title: 'GOLD MERGE COIN', left: .025, top: .074, width: .13 },
  { line: 'SILVER', metal: 'silver', symbol: 'Ag', title: 'SILVER MERGE COIN', left: .775, top: .074, width: .13 },
] as const;
export type CoinSkyLine = typeof coinSkyLines[number];
export type CoinMetalReference = { amount: number; currency: 'USD'; unit: 'kg'; responseAt: string; retrievedAt: string; freshness: 'UNVERIFIED' };

export function coinMetalReference(data: CorePrices | undefined, metal: CoinSkyLine['metal']): CoinMetalReference | null {
  if (!data || data.source_origin !== CORE_ORIGIN || data.verified_offer !== false || data.quote_freshness !== 'UNVERIFIED' || data.quote_at !== null) return null;
  const parsed = pricesEnvelope.safeParse({data:data.prices,meta:{timestamp:data.response_at,version:'projection'}});
  if (!parsed.success || !Number.isFinite(Date.parse(data.retrieved_at)) || new Set(parsed.data.data.map(value=>value.metal)).size!==parsed.data.data.length) return null;
  const price = parsed.data.data.find(value=>value.metal===metal);
  if (!price || Math.abs(price.priceUsd*1000-price.pricePerKgUsd)>Math.max(.01,price.pricePerKgUsd*.00001)) return null;
  // Display the existing CORE number unchanged. No ×2/×weight/commission rule.
  return {amount:price.pricePerKgUsd,currency:'USD',unit:'kg',responseAt:data.response_at,retrievedAt:data.retrieved_at,freshness:'UNVERIFIED'};
}

export function formatCoinMetalReference(value: CoinMetalReference | null) {
  return value ? new Intl.NumberFormat('en-US',{style:'currency',currency:value.currency,minimumFractionDigits:2,maximumFractionDigits:2}).format(value.amount) : '—';
}

// The present CORE public metal contract contains no commercial Coin offer,
// pricing-rule version, snapshot expiry or verified amount. Fail closed.
export const coinCommercialPrice = Object.freeze({amount:null,status:'CORE_CALCULATION_PENDING',label:'CORE PRICE PENDING',verifiedOffer:false});
