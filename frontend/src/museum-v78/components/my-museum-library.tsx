"use client";
import {useState} from 'react';
import {AtelierLibrary} from './atelier-library';
import {MuseumDesignStudio} from './museum-design-studio';
import type {MuseumDesignIntent} from '@/museum-v78/lib/coin-museum';
import type {CityHouseId} from '@/museum-v78/lib/megapolis-domain';
import type {FitCategory} from '@/museum-v78/lib/fit-measurements';
export function MyMuseumLibrary({signedIn,onFit}:{signedIn:boolean;onFit:(category:FitCategory)=>void}){
 const [opened,setOpened]=useState<MuseumDesignIntent|null>(null);
 return <section className="my-museum-library" lang="en"><span className="eyebrow">ONE OWNER · EVERY HOUSE</span><h2>My private design museum</h2><p>Open your saved briefs from every House. These private preparation records remain separate from authoritative CORE products and public exhibits.</p>
 {opened?<MuseumDesignStudio key={JSON.stringify(opened)} houseId={opened.experience_house_id as CityHouseId} initialIntent={opened} signedIn={signedIn} onBack={()=>setOpened(null)} onFit={onFit}/>:<AtelierLibrary language="en" signedIn={signedIn} intent={null} onRestore={setOpened}/>}
 </section>;
}
