export function estimateWeight(circumference: number, width: number, thickness: number, density: number) {
  if (![circumference, width, thickness, density].every(n => Number.isFinite(n) && n > 0)) return null
  const r = circumference / (2 * Math.PI)
  const volume = Math.PI * ((r + thickness) ** 2 - r ** 2) * width / 1000
  const grams = volume * density
  return Number.isFinite(grams) && grams > 0 ? { volume, grams } : null
}
export type EstimateQuote = { metal: string; source: string; sourceTimestamp: string; validUntil: string; pricePerKgUsd: number }
export function estimatePrice(line: string, weight: number, quotes: EstimateQuote[], now: number) {
  if (!['silver', 'gold'].includes(line) || !Number.isFinite(weight) || weight <= 0 || !Number.isFinite(now)) return null
  const find = (metal: string) => quotes.find(q => q.metal.toLowerCase() === metal && q.source.trim() && Date.parse(q.sourceTimestamp) <= now && Date.parse(q.validUntil) > now && Number.isFinite(q.pricePerKgUsd) && q.pricePerKgUsd > 0)
  const ag = find('silver'), au = find('gold')
  if (line === 'silver' ? !ag : !au) return null
  const minor = Math.round(weight * (line === 'silver' ? ag!.pricePerKgUsd * 2 : au!.pricePerKgUsd) * 100)
  return Number.isSafeInteger(minor) && minor > 0 ? { minor, sources: line === 'silver' ? [ag!] : [au!] } : null
}
