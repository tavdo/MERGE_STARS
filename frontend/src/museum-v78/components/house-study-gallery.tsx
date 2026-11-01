"use client";
import {useState} from 'react';
import {ArrowLeft,ArrowRight,Sparkles} from 'lucide-react';
import {defaultVisualStudy,museumStudy,studiesFor,type VisualStudy} from '@/museum-v78/lib/museum-studies';
import type {CityHouseId} from '@/museum-v78/lib/megapolis-domain';
import {MuseumStudyViewer} from './museum-study-viewer';
import {PersonalMERGEAIChat} from './manager-live-chat';
export function HouseStudyGallery({houseId,category,query='',signedIn=false,onCreate}:{houseId:CityHouseId;category:string;query?:string;signedIn?:boolean;onCreate:(value:VisualStudy)=>void}){
 const studies=studiesFor(houseId,category,query),[selected,setSelected]=useState<string|null>(null),[visual,setVisual]=useState<VisualStudy|null>(null),[ai,setAI]=useState(false);
 const reference=studies.find(s=>s.id===selected)??studies[0],index=reference?studies.findIndex(s=>s.id===reference.id):-1;
 const value=reference?(visual?.reference_id===reference.id?visual:defaultVisualStudy(reference.id)):null;
 function choose(id:string){setSelected(id);setVisual(defaultVisualStudy(id));setAI(false);}
 if(!reference||!value)return <div className="study-empty"><strong>No matching design studies.</strong><p>Clear the search to see this category’s 3D studies. Public CORE products are listed separately below.</p></div>;
 return <section className="house-study-gallery" aria-label="3D concept studies" lang="en">
  <header><div><span className="eyebrow">MERGE DESIGN STUDIES · {studies.length} {studies.length===1?'CONCEPT':'CONCEPTS'}</span><h3>{reference.title}</h3><p>Explore the form. Shape your own version.</p></div><span>{index+1} / {studies.length}</span></header>
  <div className="study-gallery-layout"><MuseumStudyViewer value={value} onChange={setVisual}/><nav aria-label="Individual 3D studies">{studies.map(s=><button key={s.id} type="button" aria-pressed={reference.id===s.id} onClick={()=>choose(s.id)}><span>{s.title}</span><small>3D STUDY</small><ArrowRight size={14}/></button>)}</nav></div>
  <div className="study-gallery-actions"><button type="button" aria-label="Previous 3D study" disabled={studies.length<2} onClick={()=>choose(studies[(index-1+studies.length)%studies.length].id)}><ArrowLeft size={17}/></button><button type="button" aria-label="Next 3D study" disabled={studies.length<2} onClick={()=>choose(studies[(index+1)%studies.length].id)}><ArrowRight size={17}/></button><button type="button" className="button" onClick={()=>onCreate(value)}><Sparkles size={16}/>Create my version</button><button type="button" className="text-link" aria-expanded={ai} onClick={()=>setAI(v=>!v)}>Discuss with MERGE AI</button></div>
  {ai&&<PersonalMERGEAIChat key={reference.id} signedIn={signedIn} studyId={reference.id} initialRole="design"/>}
  <details className="study-provenance"><summary>Concept, material & source</summary><p>Original MERGE geometric study · {museumStudy(reference.id)?.id}. These are procedural 3D design studies, separate from public CORE products and uploaded brand originals. Gold and silver are visual finishes. Exact material, dimensions, weight, rights and production readiness require verification. No order or payment is created by viewing or editing.</p></details>
 </section>;
}
