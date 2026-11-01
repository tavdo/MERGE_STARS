import { cityHouses, type CityHouseId } from './megapolis-domain';

// Navigation choices reuse the existing catalog taxonomy, not new CORE entities.
export const privateCreationPath: readonly { id: string; label: string; options: readonly { label: string; house: CityHouseId; categoryIndex: number }[] }[] = [
  { id: 'home', label: '1. სახლი და არქიტექტურა', options: [
    { label: 'სახლი და სივრცის დაგეგმვა', house: 'interior', categoryIndex: 5 },
    { label: 'ავეჯი', house: 'interior', categoryIndex: 0 },
    { label: 'განათება', house: 'interior', categoryIndex: 1 },
    { label: 'არქიტექტურული მოზაიკა', house: 'mosaic', categoryIndex: 5 },
  ] },
  { id: 'transport', label: '2. ტრანსპორტი და რეკონსტრუქცია', options: [
    { label: 'ავტომობილი', house: 'mobility', categoryIndex: 0 },
    { label: 'მოტოციკლი', house: 'mobility', categoryIndex: 1 },
    { label: 'ინტერიერი და კომპონენტები', house: 'mobility', categoryIndex: 4 },
  ] },
  { id: 'fashion', label: '3. ფეშენი და აქსესუარები', options: [
    { label: 'ტანსაცმელი', house: 'fashion', categoryIndex: 0 },
    { label: 'ფეხსაცმელი', house: 'fashion', categoryIndex: 1 },
    { label: 'ჩანთა', house: 'fashion', categoryIndex: 2 },
    { label: 'საათი', house: 'watches', categoryIndex: 0 },
    { label: 'სამკაული', house: 'jewelry', categoryIndex: 0 },
    { label: 'სათვალე', house: 'eyewear', categoryIndex: 0 },
  ] },
];

export function privateCreationTarget(house: CityHouseId, categoryIndex: number) {
  const category = cityHouses.find(item => item.id === house)?.categories[categoryIndex];
  return category ? { house, category } : null;
}
