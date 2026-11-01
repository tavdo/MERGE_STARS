"use client";
import {useEffect,useMemo,useRef,useState,type MutableRefObject} from 'react';
import {ArrowLeft,ArrowRight,Building2,Sparkles,Search,Upload,UserRound,MessageCircle} from 'lucide-react';
import {CoreCatalogBrowser,useCoreRead} from './core-context';
import {cityHouses,themeBuildings,type CityHouseId} from '@/museum-v78/lib/megapolis-domain';
import {houseCategoryLabel,houseTypes,fitCategoryForHouse,museumDestination,emptyMuseumDestination,type MuseumDestination} from '@/museum-v78/lib/house-experience';
import type {CoreCatalog} from '@/museum-v78/lib/core-contract';
import type {CoreExhibitReference} from '@/museum-v78/lib/museum-vitrine';
import type {FitCategory} from '@/museum-v78/lib/fit-measurements';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from './ui/dialog';
import {MuseumDesignStudio} from './museum-design-studio';
import {CoreCommunity} from './core-community';
import {FounderStoryboard,ContextPhotoSequence} from './photo-scenario';
import {ApprovedMuseumArtwork} from './approved-museum-artwork';
import {GrandMuseumPhotograph} from './grand-museum-photograph';
import {ApprovedMuseumPortal} from './approved-museum-portal';
import {AscensionExhibits} from './ascension-exhibits';
import {HouseShowroom} from './house-showroom';
import type {HouseRoomSnapshot} from '@/museum-v78/lib/house-room';
import {HouseStudyGallery} from './house-study-gallery';
import type {VisualStudy} from '@/museum-v78/lib/museum-studies';
import type {MuseumStudioMemory} from '@/museum-v78/lib/museum-studio-memory';

