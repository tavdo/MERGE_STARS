/** Shared catalog category keys — keep in sync with landing Explore By Category */
export const CATALOG_CATEGORIES = [
  'jewelry',
  'accessories',
  'souvenirs',
  'sanitaryware',
  'stationery',
  'construction',
  'more',
] as const

export type CatalogCategory = (typeof CATALOG_CATEGORIES)[number]

export function isCatalogCategory(value: string | null | undefined): value is CatalogCategory {
  return !!value && (CATALOG_CATEGORIES as readonly string[]).includes(value)
}

export function normalizeCatalogCategory(value: string | null | undefined): CatalogCategory {
  return isCatalogCategory(value) ? value : 'more'
}
