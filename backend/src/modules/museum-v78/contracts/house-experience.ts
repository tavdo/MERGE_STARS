import { cityHouses, type CityHouseId } from './megapolis-domain';
import type { CoreItem } from './core-contract';
import type { FitCategory } from './fit-measurements';

// Presentation taxonomy only. Existing stored category values and CORE IDs stay intact.
export const houseCategoryNames: Record<CityHouseId, readonly string[]> = {
 mosaic:['Panels & surfaces','Curtains','Carpets & rugs','Textiles & yarn','Decorative objects','Architectural mosaic'],
 games:['Chess, draughts, backgammon & dominoes','Board games & puzzles','Dolls & figures','Soft & textile toys','Construction sets & models','Vehicles, boats & trains','Rubber & elastomer toy concepts','Water & outdoor games','Robotic & interactive toys','Musical & educational toys','Yarn & MERGE textile collections','Baby & toddler toys'],
 fashion:['Clothing','Shoes','Bags & cases','Hats & headwear','Belts & buckles','Ties & bow ties','Scarves & shawls','Gloves & accessories'],
 music:['Strings & bowed instruments','Wind instruments','Keyboards','Percussion','Electronic & hybrid instruments','Georgian & world folk instruments','Instrument accessories'],
 robotics:['Humanoids','Home & service robots','Educational robotics','Industrial robotics','Robotic art','Automated musical instruments','Smart devices','Sensors & connectivity components'],
 nature:['Trees','Flowers','Shrubs','Vertical gardens','Sculptural plants','Landscape collections'],
 jewelry:['Rings','Earrings','Necklaces','Bracelets','Brooches','Creator collections'],
 watches:['Wristwatches','Wall clocks','Watch cases','Creator versions'],
 eyewear:['Frames','Sunglasses','Eyewear cases','Creator versions'],
 interior:['Furniture','Lighting','Curtains','Carpets & rugs','Decor','Spatial design','Household objects','Kitchen & tableware','Bathroom accessories'],
 art:['Sculpture','Installations','Collectibles','Creator art','Writing & drawing instruments','Office & paper accessories'],
 mobility:['Cars','Motorcycles','Bicycles','Boats & yachts','Interior & material components'],
};
const details: Partial<Record<CityHouseId, readonly (readonly string[])[]>> = {
 art:[['Sculpture','Relief'],['Installations','Public art'],['Collectibles','Objects of interest'],['Creator art','Original commissions'],['Pens','Fountain pens','Pencils','Drawing tools','Pen cases'],['Notebooks','Planners','Folders','Desk organizers','Paperweights','Bookends','Business-card cases']],
 fashion:[['Dresses','Suits','Shirts','Trousers','Skirts','Coats','Jackets','Sportswear','Uniforms','Children’s clothing'],['Heels','Flats','Boots','Sneakers','Sandals','Children’s shoes'],['Handbags','Backpacks','Clutches','Travel bags','Briefcases','Coin cases'],['Hats','Caps','Berets','Headpieces'],['Belts','Buckles','Modular belts'],['Ties','Bow ties','Tie pins'],['Scarves','Shawls','Wraps'],['Gloves','Cufflinks','Fashion accessories']],
 games:[['Chess','Draughts','Backgammon','Dominoes'],['Board games','Jigsaw puzzles','Mechanical puzzles','Strategy games'],['Dolls','Dollhouses','Action figures','Miniatures','Licensed characters'],['Plush toys','Textile dolls','Puppets','Knitted toys'],['Building blocks','Construction sets','Model kits','Mechanical models'],['Toy cars','Toy boats','Toy trains','Toy aircraft'],['Flexible toy concepts','Sensory toy concepts','Elastomer components'],['Beach games','Water toys','Outdoor play'],['Toy robots','Interactive figures','Remote-control toys'],['Learning toys','Toy instruments','Activity sets'],['Yarn toys','Woven toys','MERGE textile concepts'],['Rattle concepts','Activity-toy concepts','Baby-room objects']],
 music:[['Guitar','Violin','Cello','Harp','Double bass'],['Flute','Clarinet','Saxophone','Trumpet','Trombone'],['Piano','Organ','Accordion'],['Drums','Cymbals','Xylophone','Hand percussion'],['Synthesizer','Electric guitar','Electronic instrument housings'],['Panduri','Chonguri','Salamuri','Doli','Duduki'],['Stands','Instrument cases','Mouthpiece components','Decorative components']],
 robotics:[['Humanoid concepts','Avatar bodies'],['Companion robots','Service robots','Assistive robot housings'],['Robot kits','Learning systems'],['Robot arms','Automation housings'],['Kinetic sculptures','Interactive installations'],['Self-playing instrument concepts','Performance mechanisms'],['Smart wearable housings','Personal AI capsule concepts','Connected accessories','Smart-home exteriors'],['Sensor housings','Connectivity enclosures','Detachable module concepts']],
 jewelry:[['Rings','Signet rings','Wedding rings'],['Stud earrings','Drop earrings','Hoop earrings'],['Necklaces','Pendants','Chains'],['Bracelets','Bangles','Cuffs'],['Brooches','Pins'],['Signature collections','Limited concepts']],
 watches:[['Mechanical watches','Quartz watches','Watch exteriors'],['Wall clocks','Table clocks'],['Watch cases','Watch straps','Watch bracelets'],['Signature watch concepts']],
 eyewear:[['Optical frames','Modular frames'],['Sunglasses','Sport frames'],['Eyewear cases','Display stands'],['Signature eyewear concepts']],
 interior:[['Chairs','Tables','Sofas','Beds','Cabinets','Shelving'],['Chandeliers','Table lamps','Floor lamps','Wall lights'],['Curtains','Drapery panels'],['Rugs','Carpets','Mosaic floor concepts'],['Mirrors','Vases','Clocks','Decorative objects'],['Bedroom','Bathroom','Living room','Office','Architectural components'],['Storage objects','Home organizers','Laundry accessories','Cleaning-tool exteriors'],['Tableware concepts','Serving pieces','Kitchen organizers','Decorative appliance exteriors'],['Bathroom organizers','Mirrors','Soap dishes','Towel accessories']],
};
export function houseCategoryLabel(houseId: string, category: string) {
 const house=cityHouses.find(h=>h.id===houseId),index=house?(house.categories as readonly string[]).indexOf(category):-1;
 return index<0?'Choose a category':houseCategoryNames[house!.id][index];
}
export function houseTypes(houseId:string,category:string):readonly string[]{
 const h=cityHouses.find(v=>v.id===houseId),i=h?(h.categories as readonly string[]).indexOf(category):-1;
 return i<0?[]:details[h!.id]?.[i]??[houseCategoryNames[h!.id][i]];
}
export function fitCategoryForHouse(houseId:string,category:string):FitCategory {
 const label=houseCategoryLabel(houseId,category);
 if(houseId==='watches')return 'wrist';if(houseId==='eyewear')return 'eyewear';
 if(houseId==='jewelry')return label==='Rings'?'ring':label==='Bracelets'?'wrist':'none';
 if(houseId==='fashion')return label==='Shoes'?'shoes':label==='Clothing'?'fashion':'none';
 return 'none';
}
export function filterCoreExhibits(items:readonly CoreItem[],query:string){
 const terms=query.normalize('NFKC').toLocaleLowerCase().trim().split(/\s+/u).filter(Boolean);
 return terms.length?items.filter(item=>terms.every(term=>(item.title+' '+(item.description??'')).normalize('NFKC').toLocaleLowerCase().includes(term))):[...items];
}
export type MuseumDestination={houseId:CityHouseId|null;category:string;query:string;mode:'browse'|'create'|'import'};
export const emptyMuseumDestination: MuseumDestination={houseId:null,category:'',query:'',mode:'browse'};
export function museumDestination(value:unknown):MuseumDestination{
 const v=value as Partial<MuseumDestination>|null,h=cityHouses.find(h=>h.id===v?.houseId);
 return {houseId:h?.id??null,category:h&&(h.categories as readonly string[]).includes(v?.category??'')?v!.category!:'',query:typeof v?.query==='string'?v.query.slice(0,120):'',mode:v?.mode==='create'||v?.mode==='import'?v.mode:'browse'};
}
