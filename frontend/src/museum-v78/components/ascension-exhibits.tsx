"use client";
import {useRef,useState} from 'react';
import {ArrowLeft,Expand,Sparkles} from 'lucide-react';
import {ascensionForHouse,type AscensionExhibit} from '@/museum-v78/lib/ascension-exhibits';
import {MuseumImageDetail} from './museum-image-detail';
import {Dialog,DialogContent,DialogDescription,DialogTitle} from './ui/dialog';
import {PersonalMERGEAIChat} from './manager-live-chat';

/** Shared presentation placements; never substitutes for the live CORE catalog. */
export function AscensionExhibits({houseId,category,signedIn=false,disabled=false,onInspect}:{houseId?:string;category?:string;signedIn?:boolean;disabled?:boolean;onInspect?:()=>void}){
 const entries=ascensionForHouse(houseId,category);
 const [selected,setSelected]=useState<AscensionExhibit|null>(null),[ai,setAI]=useState(false);
 const returnFocus=useRef<HTMLElement|null>(null);
 if(!entries.length)return null;
 function inspect(item:AscensionExhibit){returnFocus.current=document.activeElement instanceof HTMLElement?document.activeElement:null;onInspect?.();setAI(false);setSelected(item);}
 return <section className="ascension-collection" aria-label="MERGE ASCENSION collection" lang="en">
  <header><span className="eyebrow">MERGE STARS · ASCENSION</span><p>Original concept exhibits · {entries.length} {entries.length===1?'work':'works'}</p></header>
  <div className="ascension-placements">{entries.map(item=><button type="button" className="ascension-placement" key={item.id} disabled={disabled} onClick={()=>inspect(item)} aria-label={'Inspect '+item.title}><img src={item.thumbnail} alt={item.description} loading="lazy" width={320} height={320}/><span><small>CONCEPT · {item.titleKa}</small><strong>{item.title}</strong><span>View original · Zoom · 1:1 <Expand size={15}/></span></span></button>)}</div>
  {selected&&<Dialog open onOpenChange={open=>{if(!open)setSelected(null);}}><DialogContent visual="exhibit" className="ascension-dialog" onCloseAutoFocus={event=>{if(returnFocus.current?.isConnected){event.preventDefault();returnFocus.current.focus({preventScroll:true});}}}>
   <DialogTitle>{selected.title}</DialogTitle><DialogDescription>AI-generated concept image. Material content, gemstones, manufacture and rights are not verified. This is not a loaded 3D model or a commercial offer.</DialogDescription>
   {ai?<><button type="button" className="text-link" onClick={()=>setAI(false)}><ArrowLeft size={16}/>Back to exhibit</button><PersonalMERGEAIChat key={selected.id+String(signedIn)} signedIn={signedIn} exhibitId={selected.id} initialRole="design"/></>:<>
    <MuseumImageDetail key={selected.id} image={selected.original} title={selected.title} language="en"/>
    <div className="ascension-actions"><a className="button outline" href={selected.original} target="_blank" rel="noopener noreferrer">Open original PNG<Expand size={15}/></a><button type="button" className="button" onClick={()=>setAI(true)}><Sparkles size={16}/>Discuss my version with MERGE AI</button></div>
    <details className="ascension-provenance"><summary>Source, rights & history</summary><dl><div><dt>Collection</dt><dd>MERGE STARS — ASCENSION</dd></div><div><dt>Presentation reference</dt><dd>{selected.id}</dd></div><div><dt>Original source SHA-256</dt><dd><code>{selected.sourceSha256}</code></dd></div><div><dt>CORE Product / Version / QR</dt><dd>Not connected</dd></div><div><dt>Rights & manufacturing</dt><dd>CORE confirmation required</dd></div></dl><p>Original source pixels are preserved. Artwork emblems do not replace the official company logo. No order, payment, version or production record is created by viewing or discussing this exhibit.</p></details>
   </>}
  </DialogContent></Dialog>}
 </section>;
}
