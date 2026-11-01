// One presentation route map. Alias scenes resolve to one existing service.
// No identifier here is a CORE Product/House/Brand Line or commercial entitlement.
export type WorldAction='entrance'|'city'|'zodiac'|'atrium'|'industries'|'catalog'|'source'|'design'|'fit'|'materials'|'mosaic'|'generation'|'collection'|'gallery'|'house'|'ai'|'social'|'orders'|'passport';
type Scene={id:number;aliases:number[];group:'ARRIVAL'|'DISCOVER'|'CREATE'|'MY BRAND'|'BUILD';title:string;action:WorldAction;image:string;availability:'AVAILABLE'|'PRESENTATION'|'CORE_REQUIRED'};
const city='/museum-v78/assets/founder-megapolis-2026-10-16.png',museum='/museum-v78/assets/founder-grand-museum-interior.png',house='/museum-v78/assets/founder-brand-house-tbilisi.png';
const row=(id:number,group:Scene['group'],title:string,action:WorldAction,image=museum,availability:Scene['availability']='AVAILABLE',aliases:number[]=[]):Scene=>({id,group,title,action,image,availability,aliases});
export const worldScenes:readonly Scene[]=[
 row(1,'ARRIVAL','Gold & Silver introduction','materials','/museum-v78/assets/coin-reference.png'),
 row(2,'ARRIVAL','The closed entrance','entrance','/museum-v78/assets/founder-entry-closed.png'),
 row(3,'ARRIVAL','The opening gates','entrance','/museum-v78/assets/founder-entry-open-approved.png'),
 row(4,'ARRIVAL','Zodiac sculpture hall','zodiac',museum,'PRESENTATION'),
 row(5,'ARRIVAL','The living Megapolis','city',city),row(6,'ARRIVAL','Grand Museum entrance','atrium',museum),
 row(7,'DISCOVER','Central Grand Atrium','atrium'),row(8,'DISCOVER','Twelve industry Houses','industries'),
 row(9,'DISCOVER','Aurum & Argentum collections','catalog'),row(10,'DISCOVER','Exhibit inspection','catalog'),
 row(11,'DISCOVER','Source, rights & history','source',museum,'CORE_REQUIRED'),row(12,'DISCOVER','My design studio','design','/museum-v78/assets/founder-office-study.png'),
 row(13,'CREATE','Digital Twin · Fit to Me','fit','/museum-v78/assets/vip-digital-twin.png'),row(14,'CREATE','Choose a product','industries'),
 row(15,'CREATE','Keep original / My version','design','/museum-v78/assets/vip-create-version.png'),row(16,'CREATE','Choose materials','materials','/museum-v78/assets/material-library.png'),
 row(17,'CREATE','Selective mosaic','mosaic','/museum-v78/assets/mosaic-gold.png'),row(18,'CREATE','Generate & preview','generation','/museum-v78/assets/vip-create-version.png','CORE_REQUIRED'),
 row(19,'CREATE','Watch Design Studio','design','/museum-v78/assets/founder-atelier-stages-19-24.png'),row(20,'CREATE','Jewelry Atelier','design','/museum-v78/assets/founder-atelier-stages-19-24.png'),
 row(21,'CREATE','Fashion Fit Lab','fit','/museum-v78/assets/founder-atelier-stages-19-24.png'),row(22,'CREATE','Bags, Shoes & Accessories','design','/museum-v78/assets/founder-atelier-stages-19-24.png'),
 row(23,'MY BRAND','MERGE Coin Order & Brand Line','orders','/museum-v78/assets/founder-atelier-stages-19-24.png'),row(24,'MY BRAND','My personal Brand Room','house','/museum-v78/assets/founder-atelier-stages-19-24.png','CORE_REQUIRED'),
 row(25,'BUILD','Build my Brand House','house',house,'PRESENTATION',[31]),
 row(26,'BUILD','Personal MERGE AI','ai','/museum-v78/assets/founder-ai-brand-board.png','AVAILABLE',[32]),
 row(27,'BUILD','Connect my brand','social','/museum-v78/assets/founder-ai-brand-board.png','CORE_REQUIRED',[33]),
 row(28,'BUILD','My showroom & QR','catalog',house,'CORE_REQUIRED',[34]),
 row(29,'BUILD','Orders & production','orders',museum,'CORE_REQUIRED',[35]),
 row(30,'BUILD','My House in the Megapolis','city',city,'CORE_REQUIRED',[36]),
];
export function worldScene(id:number){return worldScenes.find(s=>s.id===id||s.aliases.includes(id))??null;}
export const worldTabs=[{id:'atrium',label:'Grand Atrium'},{id:'gallery',label:'My Brand Room'},{id:'house',label:'Build My House'},{id:'zodiac',label:'Zodiac Hall'},{id:'journey',label:'World Journey'}] as const;
export type WorldTab=typeof worldTabs[number]['id'];
export const zodiacStudies=['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'] as const;
