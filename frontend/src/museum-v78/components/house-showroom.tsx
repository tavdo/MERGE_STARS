"use client";
import {useEffect,useRef,useState,type MutableRefObject} from 'react';
import {ArrowLeft,ArrowRight,ArrowUp,ArrowDown,Expand,RotateCcw,Building2,Layers3} from 'lucide-react';
import {CompanyMark} from './company-identity';
import {cityHouses,type CityHouseId} from '@/museum-v78/lib/megapolis-domain';
import {houseRoomSlots,boundedRoomSnapshot,roomSlotIndex,type HouseRoomSnapshot} from '@/museum-v78/lib/house-room';
import {AscensionExhibits} from './ascension-exhibits';
import {FashionMuseum} from './fashion-museum';
import type {MuseumDestination} from '@/museum-v78/lib/house-experience';
import {ContextPhotoSequence} from './photo-scenario';
import {HouseVisualSequence} from '@/museum-v78/components/house-visual-sequence';
import {BrandHouseBrowser} from '@/museum-v78/components/brand-house-browser';
import {createMuseumFrameLoop} from '@/museum-v78/lib/museum-frame-loop';
import type {createHouseRoomRenderer} from '@/museum-v78/lib/house-room-scene';

type Renderer=ReturnType<typeof createHouseRoomRenderer>;
type Props={onOriginal?:(image:string)=>void;signedIn?:boolean;houseId:CityHouseId;disabled:boolean;onCategory:(category:string)=>void;onDestination?:(destination:MuseumDestination)=>void;onDesign?:(category:string)=>void;onExit:()=>void;memory?:MutableRefObject<HouseRoomSnapshot|null>};
export function HouseShowroom({onOriginal,signedIn=false,houseId,disabled,onCategory,onDestination,onDesign,onExit,memory}:Props){
 const house=cityHouses.find(h=>h.id===houseId)!,slots=houseRoomSlots(houseId),initial=boundedRoomSnapshot(houseId,memory?.current);
 const [mode,setMode]=useState<'reference'|'spatial'>('reference'),[selected,setSelected]=useState(initial.selected??0),[status,setStatus]=useState<'loading'|'ready'|'unavailable'>('loading'),[attempt,setAttempt]=useState(0),[imageFailed]=useState(false),[ownerBrowser,setOwnerBrowser]=useState(false);
 const canvas=useRef<HTMLCanvasElement>(null),container=useRef<HTMLElement>(null),renderer=useRef<Renderer|null>(null),markerButtons=useRef(new Map<number,HTMLButtonElement>()),invalidate=useRef(()=>{}),blocked=useRef(disabled),snapshot=useRef(initial),drag=useRef<{id:number;x:number;moved:boolean}|null>(null);
 blocked.current=disabled;
 function retain(){const value=renderer.current?.snapshot()??snapshot.current;snapshot.current=value;if(memory)memory.current=value;}
 useEffect(()=>{
  if(mode!=='spatial'||!canvas.current)return;let live=true,last=0,seen=true;const element=canvas.current,media=window.matchMedia('(prefers-reduced-motion: reduce)');setStatus('loading');
  const loop=createMuseumFrameLoop(time=>{if(!live||!renderer.current||document.hidden||!seen)return false;const dt=last?Math.min(.05,(time-last)/1000):0;last=time;
   try{const moving=renderer.current.render(dt,media.matches);for(const marker of renderer.current.markers()){const button=markerButtons.current.get(marker.index);if(button){button.hidden=!marker.visible;button.style.left=marker.x+'%';button.style.top=marker.y+'%';}}setStatus('ready');return moving;}
   catch{setStatus('unavailable');return false;}
  });invalidate.current=loop.invalidate;
  const resize=new ResizeObserver(loop.invalidate);resize.observe(element);
  const observer=typeof IntersectionObserver==='undefined'?null:new IntersectionObserver(entries=>{seen=entries[0]?.isIntersecting??true;if(seen){last=0;loop.invalidate();}});observer?.observe(element);
  const visibility=()=>{last=0;loop.invalidate();};document.addEventListener('visibilitychange',visibility);media.addEventListener('change',visibility);
  const lose=(event:Event)=>{event.preventDefault();retain();setStatus('unavailable');};element.addEventListener('webglcontextlost',lose);
  void import('@/museum-v78/lib/house-room-scene').then(runtime=>{if(!live)return;renderer.current=runtime.createHouseRoomRenderer(element,houseId,snapshot.current);loop.invalidate();}).catch(()=>{if(live)setStatus('unavailable');});
  return()=>{live=false;retain();loop.dispose();resize.disconnect();observer?.disconnect();document.removeEventListener('visibilitychange',visibility);media.removeEventListener('change',visibility);element.removeEventListener('webglcontextlost',lose);renderer.current?.dispose();renderer.current=null;invalidate.current=()=>{};};
 },[mode,houseId,attempt]);
 useEffect(()=>{if(status==='ready')invalidate.current();},[status]);
 function focus(index:number){if(disabled)return;const next=roomSlotIndex(index,0,slots.length);setSelected(next);renderer.current?.focus(next);snapshot.current={...snapshot.current,selected:next};retain();invalidate.current();}
 function overview(){if(disabled)return;renderer.current?.focus(null);snapshot.current={...snapshot.current,selected:null};retain();invalidate.current();}
 function visit(index:number){if(disabled)return;focus(index);onCategory(slots[index].category);}
 async function fullscreen(){const element=container.current;if(document.fullscreenElement){await document.exitFullscreen().catch(()=>{});return;}await element?.requestFullscreen?.().catch(()=>{});}
 return <section ref={container} className="house-showroom" data-house-id={houseId} data-presentation={mode==='reference'?'APPROVED_INTERIOR_PHOTOGRAPH':status==='ready'?'THREE_JS_ARCHITECTURE':'ARCHITECTURAL_FALLBACK'} lang="en" aria-label={house.title+' interior and showcases'}>
  <header className="house-showroom-heading"><div><CompanyMark decorative/><span><small>INSIDE THE GRAND LIVING MUSEUM</small><h2>{house.title}</h2></span></div><button disabled={disabled} className="text-link" onClick={()=>{retain();onExit();}}><ArrowLeft size={16}/>Grand Museum</button></header>
  <div className="house-room-stage">
   {mode==='reference'?<HouseVisualSequence houseId={houseId} disabled={disabled}/>:<>
    <div className="house-room-architectural-fallback" hidden={status==='ready'} aria-hidden="true"><div className="house-room-ceiling"/><div className="house-room-floor"/><div className="house-room-backwall"/>{slots.map((slot,index)=><div className="house-glass-vitrine" key={slot.key} style={{left:(8+index%4*23.5)+'%',bottom:(index<4?22:index<8?43:61)+'%',transform:'scale('+(index<4?1:index<8?.77:.6)+')'}}><i/><span/><b/></div>)}</div>
    <canvas ref={canvas} className={status==='ready'?'house-room-canvas ready':'house-room-canvas'} tabIndex={0} aria-label="House 3D interior. Left and right select a showcase; up approaches; down returns to the room view; Enter opens the category." onKeyDown={event=>{if(disabled)return;if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();focus(roomSlotIndex(selected,event.key==='ArrowRight'?1:-1,slots.length));}else if(event.key==='ArrowUp'){event.preventDefault();focus(selected);}else if(event.key==='ArrowDown'||event.key==='Escape'){event.preventDefault();overview();}else if(event.key==='Enter'){event.preventDefault();visit(selected);}}} onPointerDown={event=>{if(disabled||event.button!==0)return;drag.current={id:event.pointerId,x:event.clientX,moved:false};event.currentTarget.setPointerCapture(event.pointerId);}} onPointerMove={event=>{const d=drag.current;if(!d||d.id!==event.pointerId||disabled)return;const dx=event.clientX-d.x;if(Math.abs(dx)>3)d.moved=true;if(d.moved){renderer.current?.orbit(dx*.007);d.x=event.clientX;retain();invalidate.current();}}} onPointerUp={event=>{const d=drag.current;drag.current=null;if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);if(!disabled&&d&&!d.moved){const box=event.currentTarget.getBoundingClientRect(),hit=renderer.current?.pick((event.clientX-box.left)/box.width,(event.clientY-box.top)/box.height);if(hit!==null&&hit!==undefined)visit(hit);}}} onPointerCancel={()=>{drag.current=null;}} onLostPointerCapture={()=>{drag.current=null;}}/>
    {status==='ready'&&<nav className="house-room-spatial-markers" aria-label="Showcase locations">{slots.map(slot=><button hidden key={slot.key} ref={element=>{if(element)markerButtons.current.set(slot.index,element);else markerButtons.current.delete(slot.index);}} disabled={disabled} onClick={()=>visit(slot.index)}><span>{slot.label}</span><ArrowDown size={13}/></button>)}</nav>}
    <div className="house-room-identity"><CompanyMark decorative/><span>{house.title}</span></div>
   </>}
   {mode==='spatial'&&<div className="house-room-welcome"><span className="eyebrow">{slots.length} CATEGORY SHOWCASES</span><h3>Your collection<br/><i>starts inside.</i></h3><p>Select a showcase to explore its public CORE collections or prepare your own design.</p></div>}
   <div className="house-room-selected"><span>CATEGORY SHOWCASE</span><strong>{slots[selected].label}</strong><button disabled={disabled} onClick={()=>visit(selected)}>OPEN SHOWCASE<ArrowRight size={16}/></button>{onDesign&&<button disabled={disabled} onClick={()=>{retain();onDesign(slots[selected].category);}}>DESIGN THIS CATEGORY<ArrowRight size={16}/></button>}</div>
   <div className="house-room-view-tools"><button aria-pressed={mode==='reference'} disabled={disabled} onClick={()=>setMode('reference')}>Approved photo sequence</button><button aria-pressed={mode==='spatial'} disabled={disabled} onClick={()=>setMode('spatial')}><Layers3 size={15}/>3D room</button><button disabled={disabled} aria-label="Open owner Brand House browser" onClick={()=>setOwnerBrowser(value=>!value)}><Building2 size={15}/>Owner browser</button><button disabled={disabled} aria-label="Fullscreen House interior" onClick={()=>void fullscreen()}><Expand size={16}/></button></div>
  </div>
  <ContextPhotoSequence context="house" houseId={houseId} disabled={disabled} onOriginal={onOriginal}/>
  {houseId==='fashion'&&onDestination&&<FashionMuseum disabled={disabled} onDestination={destination=>{retain();onDestination(destination);}}/>}
  <nav className="house-showcase-wayfinding" aria-label={house.title+' category showcases'}>{slots.map(slot=><button key={slot.key} disabled={disabled} aria-pressed={selected===slot.index} data-showcase-key={slot.key} onClick={()=>visit(slot.index)}><Building2 size={17}/><span>{slot.label}<small>OPEN CATEGORY VITRINE</small></span><ArrowRight size={15}/></button>)}</nav>
  <div className="house-room-movement" role="group" aria-label="Move between category showcases"><button disabled={disabled} aria-label="Previous showcase" onClick={()=>focus(roomSlotIndex(selected,-1,slots.length))}><ArrowLeft size={18}/></button><button disabled={disabled} aria-label="Approach selected showcase" onClick={()=>focus(selected)}><ArrowUp size={18}/></button><button disabled={disabled} aria-label="Return to House overview" onClick={overview}><ArrowDown size={18}/></button><button disabled={disabled} aria-label="Next showcase" onClick={()=>focus(roomSlotIndex(selected,1,slots.length))}><ArrowRight size={18}/></button><button disabled={disabled} onClick={overview}><RotateCcw size={15}/>Room overview</button><span>Architectural vitrines are category navigation. Products and generation require actual CORE records.</span></div>
  <AscensionExhibits houseId={houseId} signedIn={signedIn} disabled={disabled} onInspect={retain}/>
  {ownerBrowser&&<BrandHouseBrowser houseId={houseId} title={house.title}/>} 
  {(imageFailed||mode==='spatial'&&status==='unavailable')&&<p className="house-room-error" role="status">{imageFailed?'The approved image could not load. Category showcase controls remain available.':'WebGL is unavailable. The architectural fallback and every category showcase remain usable.'}{mode==='spatial'&&<button disabled={disabled} onClick={()=>setAttempt(v=>v+1)}>Retry 3D room</button>}</p>}
 </section>;
}
