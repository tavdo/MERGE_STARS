import {z} from 'zod';

// Exhibition coordinates and local design history. These are never CORE House,
// Brand Line, Product, price, ownership or publication records.
export const layoutStyles=['OBSIDIAN','IVORY','BOTANICAL'] as const;
export const layoutLighting=['WARM','NEUTRAL','EVENING'] as const;
export const mosaicScales=['MICRO','FINE','MEDIUM','LARGE','ARCHITECTURAL'] as const;
export const houseArchitectures=['PALACE','PAVILION','GARDEN'] as const;
const piece=z.object({slot:z.number().int().min(0).max(11),x:z.number().finite().min(-16).max(16),z:z.number().finite().min(-16).max(16),rotation:z.number().finite().min(-180).max(180)}).strict();
export const houseLayoutSchema=z.object({
  format:z.literal('MERGE_PRIVATE_LAYOUT_STUDY'),version:z.literal(1),
  title:z.string().trim().min(1).max(80),style:z.enum(layoutStyles),
  lighting:z.enum(layoutLighting),mosaic:z.enum(mosaicScales),
  architecture:z.enum(houseArchitectures).optional(),
  pieces:z.array(piece).length(12),
}).strict().superRefine((value,ctx)=>{
  if(new Set(value.pieces.map(p=>p.slot)).size!==12)ctx.addIssue({code:'custom',message:'Every display slot must occur exactly once'});
  for(const p of value.pieces){if(Math.hypot(p.x,p.z)>16||Math.hypot(p.x,p.z)<6)ctx.addIssue({code:'custom',message:'Keep showcases outside the lift and inside the perimeter'});}
  for(let i=0;i<value.pieces.length;i++)for(let j=i+1;j<value.pieces.length;j++)if(Math.hypot(value.pieces[i].x-value.pieces[j].x,value.pieces[i].z-value.pieces[j].z)<2.8)ctx.addIssue({code:'custom',message:'Showcases need a clear circulation gap'});
});
export type HouseLayout=z.infer<typeof houseLayoutSchema>;
export function clockDisplayPosition(index:number,radius=13){if(!Number.isInteger(index)||index<0||index>11)throw Error('Invalid display place');const angle=(index+1)*Math.PI/6;return {x:Math.sin(angle)*radius,z:-Math.cos(angle)*radius};}
export function defaultHouseLayout():HouseLayout{return {format:'MERGE_PRIVATE_LAYOUT_STUDY',version:1,title:'My Living Brand House',style:'OBSIDIAN',lighting:'WARM',mosaic:'MEDIUM',pieces:Array.from({length:12},(_,slot)=>{const p=clockDisplayPosition(slot);return {slot,x:Number(p.x.toFixed(3)),z:Number(p.z.toFixed(3)),rotation:(slot+1)*30>180?(slot+1)*30-360:(slot+1)*30};})};}
export type LayoutHistory={present:HouseLayout;past:HouseLayout[];future:HouseLayout[]};
export function initialLayoutHistory():LayoutHistory{return {present:defaultHouseLayout(),past:[],future:[]};}
export function commitLayout(history:LayoutHistory,value:unknown):LayoutHistory{
  const next=houseLayoutSchema.parse(value);if(JSON.stringify(next)===JSON.stringify(history.present))return history;
  return {present:next,past:[...history.past,history.present].slice(-50),future:[]};
}
export function undoLayout(h:LayoutHistory):LayoutHistory{return h.past.length?{present:h.past.at(-1)!,past:h.past.slice(0,-1),future:[h.present,...h.future].slice(0,50)}:h;}
export function redoLayout(h:LayoutHistory):LayoutHistory{return h.future.length?{present:h.future[0],past:[...h.past,h.present].slice(-50),future:h.future.slice(1)}:h;}
export function transformDisplay(h:LayoutHistory,slot:number,dx:number,dz:number,rotation=0):LayoutHistory{
  if(![dx,dz,rotation].every(Number.isFinite))throw Error('Invalid transform');
  return commitLayout(h,{...h.present,pieces:h.present.pieces.map(p=>p.slot===slot?{...p,x:Number((p.x+dx).toFixed(3)),z:Number((p.z+dz).toFixed(3)),rotation:((p.rotation+rotation+540)%360)-180}:p)});
}
export function importLayout(text:string):HouseLayout{if(new TextEncoder().encode(text).byteLength>64*1024)throw Error('Layout file exceeds 64 KiB');return houseLayoutSchema.parse(JSON.parse(text));}

export const houseTransformations=[
  {id:'OBSIDIAN_PALACE',label:'Obsidian Palace',style:'OBSIDIAN',lighting:'WARM',mosaic:'ARCHITECTURAL',architecture:'PALACE',radius:13},
  {id:'SILVER_ATELIER',label:'Silver Atelier',style:'IVORY',lighting:'NEUTRAL',mosaic:'FINE',architecture:'PAVILION',radius:14},
  {id:'BOTANICAL_RETREAT',label:'Botanical Retreat',style:'BOTANICAL',lighting:'EVENING',mosaic:'MEDIUM',architecture:'GARDEN',radius:12},
] as const;
// A deterministic private scene composition, never an AI job or a CORE mutation.
export function transformHouseStudy(layout:HouseLayout,id:string):HouseLayout{
  const preset=houseTransformations.find(value=>value.id===id);
  if(!preset)throw Error('INVALID_HOUSE_TRANSFORMATION');
  const source=houseLayoutSchema.parse(layout);
  return houseLayoutSchema.parse({...source,style:preset.style,lighting:preset.lighting,mosaic:preset.mosaic,architecture:preset.architecture,pieces:source.pieces.map(piece=>{
    const p=clockDisplayPosition(piece.slot,preset.radius);return {...piece,x:Number(p.x.toFixed(3)),z:Number(p.z.toFixed(3))};
  })});
}

export type LiftPhase='IDLE'|'CLOSING'|'TRAVELLING'|'OPENING';
export type LiftState={height:number;door:number;target:0|8;phase:LiftPhase};
export const initialLift=():LiftState=>({height:0,door:0,target:0,phase:'IDLE'});
export function requestLift(state:LiftState,target:0|8):LiftState{
  if(state.phase!=='IDLE')return state;
  return {...state,target,phase:Math.abs(state.height-target)<.001?'OPENING':state.door>0?'CLOSING':'TRAVELLING'};
}
export function requestLiftDoor(state:LiftState,open:boolean):LiftState{return state.phase==='IDLE'?{...state,phase:open?'OPENING':'CLOSING'}:state;}
export function advanceLift(state:LiftState,seconds:number,reduced=false):LiftState{
  if(!Number.isFinite(seconds)||seconds<0)return state;
  const dt=Math.min(.05,seconds);
  if(reduced)return {height:state.target,door:state.phase==='CLOSING'&&Math.abs(state.height-state.target)<.001?0:1,target:state.target,phase:'IDLE'};
  if(state.phase==='CLOSING'){const door=Math.max(0,state.door-dt*1.2);return {...state,door,phase:door>0?'CLOSING':Math.abs(state.height-state.target)<.001?'IDLE':'TRAVELLING'};}
  if(state.phase==='TRAVELLING'){const delta=state.target-state.height,step=Math.sign(delta)*Math.min(Math.abs(delta),dt*2);const height=state.height+step;const arrived=Math.abs(height-state.target)<.001;return {...state,height:arrived?state.target:height,door:0,phase:arrived?'OPENING':'TRAVELLING'};}
  if(state.phase==='OPENING'){const door=Math.min(1,state.door+dt*.85);return {...state,door,phase:door===1?'IDLE':'OPENING'};}
  return state;
}
