import type { ConfiguratorProductType } from './api/configurator.api'

/** Mirrors backend CONFIGURATOR_PRODUCT_TYPES — used if API is slow or fails. */
export const CONFIGURATOR_PRODUCT_TYPES_FALLBACK: ConfiguratorProductType[] = [
  { key: 'smart_watch', label: 'Smart Watch', meshyStyle: 'Watch', defaultWeightG: 118 },
  { key: 'smart_glasses', label: 'Smart Glasses', meshyStyle: 'Jewelry', defaultWeightG: 64 },
  { key: 'smart_bracelet', label: 'Smart Bracelet', meshyStyle: 'Jewelry', defaultWeightG: 45 },
  { key: 'ai_earbuds', label: 'AI Earbuds', meshyStyle: 'Jewelry', defaultWeightG: 28 },
  { key: 'smart_pen', label: 'Smart Pen', meshyStyle: 'Sculpture', defaultWeightG: 35 },
  { key: 'jewelry', label: 'Jewelry', meshyStyle: 'Jewelry', defaultWeightG: 50 },
  { key: 'custom', label: 'Custom', meshyStyle: 'Sculpture', defaultWeightG: 80 },
]

/** Meshy style key for step 1 — empty branded coin case shell. */
export const BRAND_CASE_MESHY_STYLE = 'Case'

export const BRAND_CASE_STYLE_OPTIONS = [{ value: BRAND_CASE_MESHY_STYLE, labelKey: 'case' }] as const

export const BRAND_CASE_PROMPT =
  'EMPTY luxury circular coin case shell ONLY, open top view, hollow interior visible, absolutely NO products inside, NO watch NO sunglasses NO jewelry NO bottles NO pens, single isolated object: branded storage case exterior with MERGE STARS logo on lid, silver filigree renaissance mosaic on case walls, dark empty velvet compartment molds with NO items, 30cm diameter 500g, black studio background, hard-surface product design, watertight case geometry'
