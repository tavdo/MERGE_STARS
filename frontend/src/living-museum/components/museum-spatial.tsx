"use client";
import { museumFetch } from "@/living-museum/transport";
import { museumNavigation } from '../navigation';
import {useEffect,useRef,useState} from 'react';
import {ArrowUp,ArrowLeft,ArrowRight,Map,Move,RotateCcw,RotateCw,Play,Pause,Box,Minus,Expand,Minimize,ImageIcon,Plus,Info,X,Compass,Search,PanelRightOpen,Palette,Gem,Watch,Glasses,Shirt,ShoppingBag,Car,Music,Armchair,Building2,Monitor,Footprints,NotebookPen,Sparkles,Lightbulb,Grid2X2,Bike,Disc3,type LucideIcon} from 'lucide-react';
import {createMuseumThreeRenderer,type MuseumThreeRenderer} from '@/living-museum/lib/museum-three';
import {coreVitrineSlots,coreExhibitReference,readMuseumLayout,placementCamera,MUSEUM_LAYOUT_KEY,type CoreExhibitReference,type VitrineSlotId,type VitrineRequest} from '@/living-museum/lib/museum-vitrine';
import type {CoreCollectionDetail} from '@/living-museum/lib/core-contract';
import {loadCoreGLB} from '@/living-museum/lib/core-gltf';
import {CORE_MODEL_TIMEOUT_MS} from '@/living-museum/lib/core-model-limits';
import {interiorReference,museumLensShift,museumLensLift,museumPresentationFov,museumMoveDuration} from '@/living-museum/lib/museum-interior';
import {spatialNodes,spatialExhibits,enterSpatialMuseum,nodeById,exhibitById,walkSpatial,closeSpatial,approachSpatial,stepBackSpatial,routeSpatial,projectSpatial,lookSpatial,interpolateCamera,type SpatialJourney,type SpatialCamera,type SpatialNodeId} from '@/living-museum/lib/museum-spatial';
import type {MuseumPointId,MuseumView} from '@/living-museum/lib/museum-tour';
import {createMuseumFrameLoop} from '@/living-museum/lib/museum-frame-loop';

