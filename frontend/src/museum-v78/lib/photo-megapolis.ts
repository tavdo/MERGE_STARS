// The founder's exact artwork, not a mesh, product, identity, or price source.
export const photoMegapolis = Object.freeze({
  image: '/museum-v78/assets/founder-megapolis-2026-10-16.png',
  sha256: 'cbc414c1b36e7e1ff0752940eaa5ee572ce902d3c5d41a93bc01303f963ccb5e',
  width: 1536, height: 1024, presentation: 'ANIMATED_PHOTOGRAPH',
});
// All coordinates use the unchanged reference image, with a top-left origin.
// Opaque DOM covers suppress the artwork's illustrative price and UI.
// This new artwork has no account panel: its waterfall stays unobstructed.
export const photoInterfaceMasks = [
  {id:'header',x:0,y:0,w:1,h:.068},
  {id:'tools',x:.938,y:.121,w:.061,h:.499},
  {id:'prices',x:.009,y:.762,w:.148,h:.101},
  {id:'create',x:.802,y:.739,w:.197,h:.143},
  {id:'dock',x:.092,y:.901,w:.804,h:.095},
] as const;
export function photoPanelStyle(id:typeof photoInterfaceMasks[number]['id']){
  const panel=photoInterfaceMasks.find(mask=>mask.id===id)!;
  return {left:panel.x*100+'%',top:panel.y*100+'%',width:panel.w*100+'%',height:panel.h*100+'%'};
}
export const photoDestinations = [
  {id:'watches',label:'WATCH HOUSE',x:6.5,y:29.3},
  {id:'jewelry',label:'JEWELRY HOUSE',x:22,y:31.2},
  {id:'fashion',label:'FASHION HOUSE',x:13.7,y:50.5},
  {id:'fashion-bags',houseId:'fashion',label:'BAGS · FASHION',x:32.5,y:43},
  {id:'interior',label:'INTERIOR HOUSE',x:70.5,y:42},
  {id:'art',label:'ART HOUSE',x:86.7,y:33.4},
  {id:'mobility',label:'MOBILITY HOUSE',x:88.5,y:53.5},
  {id:'museum',label:'GRAND LIVING MUSEUM',x:50.4,y:27.6},
] as const;
// Local optical animation regions aligned to this exact new frame. They are
// screen coordinates, never physical measurements or reconstructed meshes.
export type PhotoMotionKind='hair'|'figure'|'cape'|'falls'|'pool'|'reflection'|'island';
export const photoMotionRegions:readonly {kind:PhotoMotionKind;bounds:readonly[number,number,number,number];feather:number}[]=[
  {kind:'hair',bounds:[.456,.493,.538,.677],feather:.014},
  {kind:'figure',bounds:[.45,.65,.551,.854],feather:.014},
  {kind:'cape',bounds:[.33,.69,.448,.893],feather:.018},
  {kind:'cape',bounds:[.545,.702,.609,.893],feather:.014},
  {kind:'falls',bounds:[.004,.133,.035,.223],feather:.004},
  {kind:'falls',bounds:[.108,.135,.145,.24],feather:.005},
  {kind:'falls',bounds:[.31,.17,.334,.258],feather:.004},
  {kind:'falls',bounds:[.756,.26,.78,.332],feather:.004},
  {kind:'falls',bounds:[.916,.22,.934,.344],feather:.003},
  {kind:'falls',bounds:[.442,.487,.473,.574],feather:.005},
  {kind:'falls',bounds:[.537,.488,.56,.574],feather:.005},
  {kind:'pool',bounds:[.094,.744,.27,.802],feather:.008},
  {kind:'pool',bounds:[.25,.633,.434,.697],feather:.008},
  {kind:'pool',bounds:[.584,.635,.747,.716],feather:.008},
  {kind:'pool',bounds:[.762,.734,.794,.826],feather:.006},
  {kind:'reflection',bounds:[.21,.835,.404,.895],feather:.012},
  {kind:'reflection',bounds:[.596,.832,.766,.895],feather:.012},
  {kind:'island',bounds:[.67,.085,.795,.235],feather:.014},
];
export type PhotoCamera={zoom:number;x:number;y:number};
export const initialPhotoCamera:PhotoCamera={zoom:1,x:0,y:0};
export function boundPhotoCamera(value:PhotoCamera):PhotoCamera{
  const zoom=Number.isFinite(value.zoom)?Math.max(1,Math.min(1.38,value.zoom)):1;
  if(zoom===1)return {...initialPhotoCamera};
  const bound=(zoom-1)*50;
  return {zoom,x:Number.isFinite(value.x)?Math.max(-bound,Math.min(bound,value.x)):0,y:Number.isFinite(value.y)?Math.max(-bound,Math.min(bound,value.y)):0};
}
export function photoPointIsMasked(x:number,y:number){return photoInterfaceMasks.some(mask=>x>=mask.x&&x<=mask.x+mask.w&&y>=mask.y&&y<=mask.y+mask.h);}
