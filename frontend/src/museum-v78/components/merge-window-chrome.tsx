import type {CSSProperties} from 'react';
import {CompanyMark} from '@/museum-v78/components/company-identity';
import {luxuryWindowPresets,museumWindowJourney,type LuxuryWindowKind} from '@/museum-v78/lib/luxury-windows';

export function MergeWindowChrome({kind='museum',compact=false}:{kind?:LuxuryWindowKind;compact?:boolean}){
 const view=luxuryWindowPresets[kind];
 return <header className="merge-window-chrome" data-window-chrome={compact?'compact':'full'} style={{'--window-art':`url("${view.image}")`,'--window-art-position':view.position} as CSSProperties}>
  <div className="merge-window-identity"><CompanyMark decorative/><div><strong>MERGE <span>STARS</span></strong><small>THE JEWELER OF BRANDS</small></div><span className="merge-window-context">{view.label}</span></div>
  {!compact&&<><div className="merge-window-architecture" aria-hidden="true"><span/><span/><span/></div><ol className="merge-window-sequence" aria-label="Museum journey context">{museumWindowJourney.map((step,index)=><li key={step.id} aria-current={index===view.stage?'location':undefined}><span>{String(index+1).padStart(2,'0')}</span>{step.label}</li>)}</ol></>}
 </header>;
}
