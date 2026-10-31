import { words } from './content'

// Curated experiences, not newly registered CORE Brand Houses.
export const lifestyleHouses = [
  { id: 'renaissance', name: 'Renaissance House', title: words('ხელოვნება. ხელობა. ახალი მემკვიდრეობა.', 'Art. Craft. A new legacy.'), categories: ['art', 'architecture', 'objects', 'collectibles'] },
  { id: 'wedding', name: 'Wedding House', title: words('თქვენი დღე. თქვენი საერთო ხელწერა.', 'Your day. Your shared signature.'), categories: ['fashion', 'jewelry', 'footwear', 'accessories', 'fragrance'] },
  { id: 'family', name: 'Family House', title: words('ერთი ოჯახი. სრულად თქვენი სამყარო.', 'One family. A world of your own.'), categories: ['furniture', 'lighting', 'textiles', 'interiors', 'lifestyle', 'objects'] },
] as const

export function lifestyleHouse(id: string | null) {
  return lifestyleHouses.find(house => house.id === id) ?? lifestyleHouses[2]
}

export function lifestyleDesignLink(houseId: string, category: string) {
  const house = lifestyleHouses.find(value => value.id === houseId)
  if (!house || !(house.categories as readonly string[]).includes(category)) return null
  return '/create?' + new URLSearchParams({ application: `${house.name} / ${category}` }).toString()
}
