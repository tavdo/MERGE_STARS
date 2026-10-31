/** Shared catalog category keys — matches landing Explore By Category */
export const CATALOG_CATEGORIES = [
  'jewelry',
  'accessories',
  'souvenirs',
  'sanitaryware',
  'stationery',
  'construction',
  'more',
  'eyewear', 'watches', 'fashion', 'shoes', 'bags', 'furniture', 'lighting',
  'decor', 'art', 'music', 'technology', 'transport', 'children', 'strollers', 'toys', 'dolls',
] as const

export type CatalogCategory = (typeof CATALOG_CATEGORIES)[number]

export function isCatalogCategory(value: string | null | undefined): value is CatalogCategory {
  return !!value && (CATALOG_CATEGORIES as readonly string[]).includes(value)
}
