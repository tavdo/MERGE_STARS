import {orderMuseumReferences} from "@/museum-v78/lib/luxury-windows";
import {Expand} from 'lucide-react';
const visuals = [
  {
    "image": "/museum-v78/assets/founder-ai-brand-board.png",
    "title": "MERGE AI · Brand Manager",
    "context": "ai"
  },
  {
    "image": "/museum-v78/assets/founder-clock-megapolis.png",
    "title": "12 Houses · Clock Megapolis",
    "context": "city"
  },
  {
    "image": "/museum-v78/assets/founder-atrium-fashion.png",
    "title": "Grand Atrium · Fashion House",
    "context": "museum"
  },
  {
    "image": "/museum-v78/assets/founder-twelve-house-metropolis.png",
    "title": "12 Houses · Grand Living Museum",
    "context": "city"
  },
  {
    "image": "/museum-v78/assets/founder-futuristic-museum.png",
    "title": "Futuristic Grand Living Museum",
    "context": "city"
  },
  {
    "image": "/museum-v78/assets/founder-brand-house-tbilisi.png",
    "title": "MERGE Brand House · Tbilisi",
    "context": "brand"
  },
  {
    "image": "/museum-v78/assets/founder-ai-concierge.png",
    "title": "MERGE AI · Museum Concierge",
    "context": "ai"
  }
] as const;

export function FounderVisualReferences({context}:{context:'city'|'museum'|'ai'|'brand'}){
  return <section aria-label="Founder approved visual references" style={{margin:'24px 0',width:'100%'}}>
    <h3 style={{fontSize:20}}>Founder Visual References</h3>
    <p className="fine-note">Architectural and interface concepts. Embedded accounts, prices, logos and controls are reference artwork, not live CORE records or operational functions.</p>
    <nav className="founder-reference-links" aria-label="Original reference images">{orderMuseumReferences(visuals.filter(v=>v.context===context)).map(v=><a key={v.image} href={v.image} target="_blank" rel="noreferrer"><Expand size={15}/>{v.title}</a>)}</nav>
  </section>;
}
