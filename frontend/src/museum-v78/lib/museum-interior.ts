// Presentation assets only. These crops describe the approved interior, never product geometry.
export const interiorReference = '/museum-v78/assets/approved-mega-museum.png';
export type InteriorPanel = {name:string;start:number;end:number;bottom:number;top:number;crop:readonly [number,number,number,number]};
export const interiorPanels:readonly InteriorPanel[]=Object.freeze([
 {name:'AURUM facade',start:-68,end:-9,bottom:.15,top:11.4,crop:[.145,.064,.398,.413]},
 {name:'ARGENTUM facade',start:9,end:68,bottom:.15,top:11.4,crop:[.598,.064,.866,.413]},
 {name:'Central vault',start:-9,end:9,bottom:6.9,top:13,crop:[.418,.065,.59,.158]},
 {name:'AURUM colonnade',start:-113,end:-53,bottom:.15,top:10.5,crop:[.147,.278,.28,.406]},
 {name:'ARGENTUM colonnade',start:53,end:113,bottom:.15,top:10.5,crop:[.715,.275,.865,.409]},
 {name:'Rear AURUM gallery',start:-180,end:-113,bottom:.15,top:10.5,crop:[.146,.284,.277,.409]},
 {name:'Rear ARGENTUM gallery',start:113,end:180,bottom:.15,top:10.5,crop:[.72,.284,.862,.409]},
]);
export const medallionCrop = [.407,.161,.586,.433] as const;
// The reference's front architecture keeps its original proportions. Side galleries extend this same world.
export const frontFacades=Object.freeze([
 {name:'Continuous AURUM / MERGE COIN / ARGENTUM facade',position:[0,8.75,-18] as const,width:47,height:15.5,crop:[.146,.06,.861,.414] as const},
]);
export const centralMedallion=Object.freeze({position:[-.46,6.123,-17.97] as const,radius:5.88});
export function exhibitionShape(id:string,crop:readonly [number,number,number,number]){const [l,t,r,b]=crop,aspect=(r-l)*1.5/(b-t),long=id==='eyewear'?2.65:id==='fashion'?2.8:2.25;return {w:Math.min(long,long*aspect),h:Math.min(long,long/aspect)};}
export function exhibitionFacing(x:number,z:number,id?:string){
 // Flat displays face a clear approach lane; crowded clusters need an angle that clears neighboring plinths.
 const clearLane:Record<string,number>={jewelry:Math.PI/2,decor:0,technology:Math.PI/2,mosaic:-Math.PI/2,furniture:-.4};
 return id!==undefined&&id in clearLane?clearLane[id]:Math.atan2(-x,13-z);
}
export const museumFloralDisplays=Object.freeze([[-15,-3],[15,-3],[-5.5,-5.5],[5.4,-12.2],[-14,8],[14,8]] as const);
export const museumLensShift=(focus:boolean|number,width:number):number=>width>=900?-.3*Math.max(0,Math.min(1,Number(focus))):0;
export const museumLensLift=(focus:boolean|number,width:number):number=>width<900?.42*Math.max(0,Math.min(1,Number(focus))):0;
export function museumPresentationFov(fov:number,focus:boolean|number,width:number,height=0,displayBounds?:readonly [number,number]):number{
 const amount=Math.max(0,Math.min(1,Number(focus))),mobile=width<900,base=fov+(mobile?12*amount:0);
 if(!displayBounds||height<=0||width<=0||amount===0)return base;
 // Frame the picture within the space left by the contextual tools, using display sizes exclusively.
 const horizontal=mobile?.86:.57,vertical=mobile?.32:.7,required=2*Math.atan(Math.max(displayBounds[0]/(6.7*(width/height)*horizontal),displayBounds[1]/(6.7*vertical)))*180/Math.PI;
 return Math.max(base,fov+(required-fov)*amount);
}
export const museumMoveDuration=(distance:number):number=>Math.max(950,Math.min(1850,950+Math.max(0,distance)*75));
