/** 6 clusters = UI navigation only. 30 houses = Master Catalog directions. */

export const MASTER_CLUSTERS = [
  { key: 'personal-fashion', label: 'Personal & Fashion' },
  { key: 'mobility-lifestyle', label: 'Mobility & Lifestyle' },
  { key: 'sport-play', label: 'Sport & Play' },
  { key: 'space-living', label: 'Space & Living' },
  { key: 'business-hospitality', label: 'Business & Hospitality' },
  { key: 'culture-occasion', label: 'Culture & Occasion' },
] as const

export const MASTER_HOUSES = [
  { key: 'jewelry', label: 'Jewelry', cluster: 'personal-fashion' },
  { key: 'watch', label: 'Watch', cluster: 'personal-fashion' },
  { key: 'fashion', label: 'Fashion', cluster: 'personal-fashion' },
  { key: 'beauty', label: 'Beauty', cluster: 'personal-fashion' },
  { key: 'perfume', label: 'Perfume', cluster: 'personal-fashion' },
  { key: 'luxury', label: 'Luxury', cluster: 'personal-fashion' },
  { key: 'automotive', label: 'Automotive', cluster: 'mobility-lifestyle' },
  { key: 'moto', label: 'Moto', cluster: 'mobility-lifestyle' },
  { key: 'yacht', label: 'Yacht & Marine', cluster: 'mobility-lifestyle' },
  { key: 'travel', label: 'Travel', cluster: 'mobility-lifestyle' },
  { key: 'sports', label: 'Sports', cluster: 'sport-play' },
  { key: 'football', label: 'Football / Sports Club', cluster: 'sport-play' },
  { key: 'gaming', label: 'Gaming & Esports', cluster: 'sport-play' },
  { key: 'toys', label: 'Toys & Collectibles', cluster: 'sport-play' },
  { key: 'kids', label: 'Kids', cluster: 'sport-play' },
  { key: 'home', label: 'Home & Interior', cluster: 'space-living' },
  { key: 'architecture', label: 'Architecture & Design', cluster: 'space-living' },
  { key: 'office', label: 'Office & Stationery', cluster: 'space-living' },
  { key: 'garden', label: 'Garden & Outdoor', cluster: 'space-living' },
  { key: 'pet', label: 'Pet', cluster: 'space-living' },
  { key: 'corporate', label: 'Corporate', cluster: 'business-hospitality' },
  { key: 'hotel', label: 'Hotel & Hospitality', cluster: 'business-hospitality' },
  { key: 'restaurant', label: 'Restaurant & Café', cluster: 'business-hospitality' },
  { key: 'technology', label: 'Technology', cluster: 'business-hospitality' },
  { key: 'music', label: 'Music & Artist', cluster: 'culture-occasion' },
  { key: 'film', label: 'Film & Entertainment', cluster: 'culture-occasion' },
  { key: 'art', label: 'Art', cluster: 'culture-occasion' },
  { key: 'events', label: 'Events & Wedding', cluster: 'culture-occasion' },
  { key: 'gifts', label: 'Gifts & Souvenirs', cluster: 'culture-occasion' },
  { key: 'creator', label: 'Creator', cluster: 'culture-occasion' },
] as const

export type MasterHouseKey = (typeof MASTER_HOUSES)[number]['key']
export type MasterClusterKey = (typeof MASTER_CLUSTERS)[number]['key']

export const MASTER_HOUSE_KEYS = MASTER_HOUSES.map((h) => h.key)

export function isMasterHouse(value: string | null | undefined): value is MasterHouseKey {
  return !!value && (MASTER_HOUSE_KEYS as string[]).includes(value)
}

export function houseByKey(key: string) {
  return MASTER_HOUSES.find((h) => h.key === key) ?? null
}

export function housesForCluster(cluster: string) {
  return MASTER_HOUSES.filter((h) => h.cluster === cluster)
}
