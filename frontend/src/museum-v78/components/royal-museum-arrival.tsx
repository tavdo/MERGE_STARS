"use client";
import { ArrowDown, ArrowRight, Compass } from 'lucide-react';
import { CompanyMark } from '@/museum-v78/components/company-identity';
import type { CityBuilding } from '@/museum-v78/lib/megapolis-domain';

type Props = { houses: readonly CityBuilding[]; disabled: boolean; onHouse: (house: CityBuilding) => void; onWalk: () => void; onMuseum: () => void; onBrand: () => void };

// A photograph is an architectural view. It is never advertised as a GLB model,
// an authenticated visitor, a partner registry or a payable product.
export function RoyalMuseumArrival({ houses, disabled, onHouse, onWalk, onMuseum, onBrand }: Props) {
  return <section className="royal-arrival" aria-label="MERGE — შენი ოქროსა და ვერცხლის ქალაქ-მუზეუმი" data-presentation="APPROVED_PHOTOGRAPH">
    <div className="royal-arrival-art" aria-hidden="true"><picture><source srcSet="/museum-v78/assets/optimized/approved-mega-museum.webp" type="image/webp"/><img src="/museum-v78/assets/approved-mega-museum.png" alt="" width={1536} height={1024} decoding="async" /></picture></div>
    <header className="royal-arrival-heading"><CompanyMark decorative/><div><span className="eyebrow">GOLD · SILVER · YOUR LEGACY</span><h2>შენი სამყარო.<br/><i>MERGE BRAND MEGAPOLIS.</i></h2><p>მეგაბრენდ პოლისი — შექმენი შენი ბრენდის სამყარო.</p></div></header>
    <div className="royal-arrival-actions"><button disabled={disabled} onClick={onBrand} className="button light">შექმენი შენი ბრენდი<ArrowRight size={19}/></button><button disabled={disabled} onClick={onWalk} className="button outline"><Compass size={18}/>გახსენი 3D ქალაქი<ArrowDown size={17}/></button><button disabled={disabled} onClick={onMuseum} className="text-link">Grand Living Museum<ArrowRight size={16}/></button></div>
    <nav className="royal-house-wayfinding" aria-label="მეგაპოლისის 12 HOUSE-ის შესასვლელი"><div><span className="eyebrow">CHOOSE YOUR HOUSE</span><span>12 მიმართულება · ერთი MERGE სამყარო</span></div><div>{houses.map((house,index)=><button key={house.key} disabled={disabled} onClick={()=>onHouse(house)} aria-label={house.title+' — კატეგორიების გახსნა'}><small>{String(index+1).padStart(2,'0')}</small><span>{house.title}</span><ArrowRight size={15}/></button>)}</div></nav>
    <span className="royal-arrival-caption">დამტკიცებული არქიტექტურული ფოტო · 3D სივრცე ქვემოთ</span>
  </section>;
}
