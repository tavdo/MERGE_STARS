import {cityHouses,type CityHouseId} from './megapolis-domain';
import {houseCategoryLabel} from './house-experience';

export type HouseRoomSlot={key:string;houseId:CityHouseId;category:string;label:string;index:number;x:number;z:number;angle:number;kind:'CATEGORY_SHOWCASE'};
export type HouseRoomSnapshot={houseId:CityHouseId;yaw:number;selected:number|null};
export function houseRoomSlots(houseId:CityHouseId):HouseRoomSlot[]{
 const house=cityHouses.find(value=>value.id===houseId);if(!house)throw Error('UNKNOWN_HOUSE');
 return house.categories.map((category,index)=>{const angle=-Math.PI/2+index*Math.PI*2/house.categories.length;return {key:houseId+':category:'+index,houseId,category,label:houseCategoryLabel(houseId,category),index,x:Math.sin(angle)*8.4,z:Math.cos(angle)*8.4,angle,kind:'CATEGORY_SHOWCASE'};});
}
export function roomSlotIndex(current:number,direction:number,count:number){
 if(!Number.isInteger(count)||count<1||!Number.isFinite(current)||!Number.isFinite(direction))return 0;
 return ((Math.trunc(current)+Math.trunc(direction))%count+count)%count;
}
export function boundedRoomSnapshot(houseId:CityHouseId,value?:HouseRoomSnapshot|null):HouseRoomSnapshot{
 const count=houseRoomSlots(houseId).length,same=value?.houseId===houseId;
 return {houseId,yaw:same&&Number.isFinite(value.yaw)?Math.max(-Math.PI*20,Math.min(Math.PI*20,value.yaw)):0,selected:same&&value.selected!==null&&Number.isInteger(value.selected)&&value.selected>=0&&value.selected<count?value.selected:null};
}
// This is an exact region of the original approved multi-panel image, not a new model.
export const fashionHouseReference=Object.freeze({image:'/museum-v78/assets/founder-atrium-fashion.png',crop:[0,.582,.5,1] as const,presentation:'APPROVED_INTERIOR_PHOTOGRAPH'});
export const houseRoomAccents:Record<CityHouseId,string>={fashion:'#473348',games:'#31434e',music:'#492d32',robotics:'#254448',mosaic:'#28463e',nature:'#28422e',jewelry:'#493d29',watches:'#293b4b',eyewear:'#3d2d36',interior:'#3d3b30',art:'#3a3048',mobility:'#263d46'};
