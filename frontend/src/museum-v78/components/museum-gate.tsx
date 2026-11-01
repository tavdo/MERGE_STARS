"use client";
import type {CSSProperties} from 'react';
import {entranceReferences,ENTRANCE_DURATION,ENTRANCE_DOOR_DURATION,ENTRANCE_TRAVEL_START,ENTRANCE_RELEASE_DURATION} from '@/museum-v78/lib/megapolis-entrance';

// Both visible states use the founder's exact photos in the requested order.
// The retained renderer must not replace photo 1 with a procedural imitation.
// Photo 2 is preloaded, held, and pushed into the unchanged existing city view.
export function MuseumGate({opening,ready,onEnter,live=false,unavailable=false,openImageState='loading',onOpenImageState}:{doorVariant?:boolean;opening:boolean;ready:boolean;onEnter:()=>void;live?:boolean;unavailable?:boolean;openImageState?:'loading'|'ready'|'unavailable';onOpenImageState?:(state:'ready'|'unavailable')=>void}){
 const canEnter=ready&&openImageState==='ready';
 const timing={'--gate-total-duration':ENTRANCE_DURATION+'ms','--gate-reference-duration':ENTRANCE_DOOR_DURATION+'ms','--gate-push-delay':ENTRANCE_TRAVEL_START+'ms','--gate-push-duration':ENTRANCE_DURATION-ENTRANCE_TRAVEL_START+'ms','--gate-release-delay':ENTRANCE_DURATION-ENTRANCE_RELEASE_DURATION+'ms','--gate-release-duration':ENTRANCE_RELEASE_DURATION+'ms'} as CSSProperties;
 return <div className="gate-art founder-gate" style={timing} data-variant="founder" data-door-state={opening?'OPENING':'CLOSED'} data-destination="MEGAPOLIS" data-presentation="APPROVED_PHOTO_SEQUENCE" data-background-renderer={live?'READY':unavailable?'UNAVAILABLE':'LOADING'}>
  <button type="button" className="gate-portal" disabled={opening||!canEnter} aria-label="გახსენი კარი და შედი MERGE-ის მეგაპოლისში" aria-busy={opening} onClick={()=>{if(canEnter&&!opening)onEnter();}}>
   <img className="founder-gate-fallback" src={entranceReferences.closed} alt="№1 — დამფუძნებლის დამტკიცებული დახურული კარი" width={1536} height={1024} fetchPriority="high" decoding="async"/>
   <span className="founder-open-stage" aria-hidden="true"><img className="founder-open-image" src={entranceReferences.open} alt="" width={1672} height={941} fetchPriority="high" decoding="async" ref={image=>{if(image?.complete)onOpenImageState?.(image.naturalWidth>0?'ready':'unavailable');}} onLoad={()=>onOpenImageState?.('ready')} onError={()=>onOpenImageState?.('unavailable')}/></span>
   <span className="sr-only">{opening?'კარი იღება — კამერა შედის მეგაპოლისში':'მეგაპოლისში შესვლა'}</span>
  </button>
  {openImageState==='unavailable'?<span className="founder-reference-status" role="alert">ღია კარის ფოტო ვერ ჩაიტვირთა. განაახლე გვერდი ხელახლა საცდელად.</span>:!live&&<span className="founder-reference-status" role="status">{unavailable?'ფოტოს შესასვლელი':'შესასვლელი იტვირთება'}</span>}
 </div>;
}
