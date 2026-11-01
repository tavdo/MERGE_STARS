import type { CoreCollection } from './core-contract';

// These are navigation themes, never CORE entities, material specifications or products.
export const cityHouses = [
  { id: 'mosaic', title: 'MOSAIC HOUSE', name: 'მოზაიკა', color: '#21786b', aliases: ['mosaic', 'მოზაიკა'], categories: ['პანელები და ზედაპირები', 'ფარდები', 'ხალიჩები', 'ქსოვილი და ძაფი', 'დეკორი', 'არქიტექტურული მოზაიკა'] },
  { id: 'games', title: 'GAME HOUSE', name: 'თამაშები და სათამაშოები', color: '#a96670', aliases: ['games', 'game', 'toys', 'toy', 'chess', 'თამაშები', 'სათამაშოები', 'ჭადრაკი'], categories: ['ჭადრაკი, შაში, ნარდი და დომინო', 'სამაგიდო თამაშები და თავსატეხები', 'თოჯინები და ფიგურები', 'რბილი და ქსოვილის სათამაშოები', 'კონსტრუქტორები და ასაწყობი მოდელები', 'მანქანები, გემები და მატარებლები', 'რეზინისა და კაუჩუკის სათამაშოების ტიპები', 'წყლისა და გარე თამაშები', 'რობოტული და ინტერაქტიული სათამაშოები', 'მუსიკალური და საგანმანათლებლო სათამაშოები', 'ძაფისა და ახალი MERGE ქსოვილის კოლექციები', 'ჩვილებისა და პატარების სათამაშოები'] },
  { id: 'fashion', title: 'FASHION HOUSE', name: 'მოდა', color: '#704669', aliases: ['fashion', 'clothing', 'shoes', 'bags', 'მოდა', 'ტანსაცმელი', 'ფეხსაცმელი', 'ჩანთები'], categories: ['ტანსაცმელი', 'ფეხსაცმელი', 'ჩანთები და ქეისები', 'ქუდები და თავსაბურავები', 'ქამრები და ბალთები', 'ჰალსტუხები და ბაფთები', 'შარფები და შალები', 'ხელთათმანები და აქსესუარები'] },
  { id: 'music', title: 'MUSICAL INSTRUMENTS HOUSE', name: 'საკრავი ინსტრუმენტები', color: '#946b43', aliases: ['music', 'musical instruments', 'instruments', 'მუსიკა', 'საკრავები'], categories: ['სიმებიანი და ხემიანი', 'ჩასაბერი', 'კლავიშიანი', 'დასარტყამი', 'ელექტრონული და ჰიბრიდული', 'ქართული და სხვა ხალხური საკრავები', 'აქსესუარები'] },
  { id: 'robotics', title: 'ROBOTICS HOUSE', name: 'რობოტექნიკა', color: '#557c9b', aliases: ['robotics', 'robots', 'technology', 'smart devices', 'electronics', 'wearables', 'რობოტექნიკა', 'რობოტები'], categories: ['ჰუმანოიდები', 'სახლისა და მომსახურების რობოტები', 'საგანმანათლებლო', 'საწარმოო', 'რობოტული ხელოვნება', 'ავტომატიზებული საკრავები', 'ჭკვიანი მოწყობილობები', 'სენსორები და კავშირის კომპონენტები'] },
  { id: 'nature', title: 'NATURE HOUSE', name: 'ხეები და ყვავილები', color: '#387d4e', aliases: ['nature', 'plants', 'flowers', 'garden', 'ბუნება', 'მცენარეები', 'ყვავილები'], categories: ['ხეები', 'ყვავილები', 'ბუჩქები', 'ვერტიკალური ბაღები', 'სკულპტურული მცენარეები', 'ლანდშაფტის კოლექციები'] },
  { id: 'jewelry', title: 'JEWELRY HOUSE', name: 'სამკაული', color: '#947b43', aliases: ['jewelry', 'jewellery', 'სამკაული'], categories: ['ბეჭდები', 'საყურეები', 'ყელსაბამები', 'სამაჯურები', 'ბროშები', 'ავტორის კოლექციები'] },
  { id: 'watches', title: 'WATCH HOUSE', name: 'საათები', color: '#6d7e92', aliases: ['watches', 'watch', 'საათი', 'საათები'], categories: ['ხელის საათები', 'კედლის საათები', 'საათის ქეისები', 'ავტორის ვერსიები'] },
  { id: 'eyewear', title: 'EYEWEAR HOUSE', name: 'სათვალეები', color: '#99585e', aliases: ['eyewear', 'glasses', 'სათვალე', 'სათვალეები'], categories: ['ჩარჩოები', 'მზის სათვალეები', 'ქეისები', 'ავტორის ვერსიები'] },
  { id: 'interior', title: 'INTERIOR HOUSE', name: 'ავეჯი და ინტერიერი', color: '#7a7764', aliases: ['furniture', 'interior', 'lighting', 'home', 'household', 'kitchen', 'tableware', 'bathroom', 'ავეჯი', 'ინტერიერი', 'განათება'], categories: ['ავეჯი', 'განათება', 'ფარდები', 'ხალიჩები', 'დეკორი', 'სივრცის მოწყობა', 'საყოფაცხოვრებო ნივთები', 'სამზარეულო და ჭურჭელი', 'აბაზანის აქსესუარები'] },
  { id: 'art', title: 'ART HOUSE', name: 'ხელოვნება', color: '#706691', aliases: ['art', 'sculpture', 'stationery', 'writing', 'drawing', 'office supplies', 'paper', 'ხელოვნება', 'სკულპტურა'], categories: ['სკულპტურა', 'ინსტალაცია', 'კოლექციური ნივთები', 'ავტორის ხელოვნება', 'წერისა და ხატვის ინსტრუმენტები', 'საოფისე და ქაღალდის აქსესუარები'] },
  { id: 'mobility', title: 'MOBILITY HOUSE', name: 'ტრანსპორტი', color: '#537d81', aliases: ['transport', 'automotive', 'vehicles', 'motorcycles', 'bicycles', 'ავტომობილი', 'ტრანსპორტი', 'მოტოციკლები'], categories: ['ავტომობილები', 'მოტოციკლები', 'ველოსიპედები', 'გემები', 'ინტერიერისა და მასალის კომპონენტები'] },
] as const;
export type CityHouseId = typeof cityHouses[number]['id'];
export type CityBuilding = { key: string; title: string; subtitle: string; color: string; kind: 'theme' | 'brand-line'; houseId?: CityHouseId; brandLineId?: string; collectionSlugs: string[] };
const normalized = (value: string) => value.normalize('NFKC').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
export function collectionInHouse(collection: CoreCollection, houseId: CityHouseId) {
  const category = ` ${normalized(collection.category)} `;
  return cityHouses.find(house => house.id === houseId)!.aliases.some(alias => category.includes(` ${normalized(alias)} `));
}
export function themeBuildings(collections: readonly CoreCollection[]): CityBuilding[] {
  return cityHouses.map(house => ({ key: `theme:${house.id}`, title: house.title, subtitle: house.name, color: house.color, kind: 'theme', houseId: house.id, collectionSlugs: collections.filter(collection => collectionInHouse(collection, house.id)).map(collection => collection.slug) }));
}
export function brandBuildings(collections: readonly CoreCollection[]): CityBuilding[] {
  const groups = new Map<string, CoreCollection[]>();
  for (const collection of collections) {
    if (collection.visibility !== 'PUBLIC' || !collection.brandLineId?.trim()) continue;
    const group = groups.get(collection.brandLineId) ?? [];
    if (!group.some(record => record.id === collection.id)) group.push(collection);
    groups.set(collection.brandLineId, group);
  }
  return [...groups].sort(([a], [b]) => a.localeCompare(b)).map(([brandLineId, group], index) => ({ key: `brand-line:${brandLineId}`, title: group[0].brandName || 'CORE Brand Line', subtitle: `${group.length} საჯარო კოლექცია`, color: cityHouses[index % cityHouses.length].color, kind: 'brand-line', brandLineId, collectionSlugs: group.map(collection => collection.slug) }));
}

