"use client";
import type { CSSProperties } from 'react';

export const MUSEUM_ENTRY_DURATION = 5600;

const closed = '/living-museum/assets/founder-portal-mirrored-terminals.png';

export function MuseumGate({opening,ready,onEnter}:{opening:boolean;ready:boolean;onEnter:()=>void}) {
  return <div className="gate-art founder-gate joined-gate" data-variant="dual" data-door-state={opening ? 'OPENING' : 'CLOSED'}><button type="button" className="gate-portal" disabled={opening || !ready} aria-label="გახსენი კარი და შედი MERGE-ის მუზეუმში" aria-busy={opening} onClick={() => { if (ready && !opening) onEnter(); }}>
    <span className="joined-gate-composition" style={{ '--entry-duration': `${MUSEUM_ENTRY_DURATION}ms` } as CSSProperties}>
      <img className="joined-gate-base" src={closed} alt="დახურული Aurum / Argentum პორტალი" fetchPriority="high" />
      <img className="joined-gate-interior" src="/living-museum/assets/entrance-canonical-open.png" alt="" />
      <span className="joined-door-window" aria-hidden="true">
        {(['gold','silver'] as const).map(side=><span key={side} className={`joined-door-leaf joined-door-${side}`}><img className="joined-gate-base" src={closed} alt="" /></span>)}
      </span>
      <img className="joined-gate-arrival" src="/living-museum/assets/founder-open-portal-oct18.png" alt="" />
    </span>
    <span className="sr-only">{opening ? 'კარი იღება…' : 'მუზეუმში შესვლა'}</span>
  </button></div>;
}
