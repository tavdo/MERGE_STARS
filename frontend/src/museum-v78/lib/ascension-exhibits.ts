import {cityHouses} from './megapolis-domain';

/** Presentation references only. IDs below are NOT CORE product/version IDs. */
export const ascensionExhibits = [
  {id:'merge-ascension-watch',title:'MERGE STARS TIME — ASCENSION',titleKa:'საათი',houseId:'watches',categoryIndex:0,description:'Ornamental black watch concept with silver and gold-tone details, star motifs and a globe.',sourceSha256:'7c78cd76f428c8d29fa95fb85adc30e24806f96b4330f433af48f8d063f1f4af',slug:'watch'},
  {id:'merge-ascension-belt',title:'MERGE STARS BELT — ASCENSION',titleKa:'ქამარი',houseId:'fashion',categoryIndex:4,description:'Black belt concept with an ornamental dial-inspired buckle and silver and gold-tone engraving.',sourceSha256:'08d8555af1ea7982983d7ae081b304a6c32faaf08787cccf7f59535524630773',slug:'belt'},
  {id:'merge-ascension-crown',title:'MERGE STARS CROWN — ASCENSION',titleKa:'გვირგვინი',houseId:'jewelry',categoryIndex:5,description:'Ornamental crown concept with a central medallion, star motifs and black, silver and gold-tone detailing.',sourceSha256:'afd1f5a5d4e3d019e34e86ba58a85f7cbcb4855db8bdbb0e428f93d449d65ddd',slug:'crown'},
].map(item=>Object.freeze({...item,collectionId:'merge-ascension-2026',image:`/museum-v78/images/merge-ascension/${item.slug}.webp`,thumbnail:`/museum-v78/images/merge-ascension/${item.slug}-thumb.webp`,original:`/museum-v78/images/merge-ascension/originals/${item.slug}.png`,status:'CONCEPT' as const,coreProductId:null,coreVersionId:null,price:null,qr:null,productionReady:false,rightsState:'CORE_CONFIRMATION_REQUIRED' as const}));
export type AscensionExhibit=typeof ascensionExhibits[number];
export const ascensionIds=ascensionExhibits.map(item=>item.id) as [string,...string[]];
export function ascensionExhibit(id:string){return ascensionExhibits.find(item=>item.id===id);}
export function ascensionPresentationImage(original:string){return ascensionExhibits.find(item=>item.original===original)?.image??original;}
export function ascensionForHouse(houseId?:string,category?:string){
  return ascensionExhibits.filter(item=>(!houseId||item.houseId===houseId)&&(!category||cityHouses.find(h=>h.id===item.houseId)?.categories[item.categoryIndex]===category));
}
export function ascensionAIContext(id:string){
  const item=ascensionExhibit(id);if(!item)throw Error('UNKNOWN_EXHIBIT');
  return JSON.stringify({presentation_reference_id:item.id,collection:item.collectionId,title:item.title,description:item.description,status:item.status,source_sha256:item.sourceSha256,core_product_id:null,core_version_id:null,rights_state:item.rightsState,verified_materials:false,production_ready:false,price:null,qr:null});
}
