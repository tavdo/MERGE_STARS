export const CONFIGURATOR_PRODUCT_TYPES = [
  { key: 'smart_watch', label: 'Smart Watch', meshyStyle: 'Watch', defaultWeightG: 118 },
  { key: 'smart_glasses', label: 'Smart Glasses', meshyStyle: 'Jewelry', defaultWeightG: 64 },
  { key: 'smart_bracelet', label: 'Smart Bracelet', meshyStyle: 'Jewelry', defaultWeightG: 45 },
  { key: 'ai_earbuds', label: 'AI Earbuds', meshyStyle: 'Jewelry', defaultWeightG: 28 },
  { key: 'smart_pen', label: 'Smart Pen', meshyStyle: 'Sculpture', defaultWeightG: 35 },
  { key: 'jewelry', label: 'Jewelry', meshyStyle: 'Jewelry', defaultWeightG: 50 },
  { key: 'custom', label: 'Custom', meshyStyle: 'Sculpture', defaultWeightG: 80 },
] as const;

export type ConfiguratorProductTypeKey = (typeof CONFIGURATOR_PRODUCT_TYPES)[number]['key'];

/** Velvet compartment slots — circular MERGE coin case (30 cm), tier 1 + tier 2. */
export const PRODUCT_SLOT_LAYOUT: Record<
  string,
  { shape: 'oval' | 'rect' | 'circle' | 'narrow'; tier: 1 | 2; x: number; y: number; w: number; h: number }
> = {
  smart_watch: { shape: 'oval', tier: 1, x: 50, y: 20, w: 26, h: 18 },
  smart_glasses: { shape: 'rect', tier: 1, x: 78, y: 26, w: 22, h: 11 },
  smart_bracelet: { shape: 'rect', tier: 1, x: 16, y: 38, w: 20, h: 14 },
  ai_earbuds: { shape: 'circle', tier: 1, x: 80, y: 58, w: 12, h: 12 },
  jewelry: { shape: 'circle', tier: 1, x: 18, y: 66, w: 11, h: 11 },
  smart_pen: { shape: 'narrow', tier: 2, x: 50, y: 80, w: 7, h: 20 },
  custom: { shape: 'rect', tier: 2, x: 72, y: 72, w: 16, h: 14 },
};

export function productTypeMeta(key: string) {
  return CONFIGURATOR_PRODUCT_TYPES.find((p) => p.key === key) ?? CONFIGURATOR_PRODUCT_TYPES[6];
}
