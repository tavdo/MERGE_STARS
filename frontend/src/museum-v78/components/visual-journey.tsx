"use client";
import {ArrowRight} from 'lucide-react';
import {visualJourney,visualDestination} from '@/museum-v78/lib/visual-routes';
export function VisualJourney({disabled,onOpen}:{disabled:boolean;onOpen:(image:string)=>void}){
 return <nav className="visual-journey" aria-label="Approved visual journey">{visualJourney.map(item=><button key={item.image} disabled={disabled||!visualDestination(item.image)} onClick={()=>onOpen(item.image)}><img src={item.image} alt="" loading="lazy"/><span>{item.label}</span><ArrowRight size={15}/></button>)}</nav>;
}