type Projected={id:string;type:'arrow'|'exhibit'|'vitrine';x:number;y:number;depth:number;angle?:number};
const categoryIcons:Partial<Record<MuseumPointId,LucideIcon>>={art:Palette,jewelry:Gem,watches:Watch,eyewear:Glasses,fashion:Shirt,bags:ShoppingBag,automotive:Car,motorcycles:Bike,music:Music,furniture:Armchair,architecture:Building2,technology:Monitor,shoes:Footprints,stationery:NotebookPen,collectibles:Sparkles,decor:Lightbulb,mosaic:Grid2X2,case:Disc3};
type Props={view:MuseumView;disabled:boolean;blocked:boolean;vitrineRequest:VitrineRequest|null;onPoint:(id:MuseumPointId)=>void;onExhibit:(reference:string)=>void;onCreate:(reference:string)=>void;onInspect:()=>void;onOriginal:(image:string)=>void;onDetail:(id:MuseumPointId)=>void;onCoreVitrine:()=>void;personalReferences?:CoreExhibitReference[]};
type VitrineEntry={reference:CoreExhibitReference;state:'AVAILABLE'|'LOADING'|'READY'|'UNAVAILABLE';percent:number;error?:string};
export function SpatialMuseum({view,disabled,blocked,vitrineRequest,onPoint,onExhibit,onCreate,onInspect,onOriginal,onDetail,onCoreVitrine,personalReferences}:Props){
 const root=useRef<HTMLElement>(null),canvas=useRef<HTMLCanvasElement>(null),renderer=useRef<MuseumThreeRenderer|null>(null),life=useRef(0);
 const journey=useRef<SpatialJourney>(personalReferences ? enterSpatialMuseum() : museumNavigation.spatial ?? enterSpatialMuseum()),displayCamera=useRef<SpatialCamera>(journey.current.camera);
 useEffect(()=>()=>{if(!personalReferences)museumNavigation.spatial=structuredClone({...journey.current,camera:coreFocus.current?.returnCamera??displayCamera.current});},[]);
 const tween=useRef<{from:SpatialCamera;to:SpatialCamera;start:number;duration:number;resolve:()=>void}|null>(null),busy=useRef(false),lastPoint=useRef(view.point_id);
 const callbacks=useRef({onPoint,onExhibit,onCreate,onInspect,onOriginal,disabled,blocked});callbacks.current={onPoint,onExhibit,onCreate,onInspect,onOriginal,disabled,blocked};
 const [current,setCurrent]=useState(journey.current),[moving,setMoving]=useState(false),[ready,setReady]=useState(false),[error,setError]=useState(''),[assetError,setAssetError]=useState('');
 const [projected,setProjected]=useState<Projected[]>([]),[mapOpen,setMapOpen]=useState(false),[fullscreen,setFullscreen]=useState(false),[directoryOpen,setDirectoryOpen]=useState(false),[hovered,setHovered]=useState<MuseumPointId|null>(null);
 const drag=useRef<{id:number;x:number;y:number;camera:SpatialCamera;moved:boolean;objectAngle?:number}|null>(null);
 const invalidate=useRef(()=>{});
 const [search,setSearch]=useState('');
 const [vitrines,setVitrines]=useState<Record<string,VitrineEntry>>({}),[coreSelected,setCoreSelected]=useState<VitrineSlotId|null>(null),[vitrineMenu,setVitrineMenu]=useState(false),[spinning,setSpinning]=useState(false);
 const entries=useRef<Record<string,VitrineEntry>>({}),coreFocus=useRef<{slot:VitrineSlotId;returnCamera:SpatialCamera;angle:number;zoom:number}|null>(null),spin=useRef(false),modelLoad=useRef<AbortController|null>(null),handledRequest=useRef<number|null>(null);
 function updateVitrines(next:Record<string,VitrineEntry>,save=false){entries.current=next;setVitrines(next);if(save&&!personalReferences)try{localStorage.setItem(MUSEUM_LAYOUT_KEY,JSON.stringify(Object.entries(next).map(([slot,{reference}])=>({slot,itemId:reference.itemId,collectionSlug:reference.collectionSlug}))));}catch{setAssetError('ვიტრინის განლაგება ამ ბრაუზერში ვერ შეინახა.');}invalidate.current();}
 function stopSpin(){spin.current=false;setSpinning(false);}
 function cancelVitrine(){modelLoad.current?.abort();modelLoad.current=null;const next={...entries.current};for(const id of Object.keys(next))if(next[id].state==='LOADING')next[id]={...next[id],state:'AVAILABLE',percent:0};updateVitrines(next);}
 async function closeCore(){const previous=coreFocus.current;if(!previous)return;stopSpin();coreFocus.current=null;setCoreSelected(null);await animate(previous.returnCamera);displayCamera.current=previous.returnCamera;}
 async function loadVitrine(slot:VitrineSlotId){
  const entry=entries.current[slot];if(!entry||renderer.current?.hasModel(slot))return;
  modelLoad.current?.abort();const controller=new AbortController();modelLoad.current=controller;const epoch=life.current,timer=setTimeout(()=>controller.abort(),CORE_MODEL_TIMEOUT_MS);
  const evictedBefore=renderer.current?.prepareModelSlot(slot)??[];const prepared={...entries.current};for(const id of evictedBefore)if(prepared[id])prepared[id]={...prepared[id],state:'AVAILABLE',percent:0};entries.current=prepared;
  updateVitrines(Object.fromEntries(Object.entries(entries.current).map(([id,row])=>[id,id===slot?{...row,state:'LOADING',percent:0,error:undefined}:row.state==='LOADING'?{...row,state:'AVAILABLE',percent:0}:row])));
  try{const bytes=await loadCoreGLB(entry.reference.modelURL,controller.signal,museumFetch,percent=>{if(modelLoad.current===controller&&life.current===epoch)updateVitrines({...entries.current,[slot]:{...entries.current[slot],percent}});});
   if(modelLoad.current!==controller||epoch!==life.current||!renderer.current)return;const evicted=await renderer.current.placeModel(slot,bytes,controller.signal);
   if(modelLoad.current!==controller||controller.signal.aborted||epoch!==life.current)return;
   const next={...entries.current,[slot]:{...entries.current[slot],state:'READY' as const,percent:100}};for(const id of evicted)if(next[id])next[id]={...next[id],state:'AVAILABLE',percent:0};updateVitrines(next);invalidate.current();
  }catch(error){if(modelLoad.current!==controller||epoch!==life.current)return;const code=error instanceof Error?error.message:'';updateVitrines({...entries.current,[slot]:{...entries.current[slot],state:'UNAVAILABLE',percent:0,error:code==='MODEL_DECODER_REQUIRED'?'მოდელს მხარდაჭერილი დეკოდერი სჭირდება.':controller.signal.aborted?'ჩატვირთვის დრო ამოიწურა. ხელახლა სცადე.':'CORE-ის 3D ფაილი ვერ ჩაიტვირთა. READY არ დადასტურებულა.'}});}
  finally{clearTimeout(timer);if(modelLoad.current===controller)modelLoad.current=null;}
 }
 function focusCore(slot:VitrineSlotId){void run(async()=>{
  if(coreFocus.current)await closeCore();
  const snapshot={...displayCamera.current,position:[...displayCamera.current.position] as SpatialCamera['position']};coreFocus.current={slot,returnCamera:snapshot,angle:0,zoom:1};setCoreSelected(slot);setVitrineMenu(false);await animate(placementCamera(slot));void loadVitrine(slot);
 });}
 function rotateCore(amount:number){const focus=coreFocus.current;if(!focus)return;stopSpin();focus.angle+=amount;renderer.current?.rotateModel(focus.slot,focus.angle);}
 function zoomCore(delta:number){const focus=coreFocus.current;if(!focus)return;focus.zoom=Math.max(.65,Math.min(1.6,focus.zoom+delta));const target=placementCamera(focus.slot),at=coreVitrineSlots.find(slot=>slot.id===focus.slot)!;displayCamera.current={...target,position:[at.position[0],target.position[1],at.position[2]+3.35*focus.zoom],fov:target.fov,displayBounds:[2.25,2.25]};invalidate.current();}
 const report=(id:MuseumPointId)=>{lastPoint.current=id;callbacks.current.onPoint(id);};
 function commit(next:SpatialJourney){journey.current=next;setCurrent(next);invalidate.current();}
 function animate(to:SpatialCamera):Promise<void>{
  return new Promise((resolve,reject)=>{
   if(!renderer.current){reject(Error('Scene closed'));return;}
   if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){displayCamera.current=to;invalidate.current();resolve();return;}
   const from=displayCamera.current,distance=Math.hypot(...from.position.map((v,i)=>to.position[i]-v));
   tween.current={from,to,start:performance.now(),duration:museumMoveDuration(distance),resolve};
   invalidate.current();
  });
 }
 async function run(action:()=>Promise<void>){
  if(busy.current||callbacks.current.disabled||callbacks.current.blocked||!renderer.current?.interiorReady())return;
  busy.current=true;setMoving(true);setMapOpen(false);setDirectoryOpen(false);setVitrineMenu(false);setHovered(null);const epoch=life.current;
  try{await action();}catch{if(epoch===life.current)setAssetError('გადაადგილება ვერ დასრულდა. ხელახლა აირჩიე მარშრუტი.');}
  finally{if(epoch===life.current){busy.current=false;setMoving(false);if(!callbacks.current.blocked)root.current?.focus({preventScroll:true});}}
 }
 async function walk(to:SpatialNodeId){const next=walkSpatial(journey.current,to);await animate(next.camera);commit(next);report('overview');}
 function navigate(to:SpatialNodeId){void run(async()=>{
  if(coreFocus.current)await closeCore();
  if(journey.current.selected){const closed=closeSpatial(journey.current);await animate(closed.camera);commit(closed);report('overview');}
  const route=routeSpatial(journey.current.node,to);for(const n of route)await walk(n);
  if(!route.length&&to==='entry'){const camera={position:[...nodeById('entry').camera_position] as SpatialCamera['position'],yaw:0,pitch:-.07,fov:65};await animate(camera);commit({...journey.current,camera});}
 });}
 function choose(id:MuseumPointId){void run(async()=>{
  if(coreFocus.current)await closeCore();
  if(journey.current.selected){const closed=closeSpatial(journey.current);await animate(closed.camera);commit(closed);}
  const exhibit=exhibitById(id);for(const node of routeSpatial(journey.current.node,exhibit.node))await walk(node);
  const next=approachSpatial(journey.current,id);await animate(next.camera);commit(next);report(id);
 });}
 function close(){void run(async()=>{if(coreFocus.current){await closeCore();return;}const next=closeSpatial(journey.current);await animate(next.camera);commit(next);report('overview');});}
 function back(){void run(async()=>{
  if(coreFocus.current){await closeCore();return;}
  if(journey.current.selected){const next=closeSpatial(journey.current);await animate(next.camera);commit(next);report('overview');return;}
  if(journey.current.back.length){const next=stepBackSpatial(journey.current);await animate(next.camera);commit(next);report('overview');}
 });}
 function turn(amount:number){void run(async()=>{if(journey.current.selected||coreFocus.current)return;const camera={...journey.current.camera,yaw:journey.current.camera.yaw+amount};await animate(camera);commit({...journey.current,camera});});}
 async function external(action:()=>void){if(document.fullscreenElement===root.current)try{await document.exitFullscreen();}catch{}action();}
 async function toggleFullscreen(){try{if(document.fullscreenElement===root.current)await document.exitFullscreen();else if(root.current?.requestFullscreen)await root.current.requestFullscreen();else setAssetError('სრული ეკრანი ამ მოწყობილობაზე მიუწვდომელია.');}catch{setAssetError('სრული ეკრანი ამ მოწყობილობაზე მიუწვდომელია.');}}
 useEffect(()=>{
  const el=canvas.current;if(!el)return;const epoch=++life.current;let last=-Infinity,visible=true,announced=false;
  try{renderer.current=createMuseumThreeRenderer(el,message=>{setAssetError(message);if(!renderer.current?.interiorReady())setError('დამტკიცებული ინტერიერი ვერ ჩაიტვირთა. განაახლე გვერდი.');},()=>invalidate.current());setReady(false);setError('');}
  catch{setError('Three.js-ის სივრცითი ხედვა ამ მოწყობილობაზე მიუწვდომელია. საჭიროა WebGL 2-ის მხარდაჭერა.');setReady(false);return;}
  const observer=typeof IntersectionObserver==='undefined'?null:new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??true;if(visible)invalidate.current();},{rootMargin:'160px'});observer?.observe(el);
  const lost=(e:Event)=>{e.preventDefault();stopSpin();modelLoad.current?.abort();setReady(false);setError('სივრცითი გრაფიკის კავშირი შეწყდა. განაახლე გვერდი.');};el.addEventListener('webglcontextlost',lost);
  const full=()=>setFullscreen(document.fullscreenElement===root.current);document.addEventListener('fullscreenchange',full);
  const frame=(now:number)=>{
   if(epoch!==life.current||document.hidden||!visible||callbacks.current.blocked)return false;
   if(now-last<32)return true;last=now;
   if(!announced&&renderer.current?.interiorReady()){announced=true;setReady(true);setError('');}
   const move=tween.current;if(move){const t=(now-move.start)/move.duration;displayCamera.current=interpolateCamera(move.from,move.to,t);if(t>=1){displayCamera.current=move.to;tween.current=null;move.resolve();}}
   const c=displayCamera.current,j=journey.current;if(coreFocus.current&&spin.current){coreFocus.current.angle+=.013;renderer.current?.rotateModel(coreFocus.current.slot,coreFocus.current.angle);}try{renderer.current?.render(c,j.node,j.selected??undefined);}catch{stopSpin();setReady(false);setError('Three.js-ის გრაფიკა ამ მოწყობილობაზე ვერ გაიშვა. ნახე ორიგინალი ინტერიერი.');return false;}
   {
    const aspect=Math.max(.1,el.clientWidth/Math.max(1,el.clientHeight)),focus=c.focus??(c.framing==='OBJECT'),shift=museumLensShift(focus,el.clientWidth),lift=museumLensLift(focus,el.clientWidth),projectionCamera={...c,fov:museumPresentationFov(c.fov,focus,el.clientWidth,el.clientHeight,c.displayBounds)},items:Projected[]=[];
    if(!j.selected&&!coreFocus.current){
     const origin=nodeById(j.node);for(const id of origin.connected_nodes){const dest=nodeById(id),dx=dest.scene_position[0]-origin.scene_position[0],dz=dest.scene_position[2]-origin.scene_position[2],d=Math.hypot(dx,dz);const p=projectSpatial([origin.scene_position[0]+dx/d*3.8,.09,origin.scene_position[2]+dz/d*3.8],projectionCamera,aspect,shift,lift);if(p)items.push({id,type:'arrow',...p,angle:Math.atan2(dx,-dz)-c.yaw});}
     for(const e of spatialExhibits){const distance=Math.hypot(e.position[0]-c.position[0],e.position[2]-c.position[2]);if(distance>15)continue;const p=projectSpatial([e.position[0],.55,e.position[2]],projectionCamera,aspect,shift,lift);if(p)items.push({id:e.id,type:'exhibit',...p});}
     for(const slot of coreVitrineSlots){const p=projectSpatial(slot.position,projectionCamera,aspect,shift,lift);if(p)items.push({id:slot.id,type:'vitrine',...p});}
    }
    setProjected(items);
   }
   return !!tween.current||spin.current;
  };
  const loop=createMuseumFrameLoop(frame);invalidate.current=loop.invalidate;
  const resize=new ResizeObserver(loop.invalidate);resize.observe(el);
  document.addEventListener('visibilitychange',loop.invalidate);loop.invalidate();
  return()=>{++life.current;modelLoad.current?.abort();loop.dispose();resize.disconnect();observer?.disconnect();document.removeEventListener('visibilitychange',loop.invalidate);el.removeEventListener('webglcontextlost',lost);document.removeEventListener('fullscreenchange',full);renderer.current?.dispose();renderer.current=null;tween.current?.resolve();tween.current=null;busy.current=false;invalidate.current=()=>{};};
 },[]);
 useEffect(()=>{if(!ready||personalReferences)return;const controller=new AbortController();let rows:ReturnType<typeof readMuseumLayout>=[];try{rows=readMuseumLayout(localStorage.getItem(MUSEUM_LAYOUT_KEY));}catch{}if(!rows.length)return;
  void(async()=>{for(const slug of [...new Set(rows.map(row=>row.collectionSlug))])try{const response=await museumFetch(`/api/core/collection?slug=${encodeURIComponent(slug)}`,{signal:controller.signal,cache:'no-store'});if(!response.ok)throw Error('CORE_UNAVAILABLE');const data=await response.json() as CoreCollectionDetail;if(controller.signal.aborted)return;const next={...entries.current};for(const row of rows.filter(row=>row.collectionSlug===slug)){if(next[row.slot])continue;const item=data.items.find(item=>item.id===row.itemId);if(item)next[row.slot]={reference:coreExhibitReference(item,data),state:'AVAILABLE',percent:0};}updateVitrines(next);}catch{if(!controller.signal.aborted)setAssetError('შენახული ვიტრინის CORE წყარო დროებით მიუწვდომელია. სცადე კოლექციის განახლება.');}})();return()=>controller.abort();
 },[ready,personalReferences]);
 useEffect(()=>{if(!ready||!personalReferences)return;
  modelLoad.current?.abort();stopSpin();if(coreFocus.current)displayCamera.current=coreFocus.current.returnCamera;coreFocus.current=null;setCoreSelected(null);
  for(const slot of coreVitrineSlots)renderer.current?.clearModel(slot.id);
  updateVitrines(Object.fromEntries(personalReferences.slice(0,coreVitrineSlots.length).map((reference,index)=>[coreVitrineSlots[index].id,{reference,state:'AVAILABLE',percent:0}])));
 },[ready,personalReferences]);
 useEffect(()=>{if(!ready||!vitrineRequest||handledRequest.current===vitrineRequest.serial||disabled||blocked||busy.current)return;handledRequest.current=vitrineRequest.serial;const slot=coreVitrineSlots.find(slot=>!entries.current[slot.id])?.id??coreSelected??coreVitrineSlots[0].id;renderer.current?.clearModel(slot);updateVitrines({...entries.current,[slot]:{reference:vitrineRequest.reference,state:'AVAILABLE',percent:0}},true);focusCore(slot);},[ready,vitrineRequest,disabled,blocked,moving]);
 useEffect(()=>{invalidate.current();},[blocked]);
 useEffect(()=>{if(!ready||lastPoint.current===view.point_id)return;lastPoint.current=view.point_id;if(view.point_id==='overview')navigate('entry');else if(spatialExhibits.some(e=>e.id===view.point_id))choose(view.point_id);},[view.point_id,ready]);
 const selected=current.selected?exhibitById(current.selected):null,locked=disabled||blocked||moving||!ready;
 const selectedConcept=!!selected&&!!renderer.current?.hasConcept?.(selected.id);
 const node=nodeById(current.node),direction=(to:SpatialNodeId)=>{const target=nodeById(to);return Math.atan2(target.scene_position[0]-node.scene_position[0],-(target.scene_position[2]-node.scene_position[2]))-displayCamera.current.yaw;};
 function keyDirection(key:string){const desired=key==='ArrowUp'||key==='w'?0:key==='ArrowRight'||key==='d'?Math.PI/2:key==='ArrowLeft'||key==='a'?-Math.PI/2:Math.PI;const options=node.connected_nodes.map(id=>({id,angle:Math.abs(Math.atan2(Math.sin(direction(id)-desired),Math.cos(direction(id)-desired)))})).sort((a,b)=>a.angle-b.angle);if(options[0]?.angle<1.15)navigate(options[0].id);}
 return <section ref={root} className="spatial-museum" id="museum-space" aria-label="MERGE-ის უწყვეტი სივრცითი მუზეუმი" tabIndex={0} onKeyDown={e=>{
  if(locked||e.ctrlKey||e.altKey||e.metaKey||(e.target as HTMLElement).closest('button,input,select,textarea,summary,[role="button"]'))return;
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'].includes(e.key)){e.preventDefault();e.stopPropagation();if(coreSelected){if(e.key==='ArrowLeft')rotateCore(-Math.PI/8);if(e.key==='ArrowRight')rotateCore(Math.PI/8);}else if(!selected)keyDirection(e.key);}
  else if(coreSelected&&['+','=','-'].includes(e.key)){e.preventDefault();zoomCore(e.key==='-'?.12:-.12);}
  else if(e.key==='Escape'){e.preventDefault();if(mapOpen)setMapOpen(false);else if(directoryOpen)setDirectoryOpen(false);else if(selected||coreSelected)close();}
  else if(e.key==='Home'){e.preventDefault();navigate('entry');}
 }}>
  <div className={`spatial-viewport${hovered?' spatial-object-hover':''}`} data-spatial-node={current.node} data-selected-exhibit={current.selected??''} data-moving={moving} data-renderer="THREE_JS" data-core-vitrine={coreSelected??''} onPointerDown={e=>{
   if(locked||selected||e.button!==0||!e.isPrimary||(e.target as HTMLElement).closest('button,aside,nav'))return;
   root.current?.focus({preventScroll:true});drag.current={id:e.pointerId,x:e.clientX,y:e.clientY,camera:displayCamera.current,moved:false,objectAngle:coreFocus.current?.angle};e.currentTarget.setPointerCapture(e.pointerId);
  }} onPointerMove={e=>{
   if(locked||selected)return;const d=drag.current;
   if(d?.id===e.pointerId){if(Math.hypot(e.clientX-d.x,e.clientY-d.y)>6)d.moved=true;if(!d.moved)return;setHovered(null);if(coreFocus.current){stopSpin();coreFocus.current.angle=(d.objectAngle??0)+(e.clientX-d.x)*.008;renderer.current?.rotateModel(coreFocus.current.slot,coreFocus.current.angle);return;}const camera=lookSpatial(d.camera,e.clientX-d.x,e.clientY-d.y);displayCamera.current=camera;commit({...journey.current,camera});}
   else if(e.pointerType==='mouse'&&!coreSelected){const rect=e.currentTarget.getBoundingClientRect(),hit=renderer.current?.pick(displayCamera.current,(e.clientX-rect.left)/rect.width,(e.clientY-rect.top)/rect.height);setHovered(hit?.id??null);}
  }} onPointerUp={e=>{const d=drag.current;if(d?.id!==e.pointerId)return;drag.current=null;if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
   if(!d.moved&&!locked&&!selected&&!coreSelected){const rect=e.currentTarget.getBoundingClientRect(),x=(e.clientX-rect.left)/rect.width,y=(e.clientY-rect.top)/rect.height,coreHit=renderer.current?.pickCore(displayCamera.current,x,y),hit=renderer.current?.pick(displayCamera.current,x,y);if(coreHit){if(entries.current[coreHit])focusCore(coreHit);else void external(onCoreVitrine);}else if(hit)choose(hit.id);else{const next=renderer.current?.pickNavigation(displayCamera.current,x,y,journey.current.node);if(next)navigate(next);}}
  }} onPointerCancel={()=>{drag.current=null;setHovered(null);}} onPointerLeave={()=>{if(!drag.current)setHovered(null);}} onLostPointerCapture={()=>{drag.current=null;}}>
   <canvas ref={canvas} className="spatial-canvas" aria-label="სამგანზომილებიანი დარბაზი და CORE-ის რეალური 3D ვიტრინები" />
   <div className="spatial-vignette" aria-hidden="true"/>
   <header className="spatial-top"><div><span>LIVING MEGA MUSEUM</span><strong>{node.title}</strong></div><div className="spatial-top-actions"><button className="spatial-icon" aria-label="ჩემი 3D ვიტრინები" title="ჩემი 3D ვიტრინები" aria-expanded={vitrineMenu} disabled={locked} onClick={()=>setVitrineMenu(value=>!value)}><Box size={19}/></button><span className="spatial-chapter">{String(spatialNodes.findIndex(n=>n.id===current.node)+1).padStart(2,'0')} / {String(spatialNodes.length).padStart(2,'0')}</span><button className="spatial-icon" aria-label="ექსპონატების გზამკვლევი" title="ექსპონატების გზამკვლევი" aria-expanded={directoryOpen} disabled={locked||!!selected||!!coreSelected} onClick={()=>{setMapOpen(false);setDirectoryOpen(v=>!v);}}><PanelRightOpen size={18}/></button><button className="spatial-icon" aria-label="მუზეუმის რუკა" title="მუზეუმის რუკა" aria-expanded={mapOpen} onClick={()=>{setDirectoryOpen(false);setMapOpen(v=>!v);}}><Map size={18}/></button><button className="spatial-icon" aria-label={fullscreen?'სრული ეკრანის დახურვა':'მუზეუმის სრული ეკრანით გახსნა'} onClick={toggleFullscreen}>{fullscreen?<Minimize size={18}/>:<Expand size={18}/>}</button></div></header>
   {!error&&!ready&&<div className="spatial-loading" role="status"><span className="spatial-loading-ring" aria-hidden="true"/><span>MERGE ⭐ STARS</span><strong>შენი მუზეუმი იხსნება</strong></div>}
   {error&&<div className="spatial-error" role="alert"><p>{error}</p><button className="button outline" onClick={()=>void external(()=>onOriginal(interiorReference))}>დამტკიცებული ინტერიერის ნახვა</button></div>}
   {!locked&&projected.map(p=>p.type==='arrow'?<button key={'node'+p.id} className="spatial-floor-target" style={{left:p.x+'%',top:p.y+'%'}} aria-label={`${nodeById(p.id as SpatialNodeId).title} — კამერის გადაადგილება`} onClick={()=>navigate(p.id as SpatialNodeId)}><span style={{transform:`rotate(${(p.angle??0)*180/Math.PI}deg)`}}><ArrowUp size={21}/></span><small>{nodeById(p.id as SpatialNodeId).title}</small></button>:p.type==='vitrine'?<button key={p.id} className="spatial-exhibit-target spatial-core-target" style={{left:p.x+'%',top:p.y+'%'}} aria-label={vitrines[p.id]?.reference.title??'3D ვიტრინაში CORE მოდელის არჩევა'} onClick={()=>vitrines[p.id]?focusCore(p.id):void external(onCoreVitrine)}><i aria-hidden="true"/><span>{vitrines[p.id]?.reference.title??'3D VITRINE'}</span></button>:<button key={p.id} className="spatial-exhibit-target" style={{left:p.x+'%',top:p.y+'%'}} aria-label={`${exhibitById(p.id as MuseumPointId).title} — მიახლოება · ${renderer.current?.hasConcept(p.id) ? '3D CONCEPT' : 'VIEW ONLY'}`} onClick={()=>choose(p.id as MuseumPointId)}><i aria-hidden="true"/><span>{exhibitById(p.id as MuseumPointId).category}</span></button>)}
   {hovered&&!moving&&!selected&&<div className="spatial-hover-label" aria-hidden="true"><span>{exhibitById(hovered).category}</span><strong>{exhibitById(hovered).title}</strong><small>შეეხე ნივთს · მიახლოება</small></div>}
   {moving&&<span className="spatial-moving" role="status"><span aria-hidden="true"/>მუზეუმში მოძრაობა</span>}
   {directoryOpen&&!selected&&<nav className="spatial-directory" aria-label="ექსპონატის არჩევა და მუზეუმში მასთან გადაადგილება"><div><span>THE COLLECTION</span><button className="spatial-close" aria-label="გზამკვლევის დახურვა" onClick={()=>setDirectoryOpen(false)}><X size={16}/></button></div><p>აირჩიე ექსპონატი — კამერა მასთან მუზეუმის გზით მიგიყვანს.</p><label className="spatial-search"><Search size={16}/><input type="search" value={search} placeholder="ნივთი ან კატეგორია" aria-label="მუზეუმის ექსპონატების ძებნა" onChange={event=>setSearch(event.target.value)}/></label>{!spatialExhibits.some(e=>(e.title+" "+e.category).toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()))&&<p role="status">ექსპონატი ვერ მოიძებნა.</p>}{spatialExhibits.filter(e=>(e.title+" "+e.category).toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())).map((e,i)=>{const Icon=categoryIcons[e.id]??Sparkles;return <button key={e.id} disabled={locked} onClick={()=>choose(e.id)}><small>{String(i+1).padStart(2,'0')}</small><Icon size={18}/><span>{e.title}<em>{e.category}</em></span>{current.discovered.includes(e.id)&&<i aria-label="აღმოჩენილია"/>}</button>;})}</nav>}
   {mapOpen&&<aside className="spatial-map" aria-label="სივრცითი მუზეუმის რუკა"><div><strong>THE MUSEUM MAP</strong><button className="spatial-icon" aria-label="რუკის დახურვა" onClick={()=>setMapOpen(false)}><X size={16}/></button></div>
    <svg viewBox="0 0 280 280" aria-label="რუკაზე პოზიციის არჩევა"><g className="map-orbits" aria-hidden="true">{[40,80,118].map(r=><circle key={r} cx="140" cy="135" r={r}/>)}</g>
     {spatialNodes.flatMap(n=>n.connected_nodes.filter(id=>n.id<id).map(id=>{const to=nodeById(id);return <line key={n.id+id} x1={140+n.scene_position[0]*8} y1={125+n.scene_position[2]*8} x2={140+to.scene_position[0]*8} y2={125+to.scene_position[2]*8}/>;}))}
     {spatialExhibits.map(e=><circle key={e.id} cx={140+e.position[0]*8} cy={125+e.position[2]*8} r="2" className={current.discovered.includes(e.id)?'discovered':'unvisited'}/>)}
     {spatialNodes.map(n=><g key={n.id} role="button" tabIndex={locked?-1:0} aria-disabled={locked} aria-label={`${n.title}${n.id===current.node?' — მიმდინარე პოზიცია':''}`} onClick={()=>{if(!locked)navigate(n.id);}} onKeyDown={e=>{if(!locked&&(e.key==='Enter'||e.key===' ')){e.preventDefault();e.stopPropagation();navigate(n.id);}}}><circle className="map-hit" cx={140+n.scene_position[0]*8} cy={125+n.scene_position[2]*8} r="15"/><circle cx={140+n.scene_position[0]*8} cy={125+n.scene_position[2]*8} r={n.id===current.node?7:4} className={n.id===current.node?'current':current.visited.includes(n.id)?'visited':'unvisited'}/><title>{n.title}</title></g>)}
    </svg><p><span>{current.visited.length}/{spatialNodes.length} პოზიცია</span><span>{current.discovered.length}/{spatialExhibits.length} აღმოჩენა</span></p><small>რუკაზე აირჩიე მიმართულება. კოლექციის პროგრესი შენახულ CORE ვერსიებს დაეყრდნობა.</small>
   </aside>}
   {vitrineMenu&&!moving&&<aside className="spatial-vitrine-menu" aria-label="პირადი CORE ვიტრინები"><button className="spatial-close" aria-label="ვიტრინების არჩევის დახურვა" onClick={()=>setVitrineMenu(false)}><X size={16}/></button><span className="eyebrow">YOUR 3D COLLECTION</span><h3>შენი ვიტრინები</h3>{coreVitrineSlots.map((slot,i)=><button key={slot.id} className="vitrine-slot-choice" disabled={locked} onClick={()=>entries.current[slot.id]?focusCore(slot.id):void external(onCoreVitrine)}><Box size={18}/><span><strong>{vitrines[slot.id]?.reference.title??`ვიტრინა ${i+1}`}</strong><small>{vitrines[slot.id]?.state==='READY'?'3D READY · 360°':vitrines[slot.id]?'CORE ფაილი · შეეხე ჩასატვირთად':'აირჩიე CORE მოდელი'}</small></span><ArrowRight size={16}/></button>)}<button className="button light" disabled={locked} onClick={()=>void external(onCoreVitrine)}><Plus size={16}/>მზა CORE მოდელის არჩევა</button><p>განლაგება ამ ბრაუზერში ინახება. ყველა ნივთის წყარო CORE-ში რჩება.</p></aside>}
   {coreSelected&&!moving&&vitrines[coreSelected]&&<aside className="spatial-object-tools spatial-core-tools" aria-label="ვიტრინაში რეალური CORE მოდელის მართვა" data-core-model-state={vitrines[coreSelected].state}><button className="spatial-close" aria-label="3D ობიექტის დახურვა და ზუსტი პოზიციის აღდგენა" disabled={locked} onClick={close}><X size={18}/></button><span className="eyebrow">CORE EXHIBIT · {vitrines[coreSelected].reference.brandName??'MERGE STARS'}</span><h2>{vitrines[coreSelected].reference.title}</h2><span className="spatial-view-status"><span aria-hidden="true"/>{vitrines[coreSelected].state==='READY'?'3D READY · 360°':vitrines[coreSelected].state==='LOADING'?'3D LOADING':vitrines[coreSelected].state==='UNAVAILABLE'?'3D UNAVAILABLE':'CORE ფაილი ხელმისაწვდომია'}</span>
    {vitrines[coreSelected].state==='LOADING'&&<div className="spatial-core-loading" role="status"><p>{vitrines[coreSelected].percent<100?`ნამდვილი მოდელი იტვირთება · ${vitrines[coreSelected].percent}%`:'გეომეტრია და ტექსტურები მზადდება'}</p><progress value={vitrines[coreSelected].percent} max={100} aria-label="CORE მოდელის ჩატვირთვა"/><button className="text-link" onClick={cancelVitrine}>ჩატვირთვის შეჩერება</button></div>}
    {vitrines[coreSelected].state==='UNAVAILABLE'&&<><p role="alert">{vitrines[coreSelected].error}</p><button className="button outline" disabled={locked} onClick={()=>void loadVitrine(coreSelected)}>ხელახლა ჩატვირთვა</button></>}
    {vitrines[coreSelected].state==='AVAILABLE'&&<button className="button light" disabled={locked} onClick={()=>void loadVitrine(coreSelected)}><Box size={16}/>3D მოდელის ჩატვირთვა</button>}
    <p>შეხებით გადაატრიალე ნივთი. ორიგინალი გეომეტრია და ტექსტურები უცვლელია.</p>
    <nav className="spatial-core-controls" aria-label="რეალური 3D ობიექტის მართვა"><button aria-label="ობიექტის მარცხნივ ბრუნვა" disabled={locked||vitrines[coreSelected].state!=='READY'} onClick={()=>rotateCore(-Math.PI/8)}><RotateCcw size={18}/></button><button aria-label="ობიექტის მარჯვნივ ბრუნვა" disabled={locked||vitrines[coreSelected].state!=='READY'} onClick={()=>rotateCore(Math.PI/8)}><RotateCw size={18}/></button><button aria-label="3D დეტალის მოახლოება" disabled={locked||vitrines[coreSelected].state!=='READY'} onClick={()=>zoomCore(-.12)}><Plus size={18}/></button><button aria-label="3D ხედის დაშორება" disabled={locked||vitrines[coreSelected].state!=='READY'} onClick={()=>zoomCore(.12)}><Minus size={18}/></button><button aria-pressed={spinning} disabled={locked||vitrines[coreSelected].state!=='READY'} onClick={()=>{spin.current=!spin.current;setSpinning(spin.current);invalidate.current();}}>{spinning?<Pause size={16}/>:<Play size={16}/>}360°</button></nav>
    <dl className="spatial-facts"><div><dt>CORE catalog_item</dt><dd><code>{vitrines[coreSelected].reference.itemId}</code></dd></div><div><dt>კოლექცია</dt><dd>{vitrines[coreSelected].reference.collectionSlug}</dd></div><div><dt>მუზეუმის მასშტაბი</dt><dd>საჩვენებელი · ფიზიკური ზომისგან დამოუკიდებელი</dd></div></dl>
    <button className="button outline" disabled={locked} onClick={()=>void external(onCoreVitrine)}><Box size={16}/>სხვა CORE მოდელის არჩევა</button><button className="text-link" disabled={locked} onClick={()=>{const slot=coreSelected;void run(async()=>{await closeCore();renderer.current?.clearModel(slot);const next={...entries.current};delete next[slot];updateVitrines(next,true);});}}>პირადი ვიტრინიდან მოხსნა</button><button className="spatial-return" disabled={locked} onClick={close}><ArrowLeft size={16}/>იმავე პოზიციაზე დაბრუნება</button>
   </aside>}
   {selected&&!coreSelected&&!moving&&<aside className="spatial-object-tools" aria-label="არჩეული ექსპონატის ხელსაწყოები"><button className="spatial-close" aria-label="ექსპონატის დახურვა და ზუსტი პოზიციის აღდგენა" disabled={locked} onClick={close}><X size={18}/></button><span className="eyebrow">THE COLLECTION · {selected.category}</span><h2>{selected.title}</h2><span className="spatial-view-status"><span aria-hidden="true"/>{selectedConcept ? '3D CONCEPT · INTERPRETED' : 'VIEW ONLY'}</span><p>{selectedConcept ? 'საცდელი მოცულობითი მოდელი. უხილავი მხარეები ინტერპრეტირებულია; საწარმოო მზადყოფნა, წონა და ფასი არ არის დადასტურებული.' : 'სურათიანი ექსპონატი. სრული 360° ხედვა რეალურ 3D მოდელს ელოდება.'}</p>
    {selectedConcept&&<nav className="spatial-core-controls" aria-label="საცდელი 3D ექსპონატის ბრუნვა"><button title="მარცხნივ ბრუნვა" aria-label="საცდელი მოდელის მარცხნივ ბრუნვა" disabled={locked} onClick={()=>renderer.current?.rotateConcept(selected.id,-Math.PI/6)}><RotateCcw size={18}/></button><button title="მარჯვნივ ბრუნვა" aria-label="საცდელი მოდელის მარჯვნივ ბრუნვა" disabled={locked} onClick={()=>renderer.current?.rotateConcept(selected.id,Math.PI/6)}><RotateCw size={18}/></button></nav>}
    <dl className="spatial-facts"><div><dt>CORE წყარო</dt><dd>დაკავშირების მოლოდინში</dd></div><div><dt>საჩვენებელი მასშტაბი</dt><dd>{selectedConcept?'საჩვენებელი · არა ფიზიკური ზომა':'≈ 1 მ · მხოლოდ მუზეუმისთვის'}</dd></div></dl>
    <button className="button light" disabled={locked} onClick={()=>void external(()=>onDetail(selected.id))}><Expand size={16}/>დეტალების დათვალიერება</button>
    <button className="button outline" disabled={locked} onClick={()=>void external(onCoreVitrine)}><Gem size={16}/>ამ კატეგორიის ყველა ბრენდი</button>
    <button className="button outline" disabled={locked} onClick={()=>void external(onInspect)}><Info size={16}/>წყარო და ინფორმაცია</button>
    {selected.conceptReference?<><button className="button light" disabled={locked} onClick={()=>void external(()=>onCreate(selected.conceptReference!))}><Plus size={16}/>ჩემი ვერსიის მონახაზი</button><button className="text-link" disabled={locked} onClick={()=>void external(()=>onExhibit(selected.conceptReference!))}>არსებული ნიმუშის დატოვება<ArrowRight size={14}/></button></>:<button className="button outline" disabled={locked} onClick={()=>void external(onInspect)}><Plus size={16}/>CREATE MY VERSION</button>}
    <details className="spatial-availability"><summary>CORE კავშირის სტატუსი</summary><p>Fit მონაცემები საჭიროა. გაზომვადი გეომეტრია და გენერაცია მიუწვდომელია. წონის გამოთვლა მოლოდინშია; ფასი მიუწვდომელია. ავტორიზებული CORE კავშირი საჭიროა ახალი Version ID-ის შესაქმნელად.</p></details>
    <button className="spatial-return" disabled={locked} onClick={close}><ArrowLeft size={16}/>იგივე ადგილას დაბრუნება</button>
   </aside>}
   <footer className="spatial-bottom"><span className="spatial-guide"><Compass size={16}/><span>{selected||coreSelected?'შენი გზა აქ გრძელდება':'მიმოიხედე · აირჩიე გზა · შეეხე ნივთს'}</span></span><div className="spatial-look"><button className="spatial-icon" aria-label="ხედის მარცხნივ მობრუნება" title="ხედის მარცხნივ მობრუნება" disabled={locked||!!selected||!!coreSelected} onClick={()=>turn(-Math.PI/6)}><ArrowLeft size={17}/></button><span>LOOK AROUND</span><button className="spatial-icon" aria-label="ხედის მარჯვნივ მობრუნება" title="ხედის მარჯვნივ მობრუნება" disabled={locked||!!selected||!!coreSelected} onClick={()=>turn(Math.PI/6)}><ArrowRight size={17}/></button></div><div className="spatial-bottom-actions"><button className="spatial-icon" aria-label="წინა პოზიციაზე დაბრუნება" title="წინა პოზიციაზე დაბრუნება" disabled={locked||(!selected&&!coreSelected&&!current.back.length)} onClick={back}><ArrowLeft size={18}/></button><button className="spatial-icon" aria-label="მთავარ შესასვლელთან მარშრუტით დაბრუნება" title="მთავარ შესასვლელთან მარშრუტით დაბრუნება" disabled={locked} onClick={()=>navigate('entry')}><RotateCcw size={17}/></button><button className="spatial-icon" aria-label="დამტკიცებული ორიგინალი ინტერიერის ნახვა" title="დამტკიცებული ორიგინალი ინტერიერის ნახვა" disabled={locked} onClick={()=>void external(()=>onOriginal(interiorReference))}><ImageIcon size={17}/></button></div></footer>
  </div>
  <nav className="spatial-routes" aria-label="მიმდინარე პოზიციიდან ხელმისაწვდომი მარშრუტები"><span><Move size={15}/>აირჩიე გზა<small>↑ ← ↓ → ან WASD</small></span>{node.connected_nodes.map(id=><button key={id} disabled={locked||!!selected||!!coreSelected} onClick={()=>navigate(id)}><ArrowUp size={15} style={{transform:`rotate(${direction(id)*180/Math.PI}deg)`}}/>{nodeById(id).title}</button>)}</nav>
  {assetError&&<p className="spatial-asset-error" role="status">{assetError}</p>}
 </section>;
}
