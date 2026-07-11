export const MFG_FEE_USD = 1200
export const PLATFORM_FEE_USD = 153

const METAL_BY_COIN_INDEX = ['silver', 'gold'] as const
const DEFAULT_SPOT: Record<string, number> = {
  silver: 1.09,
  gold: 139.1,
}

export function metalForCoinIndex(index: number): string {
  return METAL_BY_COIN_INDEX[index] ?? 'silver'
}

export function estimateCoinValue(
  coinIndex: number,
  quantity: number,
  livePrices?: { metal: string; priceUsd: number }[],
  purityPerMille = 999.9,
): number {
  const metal = metalForCoinIndex(coinIndex)
  const spot =
    livePrices?.find((p) => p.metal === metal)?.priceUsd ?? DEFAULT_SPOT[metal] ?? 1
  const weightGrams = 1000 * quantity
  const fraction = purityPerMille > 100 ? purityPerMille / 1000 : purityPerMille / 100
  const metalValue = spot * weightGrams * fraction
  return Math.round((metalValue + MFG_FEE_USD + PLATFORM_FEE_USD) * 100) / 100
}

export function financingPreview(total: number, termMonths = 12) {
  const downPayment = total * 0.2
  const toFinance = total - downPayment
  const monthly = termMonths > 0 ? toFinance / termMonths : 0
  return { downPayment, toFinance, monthly, termMonths }
}
