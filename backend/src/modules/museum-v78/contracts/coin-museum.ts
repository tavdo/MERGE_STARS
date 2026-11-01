import { z } from 'zod';
import { cityHouses } from './megapolis-domain';
import { materialPreferenceSchema } from './draft-contract';
import { entryLineRequirements } from './entry-law';
import {houseCategoryLabel} from './house-experience';
import {visualStudySchema,museumStudy} from './museum-studies';

// Founder clarification: both lines open twelve Brand Lines; case contents differ. These never
// calculate a payable amount, entitlement, allocation or production weight.
export const coinMuseumLines = Object.freeze([
  Object.freeze({ line: 'GOLD', label: 'GOLD COIN', metal: 'gold', minimum: 1, basis: entryLineRequirements.find(value => value.line === 'GOLD')!.basis, creation: '1 GOLD COIN = 12 BRAND LINES', capacity: '12 Brand Line · 12 ნივთი ერთ GOLD COIN პაკეტსა და ქეისში · ჯამურად 1,000 გ დასრულებული MERGE 8K კომპოზიტი' }),
  Object.freeze({ line: 'SILVER', label: 'SILVER COIN', metal: 'silver', minimum: 1, basis: entryLineRequirements.find(value => value.line === 'SILVER')!.basis, creation: '1 SILVER COIN = 12 BRAND LINES', capacity: '12 Brand Line · ერთი არჩეული ნივთი ერთ SILVER COIN შეკვეთასა და ქეისში · პირადი დაგეგმვა წინასწარი გადახდის გარეშე' }),
] as const);
export type CoinMuseumLine = typeof coinMuseumLines[number]['line'];
export function coinMuseumLine(line: CoinMuseumLine) { return coinMuseumLines.find(value => value.line === line)!; }

