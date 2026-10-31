export type EstimateMaterial = 'gold' | 'silver' | 'composite'

const DENSITY_G_PER_CM3: Record<EstimateMaterial, number> = { gold: 19.32, silver: 10.49, composite: 4.2 }

/** Experience-only estimate. It never creates a quote or production order. */
export function estimateGeometry(material: EstimateMaterial, volumeCm3: number, metalPricePerKg?: number) {
  if (!Number.isFinite(volumeCm3) || volumeCm3 <= 0) return { status: 'CONCEPT' as const, weightGrams: null, price: null }
  const weightGrams = Math.round(volumeCm3 * DENSITY_G_PER_CM3[material] * 100) / 100
  const price = Number.isFinite(metalPricePerKg) && metalPricePerKg! > 0 ? Math.round((weightGrams / 1000) * metalPricePerKg! * 100) / 100 : null
  return { status: 'ESTIMATED' as const, weightGrams, price }
}

/** Financing is unavailable until a verified Brand House offer exists. */
export function financingPreview(_total: number, termMonths = 12) { return { downPayment: 0, toFinance: 0, monthly: 0, termMonths } }