export type CityPosition = { x: number; z: number; yaw: number };
export const cityStart: CityPosition = { x: 0, z: 35, yaw: 0 };
export function walkCity(position: CityPosition, forward: number, turn: number, seconds: number): CityPosition {
  if (![position.x, position.z, position.yaw, forward, turn, seconds].every(Number.isFinite)) return { ...cityStart };
  const dt = Math.max(0, Math.min(.05, seconds)), yaw = position.yaw - Math.max(-1, Math.min(1, turn)) * dt * 1.7;
  const step = Math.max(-1, Math.min(1, forward)) * dt * 7;
  // Walkable boulevard bounds keep the avatar outside building geometry.
  return { x: Math.max(-8, Math.min(8, position.x - Math.sin(yaw) * step)), z: Math.max(-38, Math.min(40, position.z - Math.cos(yaw) * step)), yaw };
}
export function buildingPosition(index: number): readonly [number, number] { return [index % 2 ? 17 : -17, 27 - Math.floor(index / 2) * 12]; }
export const cityGrandMuseum=Object.freeze({key:'landmark:grand-museum',title:'GRAND LIVING MUSEUM',x:0,z:-49});
// A virtual architectural landmark, not a partner, product or religious institution.
export const cityChurch = Object.freeze({ key: 'landmark:georgian-church', title: 'ქართული ეკლესია', subtitle: 'ვირტუალური არქიტექტურული სივრცე', x: -28, z: -58 });
export const plantFacts = Object.freeze({
  type: 'სკულპტურული ხე / ყვავილი',
  dimensions: 'ფიზიკური ზომები CORE-ში დასადასტურებელია',
  estimatedWeight: 'CALCULATION PENDING',
  verifiedWeight: 'VERIFICATION REQUIRED',
  composition: 'CORE Material Lab-ის სპეციფიკაცია საჭიროა',
  colors: 'ბუნებრივი მწვანე და ყვავილის ფერები · ვიზუალური პალიტრა',
  displayScale: 'EXHIBITION_ONLY',
  commercialEnabled: false,
});
