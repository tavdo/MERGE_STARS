import {cityHouses,type CityHouseId} from './megapolis-domain';
import {museumSourcePhotos} from './museum-photo-library';
import {visualDestination} from './visual-routes';
import type {MuseumDestination} from './house-experience';

export type PhotoContext='city'|'museum'|'brand'|'ai'|'fit'|'materials'|'collection'|'journey'|'studio'|'passport'|'house';
export type StoryboardStage={id:number;title:string;group:'atelier'|'brand';image:string;column:number;row:number;crop?:readonly [number,number,number,number];target:'studio'|'fit'|'orders'|'brand'|'ai'|'social'|'city'|'collection';houseId?:CityHouseId;categoryIndex?:number};
const atelier='/museum-v78/assets/founder-atelier-stages-19-24.png',brand='/museum-v78/assets/founder-brand-manager-dashboard.png';
export const storyboardStages:readonly StoryboardStage[]=[
 {id:19,title:'Watch Design Studio',group:'atelier',image:atelier,column:0,row:0,target:'studio',houseId:'watches',categoryIndex:0},
 {id:20,title:'Jewelry Atelier',group:'atelier',image:atelier,column:1,row:0,target:'studio',houseId:'jewelry',categoryIndex:0},
 {id:21,title:'Fashion Fit Lab',group:'atelier',image:atelier,column:0,row:1,target:'fit'},
 {id:22,title:'Bags, Shoes & Accessories',group:'atelier',image:atelier,column:1,row:1,target:'studio',houseId:'fashion',categoryIndex:2},
 {id:23,title:'MERGE Coin Order & Brand Line',group:'atelier',image:atelier,column:0,row:2,target:'orders'},
 {id:24,title:'My Brand Room',group:'atelier',image:atelier,column:1,row:2,target:'collection'},
 {id:31,title:'Build My Brand House',group:'brand',image:brand,column:0,row:0,crop:[4,88,492,445],target:'brand'},
 {id:32,title:'Meet My MERGE AI',group:'brand',image:brand,column:1,row:0,crop:[502,88,473,445],target:'ai'},
 {id:33,title:'Connect My Brand',group:'brand',image:brand,column:2,row:0,crop:[981,88,463,445],target:'social'},
 {id:34,title:'Open My Showroom',group:'brand',image:brand,column:0,row:1,crop:[4,539,492,424],target:'collection'},
 {id:35,title:'Orders & Production',group:'brand',image:brand,column:1,row:1,crop:[502,539,473,424],target:'orders'},
 {id:36,title:'My House in the Megapolis',group:'brand',image:brand,column:2,row:1,crop:[981,539,463,424],target:'city'},
];
export function storyboardCrop(stage:StoryboardStage):readonly [number,number,number,number]{return stage.crop??[stage.column*724,stage.row*362,724,362];}
export function storyboardStage(id:number){return storyboardStages.find(stage=>stage.id===id)??null;}
export function storyboardStudio(id:number):MuseumDestination|null{
 const stage=storyboardStage(id),house=cityHouses.find(h=>h.id===stage?.houseId);
 const category=house?.categories[stage?.categoryIndex??-1];
 return stage?.target==='studio'&&house&&category?{houseId:house.id,category,query:'',mode:'create'}:null;
}
export function studioPhotoStage(houseId:CityHouseId,category:string){
 const house=cityHouses.find(h=>h.id===houseId),index=house?(house.categories as readonly string[]).indexOf(category):-1;
 return index<0?null:storyboardStage(houseId==='watches'?19:houseId==='jewelry'?20:houseId==='fashion'?index===0?21:22:0);
}
export function photoPlacement(image:string):{context:PhotoContext;houseId?:CityHouseId}{
 if(image===brand)return {context:'brand'};
 const destination=visualDestination(image);
 if(destination?.kind==='house')return {context:'house',houseId:destination.houseId};
 if(destination?.kind==='brand')return {context:'brand'};
 return {context:destination?.kind??'museum'};
}
// Every curated photograph has one primary location. Originals and duplicate
// legacy asset URLs remain unchanged; no presentation ID is a CORE identity.
export const placedPhotographs=museumSourcePhotos.map(photo=>({...photo,...photoPlacement(photo.image)}));
export function photosForContext(context:PhotoContext,houseId?:CityHouseId){return placedPhotographs.filter(photo=>photo.context===context&&(context!=='house'||!houseId||photo.houseId===houseId));}
