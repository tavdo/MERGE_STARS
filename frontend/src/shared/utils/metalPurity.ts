/** Standard silver fineness in parts per thousand (‰), not percent. */
export const DEFAULT_FINENESS_PER_MILLE = 999.9

/** Normalize legacy percent values (99.9) to per-mille (999). */
export function purityToPerMille(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return DEFAULT_FINENESS_PER_MILLE
  if (value > 100) return value
  return value * 10
}

/** Fraction of pure metal for pricing (0–1). */
export function purityFraction(value: number): number {
  return purityToPerMille(value) / 1000
}

/** Display fineness as ‰ with one decimal, e.g. 999,9‰ (ka) or 999.9‰ (en). */
export function formatMetalFineness(value: number | undefined, locale = 'en'): string {
  const perMille = purityToPerMille(value ?? DEFAULT_FINENESS_PER_MILLE)
  const rounded = Math.round(perMille * 10) / 10
  const lang = locale.slice(0, 2)
  const formatted = rounded.toLocaleString(lang === 'ka' ? 'ka-GE' : lang, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })
  return `${formatted}‰`
}

export function metalI18nKey(metalType?: string | null): 'silver' | 'gold' | 'platinum' {
  if (metalType === 'gold' || metalType === 'platinum') return metalType
  return 'silver'
}
