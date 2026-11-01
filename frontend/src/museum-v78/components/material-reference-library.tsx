"use client";
import {useState} from 'react';
import {Expand} from 'lucide-react';
import {FilamentPreference} from './filament-preference';
import type {MaterialPreference} from '@/museum-v78/lib/museum-domain';
import {ContextPhotoSequence} from './photo-scenario';
import {displayablePhotograph} from '@/museum-v78/lib/photo-quality';
const images=[{image:'/museum-v78/assets/material-library.png',title:'Material library'},{image:'/museum-v78/assets/material-passport.png',title:'Material passport reference'},{image:'/museum-v78/assets/founder-yarn-process-study.png',title:'Composite to textile · concept'},{image:'/museum-v78/assets/founder-composite-yarn-research.png',title:'From composite to yarn · research concept'}] as const;
export function MaterialReferenceLibrary({onOriginal,initialImage}:{onOriginal:(image:string)=>void;initialImage?:string}){
 const reviewedImages=images.filter(item=>displayablePhotograph(item.image));
 const [index,setIndex]=useState(()=>Math.max(0,reviewedImages.findIndex(item=>item.image===initialImage))),[preference,setPreference]=useState<MaterialPreference>();
 return <section className="material-reference-library" aria-label="Material reference library"><h3>MERGE Material Library</h3><ContextPhotoSequence context="materials" onOriginal={onOriginal}/><nav aria-label="Material reference views">{reviewedImages.map((item,i)=><button key={item.image} aria-pressed={index===i} onClick={()=>setIndex(i)}>{item.title}</button>)}</nav><img src={reviewedImages[index].image} alt={reviewedImages[index].title} loading="lazy"/><button className="text-link" onClick={()=>onOriginal(reviewedImages[index].image)}><Expand size={15}/>View original</button><FilamentPreference value={preference} onChange={setPreference}/><p className="fine-note" role="status">Local material preference only. A photograph is not a certified recipe, measured weight or verified batch passport. CORE submission is unavailable.</p></section>;
}
