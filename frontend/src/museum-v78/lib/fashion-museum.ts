import { cityHouses, type CityHouseId } from './megapolis-domain';

// A curated entrance across existing industries, not duplicate CORE categories.
export const fashionMuseumSections = [
  { title: 'Wardrobe', choices: [
    { label: 'Dresses & gowns', houseId: 'fashion', categoryIndex: 0, query: 'Dresses' },
    { label: 'Suits & tailoring', houseId: 'fashion', categoryIndex: 0, query: 'Suits' },
    { label: 'Shirts & tops', houseId: 'fashion', categoryIndex: 0, query: 'Shirts' },
    { label: 'Trousers', houseId: 'fashion', categoryIndex: 0, query: 'Trousers' },
    { label: 'Coats & jackets', houseId: 'fashion', categoryIndex: 0, query: 'Jackets' },
    { label: 'Character & performance costumes', houseId: 'fashion', categoryIndex: 0, query: 'Costumes' },
    { label: 'Sportswear', houseId: 'fashion', categoryIndex: 0, query: 'Sportswear' },
    { label: 'Children’s clothing', houseId: 'fashion', categoryIndex: 0, query: 'Children' },
  ] },
  { title: 'Footwear & accessories', choices: [
    { label: 'All footwear', houseId: 'fashion', categoryIndex: 1, query: '' },
    { label: 'Bags & cases', houseId: 'fashion', categoryIndex: 2, query: '' },
    { label: 'Hats & headwear', houseId: 'fashion', categoryIndex: 3, query: '' },
    { label: 'Belts & buckles', houseId: 'fashion', categoryIndex: 4, query: '' },
    { label: 'Ties & bow ties', houseId: 'fashion', categoryIndex: 5, query: '' },
    { label: 'Scarves & shawls', houseId: 'fashion', categoryIndex: 6, query: '' },
    { label: 'Gloves & accessories', houseId: 'fashion', categoryIndex: 7, query: '' },
  ] },
  { title: 'Time, eyewear & jewelry', choices: [
    { label: 'Watches', houseId: 'watches', categoryIndex: 0, query: '' },
    { label: 'Optical frames', houseId: 'eyewear', categoryIndex: 0, query: '' },
    { label: 'Sunglasses', houseId: 'eyewear', categoryIndex: 1, query: '' },
    { label: 'Rings', houseId: 'jewelry', categoryIndex: 0, query: '' },
    { label: 'Earrings', houseId: 'jewelry', categoryIndex: 1, query: '' },
    { label: 'Necklaces', houseId: 'jewelry', categoryIndex: 2, query: '' },
    { label: 'Bracelets', houseId: 'jewelry', categoryIndex: 3, query: '' },
  ] },
] as const;

export type FashionMuseumChoice = typeof fashionMuseumSections[number]['choices'][number];
export function fashionMuseumDestination(choice: FashionMuseumChoice) {
  const houseId: CityHouseId = choice.houseId;
  const category = cityHouses.find(house => house.id === houseId)?.categories[choice.categoryIndex];
  if (!category) throw new Error('INVALID_FASHION_DESTINATION');
  return { houseId, category, query: choice.query, mode: 'browse' as const };
}
