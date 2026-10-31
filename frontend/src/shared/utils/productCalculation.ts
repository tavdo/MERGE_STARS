export type CalculationStatus = 'calculated' | 'pending' | 'verification_required'

export type ProductCalculationInput = {
  productId: string
  productVersion: string
  volumeCm3?: number
  fitScale?: number
  material?: string
  densityGPerCm3?: number
  livePricePerKgMinor?: number
  currency?: string
  priceSource?: string
  pricingRuleVersion?: string
}

export type ProductCalculation = {
  status: CalculationStatus
  reason?: string
  productId: string
  productVersion: string
  material: string | null
  calculatedWeightGrams: number | null
  livePricePerKgMinor: number | null
  calculatedProductPriceMinor: number | null
  currency: string | null
  priceSource: string | null
  priceTimestamp: string | null
  pricingRuleVersion: string | null
}

/** Closed calculation: every number must come from an approved product/material record. */
export function calculateProduct(input: ProductCalculationInput): ProductCalculation {
  const base = {
    productId: input.productId,
    productVersion: input.productVersion,
    material: input.material ?? null,
    currency: input.currency ?? null,
    priceSource: input.priceSource ?? null,
    priceTimestamp: null,
    pricingRuleVersion: input.pricingRuleVersion ?? null,
  }
  const missing = !input.productId || !input.productVersion || !input.material ||
    !Number.isFinite(input.volumeCm3) || (input.volumeCm3 ?? 0) <= 0 ||
    !Number.isFinite(input.fitScale) || (input.fitScale ?? 0) <= 0 ||
    !Number.isFinite(input.densityGPerCm3) || (input.densityGPerCm3 ?? 0) <= 0 ||
    !Number.isSafeInteger(input.livePricePerKgMinor) || (input.livePricePerKgMinor ?? 0) <= 0 ||
    !input.currency || !input.priceSource || !input.pricingRuleVersion
  if (missing) return { ...base, status: 'pending', reason: 'Required geometry, fit, material, live price, or pricing rule is missing.', calculatedWeightGrams: null, livePricePerKgMinor: null, calculatedProductPriceMinor: null }
  const weight = (input.volumeCm3! * input.fitScale! * input.densityGPerCm3!)
  if (!Number.isFinite(weight) || weight <= 0) return { ...base, status: 'pending', reason: 'Product weight could not be calculated.', calculatedWeightGrams: null, livePricePerKgMinor: null, calculatedProductPriceMinor: null }
  const price = Math.round((weight / 1000) * input.livePricePerKgMinor!)
  return { ...base, status: 'calculated', calculatedWeightGrams: Math.round(weight * 100) / 100, livePricePerKgMinor: input.livePricePerKgMinor!, calculatedProductPriceMinor: price, priceTimestamp: new Date().toISOString() }
}
