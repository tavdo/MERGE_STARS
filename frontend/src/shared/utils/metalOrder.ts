/** Display / pricing priority: silver first, then gold when user selects it. */
export const METAL_DISPLAY_ORDER = ['silver', 'gold', 'palladium'] as const

export function sortMetalsSilverFirst<T extends { metal: string }>(prices: T[]): T[] {
  return METAL_DISPLAY_ORDER.map((metal) => prices.find((p) => p.metal === metal)).filter(
    (p): p is T => p != null,
  )
}
