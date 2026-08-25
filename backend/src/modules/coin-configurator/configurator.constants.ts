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

export function productTypeMeta(key: string) {
  return CONFIGURATOR_PRODUCT_TYPES.find((p) => p.key === key) ?? CONFIGURATOR_PRODUCT_TYPES[6];
}