type Props={initialView?:'museum'|'labs';onStage?:(id:number)=>void;onOriginal?:(image:string)=>void;onWorld?:(tab:import('@/museum-v78/lib/unified-world').WorldTab)=>void;blocked:boolean;signedIn?:boolean;onCity:()=>void;onLegacy:()=>void;onCreate:()=>void;onPlace:(reference:CoreExhibitReference)=>void;onFit?:(category:FitCategory)=>void;memory?:MutableRefObject<MuseumDestination>;roomMemories?:MutableRefObject<Partial<Record<CityHouseId,HouseRoomSnapshot>>>;studioMemories?:MutableRefObject<Record<string,MuseumStudioMemory|undefined>>};
export function GrandAtrium({initialView='museum',onStage,onOriginal,onWorld,blocked,signedIn=false,onCity,onLegacy,onPlace,onFit,memory,roomMemories,studioMemories}:Props){
 const initial=museumDestination(memory?.current??emptyMuseumDestination);
 const [houseId,setHouseId]=useState<CityHouseId|null>(initial.houseId),[category,setCategory]=useState(initial.category),[query,setQuery]=useState(initial.query),[mode,setMode]=useState<MuseumDestination['mode']>(initial.mode),[brand,setBrand]=useState(''),[community,setCommunity]=useState(false),[failedImage,setFailedImage]=useState(false);
 const [showcaseOpen,setShowcaseOpen]=useState(!!initial.category);
 const [study,setStudy]=useState<VisualStudy|null>(null),[studioRevision,setStudioRevision]=useState(initial.mode==='browse'?0:1);
 const [arrivalView,setArrivalView]=useState<'museum'|'entrance'|'atrium'|'labs'>(initialView);
 const showcaseReturnFocus=useRef<HTMLElement|null>(null);
 const localRooms=useRef<Partial<Record<CityHouseId,HouseRoomSnapshot>>>({}),rooms=roomMemories??localRooms;
 const roomMemory=useMemo(()=>({get current(){return houseId?rooms.current[houseId]??null:null;},set current(value:HouseRoomSnapshot|null){if(value)rooms.current[value.houseId]=value;}}),[houseId,rooms]);
 const localStudios=useRef<Record<string,MuseumStudioMemory|undefined>>({}),studios=studioMemories??localStudios;
 const studioMemory=useMemo(()=>({get current(){return studios.current[houseId+':'+category]??null;},set current(value:MuseumStudioMemory|null){if(value)studios.current[value.house_id+':'+value.category]=value;else delete studios.current[houseId+':'+category];}}),[houseId,category,studios]);
 const catalogRead=useCoreRead<CoreCatalog>('/api/core/catalog');
 const {data}=catalogRead;
 const houses=useMemo(()=>themeBuildings(data?.collections??[]),[data]);
 const selected=houses.find(value=>value.houseId===houseId),theme=cityHouses.find(h=>h.id===houseId);
 const scoped=(data?.collections??[]).filter(c=>selected?.collectionSlugs.includes(c.slug));
 const brands=[...new Set(scoped.map(c=>c.brandLineId).filter((v):v is string=>!!v))];
 const collectionSlugs=scoped.filter(c=>!brand||c.brandLineId===brand).map(c=>c.slug);
 useEffect(()=>{if(memory)memory.current={houseId,category,query,mode};},[houseId,category,query,mode,memory]);
 function openHouse(next:CityHouseId){setHouseId(next);setCategory('');setQuery('');setBrand('');setMode('browse');setStudy(null);setStudioRevision(0);setCommunity(false);setShowcaseOpen(false);}
 function closeHouse(){setHouseId(null);setCommunity(false);setMode('browse');setShowcaseOpen(false);}
 function openDestination(value:MuseumDestination){if(blocked)return;const next=museumDestination(value);if(!next.houseId||!next.category)return;showcaseReturnFocus.current=null;setStudy(null);setStudioRevision(studios.current[next.houseId+':'+next.category]?1:0);setHouseId(next.houseId);setCategory(next.category);setQuery(next.query);setBrand('');setMode(next.mode);setCommunity(false);setShowcaseOpen(true);}
 function openCategory(value:string){if(!theme||blocked||!(theme.categories as readonly string[]).includes(value))return;if(!showcaseOpen)showcaseReturnFocus.current=typeof document!=='undefined'&&document.activeElement instanceof HTMLElement?document.activeElement:null;if(value!==category){setQuery('');setStudy(null);setStudioRevision(studios.current[houseId+':'+value]?1:0);}setCategory(value);setMode('browse');setCommunity(false);setShowcaseOpen(true);}
 function beginStudio(value:VisualStudy|null,importing=false,targetCategory=category){delete studios.current[houseId+':'+targetCategory];setStudy(value);setStudioRevision(v=>v+1);setMode(importing?'import':'create');}
 return <section className="grand-atrium grand-atrium-connected" aria-label="Grand Living Museum · 12 Brand Industries" lang="en">
  <header><div><span className="eyebrow">STEP 02 · GRAND LIVING MUSEUM</span><h2>One museum. Every creative world.</h2></div><button className="text-link" disabled={blocked} onClick={onCity}><ArrowLeft size={17}/>Return to Megapolis</button></header>
  <div hidden={!!selected} className="grand-museum-overview">
  <nav className="grand-arrival-views" aria-label="Museum spaces"><button type="button" disabled={blocked} aria-pressed={arrivalView==='museum'} onClick={()=>{setArrivalView('museum');setFailedImage(false);}}>Museum interior · 12 Houses</button><button type="button" disabled={blocked} aria-pressed={arrivalView==='labs'} onClick={()=>setArrivalView('labs')}>Studio / Lab · 19–24</button><details><summary>Other approved views</summary><button type="button" disabled={blocked} onClick={()=>{setArrivalView('entrance');setFailedImage(false);}}>Entrance interior</button><button type="button" disabled={blocked} onClick={()=>{setArrivalView('atrium');setFailedImage(false);}}>Grand Atrium reference</button></details></nav>
  {arrivalView==='labs'?onStage&&<FounderStoryboard group="atelier" disabled={blocked} onStage={onStage}/>:<div className={'grand-photo-experience'+(arrivalView==='museum'?' primary':'')}>
   {arrivalView==='museum'?<GrandMuseumPhotograph onError={()=>setFailedImage(true)}/>:<div className="grand-approved-scene" data-presentation="APPROVED_PHOTOGRAPH">
    {!failedImage&&(arrivalView==='entrance'?<ApprovedMuseumPortal onError={()=>setFailedImage(true)}/>:<ApprovedMuseumArtwork onError={()=>setFailedImage(true)}/>)}
   </div>}
   {failedImage&&<div className="grand-image-failure" role="alert">The approved image could not load. House navigation remains available.<button onClick={()=>setFailedImage(false)}>Retry image</button></div>}
   <nav className="grand-atrium-lines" aria-label="Choose one of the 12 House industries">{houses.map(item=><button key={item.key} disabled={blocked} aria-label={'Enter '+item.title} onClick={()=>openHouse(item.houseId!)}><Building2 size={16}/>{item.title}<span>DISCOVER · CREATE<ArrowRight size={13}/></span></button>)}</nav>
  </div>}
  <ContextPhotoSequence context="museum" disabled={blocked} onOriginal={onOriginal}/>
  <div className="grand-footer-actions"><button className="text-link" disabled={blocked} onClick={onLegacy}>Open existing spatial exhibits<ArrowRight size={16}/></button><span>Artwork is a spatial reference. Real 3D is shown only for available model assets.</span></div>
  {onWorld&&<details className="grand-spatial-study"><summary>Private spatial study · optional layout tools</summary><p>The existing Museum and My Museum remain your main experience. These optional architectural studies do not create a CORE House or public exhibit.</p><div><button disabled={blocked} onClick={()=>onWorld('atrium')} className="button outline">Open atrium study<ArrowRight size={16}/></button><button disabled={blocked} onClick={()=>onWorld('gallery')} className="button outline">Gallery layout</button><button disabled={blocked} onClick={()=>onWorld('house')} className="text-link">Edit House layout<ArrowRight size={15}/></button></div></details>}
  </div>
  {selected&&theme&&<HouseShowroom onOriginal={onOriginal} signedIn={signedIn} key={theme.id} houseId={theme.id} disabled={blocked||showcaseOpen} onCategory={openCategory} onDestination={openDestination} onDesign={value=>{openCategory(value);beginStudio(null,false,value);}} onExit={closeHouse} memory={roomMemory}/>}
  {selected&&theme&&showcaseOpen&&<Dialog open onOpenChange={open=>{if(!open)setShowcaseOpen(false);}}><DialogContent windowChrome="compact" visual={mode==='browse'?'house':'atelier'} className="megapolis-dialog grand-industry-dialog" onCloseAutoFocus={event=>{if(showcaseReturnFocus.current?.isConnected){event.preventDefault();showcaseReturnFocus.current.focus({preventScroll:true});}}}><DialogTitle>{selected.title} · {houseCategoryLabel(theme.id,category)}</DialogTitle><DialogDescription className="sr-only">Your selected House, category and filters stay with you. Public products are read from the existing MERGE CORE.</DialogDescription>
   <div hidden={mode==='browse'}>{category&&(studioRevision>0||mode!=='browse')&&<MuseumDesignStudio key={theme.id+':'+category+':'+studioRevision} houseId={theme.id} category={category} signedIn={signedIn} importMode={mode==='import'} initialVisual={study??undefined} memory={studioMemory} onBack={()=>setMode('browse')} onFit={value=>onFit?.(value)}/>}</div>{mode==='browse'&&<>
    <nav className="grand-breadcrumb" aria-label="Current location"><button onClick={closeHouse}>Grand Museum</button><span>/</span><button onClick={()=>setShowcaseOpen(false)}>Back to {selected.title} interior</button>{category&&<><span>/</span><strong>{houseCategoryLabel(theme.id,category)}</strong></>}</nav>
    <div className="grand-category-layout"><aside aria-label={selected.title+' categories'}>{theme.categories.map(value=><button key={value} aria-pressed={category===value} onClick={()=>openCategory(value)}>{houseCategoryLabel(theme.id,value)}<ArrowRight size={14}/></button>)}</aside><div>
     <h3 className="sr-only">{category?houseCategoryLabel(theme.id,category):'Choose a product category'}</h3>
     <div className="grand-industry-actions"><button className="button" disabled={!category} title={!category?'Choose a category first':undefined} onClick={()=>beginStudio(null)}><Sparkles size={16}/>Create new design</button><button className="button outline" disabled={!category} onClick={()=>beginStudio(null,true)}><Upload size={16}/>My existing 3D design</button>{studioMemory.current&&<button className="text-link" onClick={()=>{setStudioRevision(v=>Math.max(1,v));setMode('create');}}>Continue private draft</button>}{category&&fitCategoryForHouse(theme.id,category)!=='none'&&<button className="text-link" onClick={()=>onFit?.(fitCategoryForHouse(theme.id,category))}><UserRound size={16}/>Fit measurements</button>}<button className="text-link" aria-expanded={community} onClick={()=>setCommunity(v=>!v)}><MessageCircle size={16}/>{community?'View exhibits':'Community'}</button></div>
     {community?<CoreCommunity scope={{title:selected.title}}/>:category?<>
      <HouseStudyGallery key={theme.id+':'+category} houseId={theme.id} category={category} query={query} signedIn={signedIn} onCreate={value=>beginStudio(value)}/>
      <details className="study-filter-tools"><summary>Search studies & public brands</summary>
      <div className="grand-type-list" aria-label="Product types">{houseTypes(theme.id,category).map(type=><button key={type} aria-pressed={query===type} onClick={()=>setQuery(v=>v===type?'':type)}>{type}</button>)}</div>
      <div className="grand-search"><label><Search size={16}/><input aria-label="Search actual CORE exhibit titles and descriptions" maxLength={120} value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search CORE titles and descriptions"/></label>{query&&<button onClick={()=>setQuery('')}>Clear search</button>}<select aria-label="Filter public brand" value={brand} onChange={e=>setBrand(e.target.value)}><option value="">All public brands</option>{brands.map(id=><option key={id} value={id}>{scoped.find(c=>c.brandLineId===id)?.brandName??'CORE Brand Line'}</option>)}</select></div>
      </details>
      <AscensionExhibits key={theme.id+category} houseId={theme.id} category={category} signedIn={signedIn} disabled={blocked}/>
      <details className="study-core-catalog"><summary>Public CORE products · all authorized brands</summary><p className="fine-note">Real product records are supplied by CORE. These are separate from the geometric design studies above. Search matches actual product titles and descriptions.</p><CoreCatalogBrowser key={selected.key+':'+brand+':'+category+':'+query} presentation="vitrine" catalogRead={catalogRead} collectionSlugs={collectionSlugs} itemQuery={query} onPlace={onPlace}/></details>
     </>:<p className="grand-empty">Select a category to discover exhibits from every available brand. No product opens automatically.</p>}
    </div></div>
   </>}
  </DialogContent></Dialog>}
 </section>;
}
