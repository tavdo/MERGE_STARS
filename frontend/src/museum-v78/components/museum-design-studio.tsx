"use client";
import {useEffect,useId,useState,type MutableRefObject} from 'react';
import {ArrowLeft,Copy,Check,LockKeyhole,UserRound} from 'lucide-react';
import {cityHouses,type CityHouseId} from '@/museum-v78/lib/megapolis-domain';
import {houseCategoryLabel,houseTypes,fitCategoryForHouse} from '@/museum-v78/lib/house-experience';
import {museumDesignIntentSchema,prepareMuseumDesignBrief,type CoinMuseumLine,type MuseumDesignIntent} from '@/museum-v78/lib/coin-museum';
import {polymerCandidates} from '@/museum-v78/lib/material-candidates';
import type {MaterialPreference} from '@/museum-v78/lib/museum-domain';
import type {FitCategory} from '@/museum-v78/lib/fit-measurements';
import {AtelierLibrary} from './atelier-library';
import {LocalModelInspector} from './local-model-inspector';
import {ProductStudioConfigurator} from './product-studio-configurator';
import {MuseumStudyViewer} from './museum-study-viewer';
import {PersonalMERGEAIChat} from './manager-live-chat';
import {defaultVisualStudy,studiesFor,museumStudy,studyBrief,type VisualStudy} from '@/museum-v78/lib/museum-studies';
import {StoryboardArtwork} from './photo-scenario';
import {studioPhotoStage} from '@/museum-v78/lib/photo-scenario';
import {museumStudioMemorySchema,type MuseumStudioMemory} from '@/museum-v78/lib/museum-studio-memory';