// This bounded brief is customer intent, never a CORE Product/House/job record.
// Unknown fields cannot forge entitlement, weight, approval or payment.
export const museumDesignIntentSchema = z.object({
  experience_house_id: z.string().min(1).max(40),
  experience_category: z.string().min(1).max(200),
  coin_line: z.enum(['GOLD', 'SILVER']),
  description: z.string().trim().min(10).max(3000),
  material_preference: materialPreferenceSchema,
  visual_study: visualStudySchema.optional(),
}).strict().superRefine((value, context) => {
  const house = cityHouses.find(item => item.id === value.experience_house_id);
  if (!house || !(house.categories as readonly string[]).includes(value.experience_category)) context.addIssue({ code: z.ZodIssueCode.custom, message: 'HOUSE_CATEGORY_REQUIRED' });
  if (value.material_preference.precious_metal !== coinMuseumLine(value.coin_line).metal) context.addIssue({ code: z.ZodIssueCode.custom, message: 'COIN_MATERIAL_LINE_MISMATCH' });
  if(value.visual_study){const study=museumStudy(value.visual_study.reference_id);if(!study||study.houseId!==value.experience_house_id||study.category!==value.experience_category)context.addIssue({code:z.ZodIssueCode.custom,message:'STUDY_CATEGORY_MISMATCH'});}
});
export type MuseumDesignIntent = z.infer<typeof museumDesignIntentSchema>;
export function prepareMuseumDesignBrief(input: unknown, language:'ka'|'en'='ka'): string | null {
  const result = museumDesignIntentSchema.safeParse(input);
  if (!result.success) return null;
  const value = result.data, house = cityHouses.find(item => item.id === value.experience_house_id)!;
  if(language==='en')return [
    'MERGE STARS — PRIVATE DESIGN BRIEF',
    'STATUS: CONCEPT / PREPARATION ONLY',
    `House: ${house.title}`,`Category: ${houseCategoryLabel(house.id,value.experience_category)}`,
    `Coin preference: ${value.coin_line}`,`Design: ${value.description}`,
    ...(value.visual_study?[`Saved 3D study: ${value.visual_study.reference_id}; finish ${value.visual_study.finish}; mosaic ${value.visual_study.mosaic}; style ${value.visual_study.style}; variation ${value.visual_study.variation}. Procedural concept geometry only; not a Meshy task or verified manufacturing model.`]:[]),
    `Base polymer / filament candidate: ${value.material_preference.base_filament}`,
    `Precious-metal preference: ${value.material_preference.precious_metal}`,
    `Integration: ${value.material_preference.integration}`,`Intended use: ${value.material_preference.intended_use}`,
    `Material details: ${value.material_preference.details||'Not specified'}`,
    'Composition target: 1:2 metal-to-base by mass, approximately 33⅓% metal component. Input purity, blend fraction and verified fine-metal content are separate. CORE Material Lab must approve the recipe and batch.',
    'Both Gold and Silver support 12 Brand Lines in one existing Brand House. No duplicate House is created by this brief.',
    value.coin_line==='GOLD'?'Gold package: up to 12 items. Total finished MERGE 8K gold-composite mass of ITEMS AND CASE must not exceed 1,000 g. Missing weight remains pending.':'Silver package: one physical item and approved case. No mass cap is inferred from the Gold rule.',
    'Each successfully generated item must be registered as an unpaid CORE order within the authorized generation action; no second post-generation confirmation is required. A brief is not a generated item. If registration is unavailable, show CORE_ORDER_REGISTRATION_PENDING and do not invent an order ID.',
    'Price basis: LIVE value of 1 kg of the selected metal, not 1 kg of pure metal in the product. No upfront payment is required to prepare a design. First-1,000 deferred eligibility must be confirmed by CORE; settlement uses only real verified AVAILABLE commissions.',
    'New-sale policy specification: 33% MERGE, 33% metal, 16.5% Source, 16.5% Destination, 1% physical construction; separate platform service 2%. Historical settlements remain unchanged. CORE determines actual pricing, tax and settlement.',
    'CORE Product / Version / House / Order IDs: not assigned. No generation task, verified offer, order, payment or production authorization has been created.',
    'Source products remain unchanged. Public exhibition requires rights and publication permission. All authoritative records belong to the existing MERGE CORE.',
  ].join('\n\n');
  return ['MERGE ⭐ STARS — დიზაინის მოთხოვნის მონახაზი', coinMuseumLine(value.coin_line).label,
    `სამუზეუმო მიმართულება: ${house.title}`, `კატეგორია: ${value.experience_category}`,
    `დიზაინი: ${value.description}`, `საბაზისო მასალა: ${value.material_preference.base_filament}`,
    `ინტეგრაცია: ${value.material_preference.integration}`, `გამოყენება: ${value.material_preference.intended_use}`,
    `დაზუსტება: ${value.material_preference.details || 'არ არის მითითებული'}`,
    'მიზნობრივი 1:2 ლითონისა და საფუძვლის მასობრივი თანაფარდობა: 33⅓% ლითონის კომპონენტი და 66⅔% შერჩეული პოლიმერი; ზუსტი რეცეპტი/რევიზია CORE Material Lab-მა უნდა დაამტკიცოს.',
    'განთავსება: მფლობელის არსებული CORE Brand House / Brand Museum. ახალი წყაროს პროდუქტი არ გადაიწეროს.',
    'ორივე Coin ხსნის 12 Brand Line-ს ერთ Brand House-სა და კატალოგში. SILVER COIN CASE = 1 PRODUCT; GOLD COIN CASE = 12 PRODUCTS. 12 HOUSE არ არის წინასწარ გადახდილი Coin-ები.',
    value.coin_line==='GOLD'?'GOLD პაკეტი და ფიზიკური ქეისი: 12 ნივთი; ჯამური ლიმიტი — 1,000 გ დასრულებული MERGE 8K კომპოზიტი.':'SILVER შეკვეთა და ფიზიკური ქეისი: 1 არჩეული ნივთი; 12 Brand Line-ზე წვდომა ნივთების რაოდენობისგან დამოუკიდებელია.',
    'პირველი 1,000 რეგისტრაცია: გადავადებული Coin-ის საფასური იფარება მხოლოდ დადასტურებული AVAILABLE საკომისიოდან; ფაქტობრივ cohort-სა და დაფარვას CORE ადასტურებს.',
    'დამფუძნებლის ფინანსური სპეციფიკაცია ორივე ხაზისთვის: 33% MERGE + 33% ლითონი + 16.5% Source + 16.5% Destination + 1% მშენებლობა = 100%. ცალკე პლატფორმა 2%; დღგ შესაბამისი კანონით. ეს მონახაზი ანგარიშსწორებას არ ააქტიურებს.',
    'Brand Line-ის / წინასწარი მოთხოვნის მომზადება გადახდას არ ნიშნავს. გადახდა ნებაყოფლობითია; წარმოებას CORE ავტორიზაცია სჭირდება.',
    'მდგომარეობა: მხოლოდ მოთხოვნის მონახაზი. CORE Product ID, generation job, Coin უფლება, წონა, ფასი და შეკვეთა არ შექმნილა.',
  ].join('\n\n');
}
