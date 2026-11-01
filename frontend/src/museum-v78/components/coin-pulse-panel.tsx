"use client";
import {useState} from 'react';
import {useCoreRead} from '@/museum-v78/components/core-context';
import {CoinSkyPrices,CoinLivePriceDetails} from '@/museum-v78/components/coin-sky-prices';
import {coinSkyRefreshMs,type CoinSkyLine} from '@/museum-v78/lib/coin-sky-prices';
import type {CorePrices} from '@/museum-v78/lib/core-contract';

export function CoinPulsePanel({onRules}:{onRules?:()=>void}){
  const feed=useCoreRead<CorePrices>('/api/core/prices',coinSkyRefreshMs);
  const [line,setLine]=useState<CoinSkyLine['line']|null>(null);
  return <section className="coin-pulse-panel" aria-label="MERGE Coin LIVE Pulse" lang="en"><span className="eyebrow">MERGE PULSE · GOLD & SILVER</span><h3>Your material. Your Coin. Its LIVE price basis.</h3><p>Both Coins use a nominal 1:2 metal-to-selected-polymer mass ratio: 33⅓% metal input and 66⅔% base. Gold is nominal 8K composite; Silver is a silver–polymer composite. The LIVE value of 1 kg of metal is a price basis, not a promise of 1 kg of pure metal. Both Coins open 12 Brand Lines. GOLD package and case: 12 products, within 1,000 g of finished composite in total. SILVER order and case: 1 product. Deferred payment for the first 1,000 registrations uses verified AVAILABLE commissions; CORE confirms eligibility and production authorization.</p><div className="coin-pulse-pair"><CoinSkyPrices feed={feed} disabled={false} onDetails={setLine}/></div><p className="fine-note">The light pulses once after a successful CORE response. It does not certify quote freshness, a price change or payment. Missing data shows its actual pending/unavailable state.</p>{line&&<div className="coin-pulse-expanded"><button type="button" className="text-link" onClick={()=>setLine(null)}>Close market details</button><CoinLivePriceDetails key={line} feed={feed} initialLine={line} onRules={onRules??(()=>setLine(null))}/></div>}</section>;
}