export function MuseumDesignStudio({houseId,category:initialCategory='',signedIn,onBack,onFit,importMode=false,initialIntent,initialVisual,memory}:{houseId:CityHouseId;category?:string;signedIn:boolean;onBack:()=>void;onFit:(category:FitCategory)=>void;importMode?:boolean;initialIntent?:MuseumDesignIntent;initialVisual?:VisualStudy;memory?:MutableRefObject<MuseumStudioMemory|null>}){
 const id=useId(),house=cityHouses.find(h=>h.id===houseId)!;
 const photoStage=studioPhotoStage(houseId,initialCategory);
 const checked=museumDesignIntentSchema.safeParse(initialIntent),restored=checked.success&&checked.data.experience_house_id===houseId?checked.data:null;
 const checkedMemory=museumStudioMemorySchema.safeParse(memory?.current),progress=checkedMemory.success&&checkedMemory.data.house_id===houseId&&checkedMemory.data.category===initialCategory?checkedMemory.data:null;
 const [category,setCategory]=useState(restored?.experience_category??progress?.category??initialCategory),[description,setDescription]=useState(restored?.description??progress?.description??(initialVisual?studyBrief(initialVisual.reference_id,initialVisual):'')),[line,setLine]=useState<CoinMuseumLine>(restored?.coin_line??progress?.coin_line??'GOLD'),[copied,setCopied]=useState(false),[copyFailed,setCopyFailed]=useState(false),[importing,setImporting]=useState(progress?.importing??importMode),[visual,setVisual]=useState<VisualStudy|null>(restored?.visual_study??progress?.visual??initialVisual??null),[ai,setAI]=useState(false);
 const [material,setMaterial]=useState<MaterialPreference>(restored?.material_preference??progress?.material??{base_filament:'',precious_metal:'gold',integration:'',intended_use:'',details:''});
 const [configurationRevision,setConfigurationRevision]=useState(0);
 useEffect(()=>{setImporting(importMode);},[importMode]);
 const chosen=visual?museumStudy(visual.reference_id):null,fallback=studiesFor(houseId,category)[0];
 const activeVisual=importing||!category?null:chosen?.houseId===houseId&&chosen.category===category?visual:fallback?defaultVisualStudy(fallback.id):null;
 const intent={experience_house_id:houseId,experience_category:category,coin_line:line,description,material_preference:material,...(activeVisual?{visual_study:activeVisual}:{})};
 useEffect(()=>{if(memory)memory.current={house_id:houseId,category,description,coin_line:line,material,visual:activeVisual,importing};},[memory,houseId,category,description,line,material,activeVisual,importing]);
 const valid=museumDesignIntentSchema.safeParse(intent).success,brief=valid?prepareMuseumDesignBrief(intent,'en'):null,types=houseTypes(houseId,category),fit=fitCategoryForHouse(houseId,category);
 function changeLine(next:CoinMuseumLine){setLine(next);setMaterial(m=>({...m,precious_metal:next==='GOLD'?'gold':'silver'}));if(activeVisual)setVisual({...activeVisual,finish:next==='GOLD'?'gold':'silver'});setCopied(false);}
 async function copy(){if(!brief)return;try{await navigator.clipboard.writeText(brief);setCopied(true);setCopyFailed(false);}catch{setCopyFailed(true);}}
 return <section className="museum-design-studio" aria-label={house.title+' design studio'} lang="en" data-core-product="UNASSIGNED">
  <button type="button" className="text-link" onClick={onBack}><ArrowLeft size={16}/>Back to {house.title}</button>
  <span className="eyebrow">{house.title} · YOUR PRIVATE DESIGN STUDIO</span><h2>{importing?'Your existing design':'Create your next design'}</h2>
  {photoStage&&<figure className="studio-storyboard-reference"><StoryboardArtwork stage={photoStage}/><figcaption>{photoStage.id} · {photoStage.title} · Original Studio / Lab reference</figcaption></figure>}
  <p>Shape a 3D study, describe your version and save it privately. You can reopen the same visual choices in My Museum. A production order is confirmed separately through MERGE CORE.</p>
  <div className="studio-actions"><button type="button" aria-pressed={!importing} onClick={()=>setImporting(false)}>New design brief</button><button type="button" aria-pressed={importing} onClick={()=>setImporting(true)}>Inspect existing GLB</button></div>
  {importing&&<LocalModelInspector/>}
  {activeVisual&&<div className="studio-visual-study"><MuseumStudyViewer value={activeVisual} onChange={value=>{setVisual(value);setCopied(false);}}/><div className="studio-actions"><button type="button" onClick={()=>{setDescription(current=>{const brief=studyBrief(activeVisual.reference_id,activeVisual);return (current?current+'\n\n'+brief:brief).slice(0,3000);});setCopied(false);}}>Add these visual choices to my brief</button><button type="button" aria-expanded={ai} onClick={()=>setAI(v=>!v)}>My MERGE AI architect</button></div><p className="fine-note">Editable procedural study · visual finish only. Imported originals and CORE products stay unchanged. AI generation, physical scale and manufacturing approval are separate.</p>{ai&&<PersonalMERGEAIChat key={activeVisual.reference_id} signedIn={signedIn} studyId={activeVisual.reference_id} initialRole="design" brief={{brand_name:'Private museum design',description}}/>}</div>}
  <details className="studio-advanced-options"><summary>Technical design details · optional</summary><ProductStudioConfigurator key={houseId+':'+category+':'+configurationRevision} houseId={houseId} description={description} onApply={value=>{setDescription(value);setCopied(false);}}/></details>
  <form onSubmit={event=>event.preventDefault()} onChange={()=>{setCopied(false);setCopyFailed(false);}}>
   <label htmlFor={id+'category'}>Product category</label><select id={id+'category'} required value={category} onChange={event=>setCategory(event.target.value)}><option value="">Choose a category</option>{house.categories.map(value=><option key={value} value={value}>{houseCategoryLabel(houseId,value)}</option>)}</select>
   {!!types.length&&<div className="studio-type-suggestions" aria-label="Product examples">{types.map(type=><button type="button" key={type} onClick={()=>setDescription(current=>current?current+'\nProduct type: '+type:'Product type: '+type+'. ')}>{type}</button>)}</div>}
   <label htmlFor={id+'description'}>Describe the design</label><textarea id={id+'description'} required rows={5} minLength={10} maxLength={3000} value={description} placeholder="Shape, intended function, your own logo, colors, dimensions and approved source references." onChange={event=>setDescription(event.target.value)}/>
   <fieldset><legend>Coin package preference</legend><div className="studio-actions">{(['GOLD','SILVER'] as const).map(value=><button type="button" key={value} aria-pressed={line===value} onClick={()=>changeLine(value)}>{value} COIN</button>)}</div><p>{line==='GOLD'?'Gold: up to 12 items. Items AND case together must stay within 1,000 g of finished MERGE 8K gold composite.':'Silver: one physical item and approved case. Both lines support 12 Brand Lines. No Silver mass cap is assumed.'}</p></fieldset>
   <label htmlFor={id+'base'}>Base polymer / filament family</label><select id={id+'base'} required value={material.base_filament} onChange={event=>setMaterial(m=>({...m,base_filament:event.target.value}))}><option value="">Choose a research candidate</option>{polymerCandidates.map(name=><option key={name} value={name}>{name}</option>)}</select>
   <p className="fine-note">Carbon fiber is a filler. Specify its base polymer and required properties below. A candidate selection does not approve a recipe.</p>
   <label htmlFor={id+'integration'}>Material integration</label><select id={id+'integration'} required value={material.integration} onChange={event=>setMaterial(m=>({...m,integration:event.target.value as MaterialPreference['integration']}))}><option value="">Choose integration</option><option value="blend">Composite blend</option><option value="mosaic">Selective mosaic</option><option value="surface">Surface treatment</option><option value="separate_component">Separate approved component</option><option value="lab_recommendation">Material Lab recommendation</option></select>
   <label htmlFor={id+'use'}>Intended use</label><input id={id+'use'} required maxLength={160} value={material.intended_use} onChange={event=>setMaterial(m=>({...m,intended_use:event.target.value}))}/>
   <label htmlFor={id+'details'}>Material details · optional</label><textarea id={id+'details'} rows={3} maxLength={500} value={material.details} onChange={event=>setMaterial(m=>({...m,details:event.target.value}))}/>
   <p className="studio-material-law">{line==='GOLD'?'GOLD':'SILVER'} · nominal 1:2 metal-to-base mass ratio, approximately 33⅓% metal component. Input purity, composite fraction and verified fine-metal content are separate. CORE Material Lab must approve the recipe and batch.</p>
   {fit!=='none'&&<button type="button" className="button outline" onClick={()=>onFit(fit)}><UserRound size={16}/>Prepare required fit measurements</button>}
   <div className="studio-actions"><button type="button" disabled title="Meshy generation and authoritative CORE order registration are not configured"><LockKeyhole size={16}/>Generate 3D + register order · connection required</button><button type="button" disabled={!valid} onClick={()=>void copy()}>{copied?<Check size={16}/>:<Copy size={16}/>} {copied?'Brief copied':'Copy design brief'}</button></div>
   {copyFailed&&<div role="status"><p>Clipboard access is unavailable. Select and copy the brief below.</p><textarea readOnly aria-label="Prepared design brief" rows={8} value={brief??''}/></div>}
  </form>
  <AtelierLibrary language="en" signedIn={signedIn} intent={intent} onRestore={value=>{if(value.experience_house_id!==houseId)return;setCategory(value.experience_category);setDescription(value.description);setLine(value.coin_line);setMaterial(value.material_preference);setVisual(value.visual_study??null);setImporting(false);setCopied(false);setConfigurationRevision(v=>v+1);}} houseId={houseId}/>
 </section>;
}
