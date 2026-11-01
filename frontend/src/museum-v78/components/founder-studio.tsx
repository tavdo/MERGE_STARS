"use client";
import {Activity,Bot,Expand,Layers3} from 'lucide-react';
export function FounderStudio({onAi,onDesigns,onSystem,onOriginal}:{onAi:()=>void;onDesigns:()=>void;onSystem:()=>void;onOriginal:()=>void}){
 return <section className="founder-studio" aria-label="Founder Studio architectural concept"><figure><img src="/museum-v78/assets/founder-office-study.png" alt="Founder-supplied black and gold studio with a panoramic city view"/><figcaption>ARCHITECTURAL CONCEPT</figcaption></figure><nav aria-label="Founder Studio destinations"><button onClick={onAi}><Bot size={17}/>MERGE AI</button><button onClick={onDesigns}><Layers3 size={17}/>My designs</button><button onClick={onSystem}><Activity size={17}/>System status</button><button onClick={onOriginal}><Expand size={17}/>View original</button></nav></section>;
}
