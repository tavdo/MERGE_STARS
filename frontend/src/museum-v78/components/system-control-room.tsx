import { museumV78Fetch } from '@/museum-v78/transport';
"use client";
import {useEffect,useRef,useState} from 'react';
import {Activity,RefreshCw,Download,ShieldCheck} from 'lucide-react';
import {systemHealthSchema,growthScenario,type SystemHealth} from '@/museum-v78/lib/system-health';

export function SystemControlRoom(){
 const [data,setData]=useState<SystemHealth|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[seeds,setSeeds]=useState('12000'),[fanout,setFanout]=useState('12000');
 const active=useRef<AbortController|null>(null),ticket=useRef(0);
 useEffect(()=>{void check();return()=>{++ticket.current;active.current?.abort();};},[]);
 async function check(){
  active.current?.abort();const controller=new AbortController();active.current=controller;const sequence=++ticket.current;setBusy(true);setError('');setData(null);const timer=setTimeout(()=>controller.abort(),22000);
  try{const response=await museumV78Fetch('/api/health',{credentials:'same-origin',cache:'no-store',redirect:'error',signal:controller.signal});if(!response.ok)throw Error('HEALTH_UNAVAILABLE');const text=await response.text();if(text.length>64000)throw Error('INVALID_HEALTH');const result=systemHealthSchema.parse(JSON.parse(text));if(sequence===ticket.current)setData(result);}
  catch{if(sequence===ticket.current)setError('Health could not be verified. No service is marked healthy by default. Retry the checks.');}
  finally{clearTimeout(timer);if(sequence===ticket.current)setBusy(false);}
 }
 function download(){if(!data)return;const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download='MERGE-private-service-health.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 let scenario:ReturnType<typeof growthScenario>|null=null;try{if(/^\d+$/.test(seeds)&&/^\d+$/.test(fanout))scenario=growthScenario(Number(seeds),Number(fanout));}catch{}
 return <section className="system-control-room" lang="en" aria-label="Private project control room">
  <span className="eyebrow">ONE CORE · VERIFIED EVIDENCE</span><h2>MERGE Control Room</h2><p>The current private experience and its actual integration boundaries. Unknown financial and production data stays unavailable.</p>
  <div className="studio-actions"><button disabled={busy} onClick={()=>void check()}><RefreshCw size={16}/>{busy?'Checking actual services…':'Run health checks'}</button><button disabled={!data} onClick={download}><Download size={16}/>Download health evidence</button></div>
  {error&&<p role="alert">{error}</p>}{busy&&<p role="status">Checking private storage and existing CORE public read contracts…</p>}
  {data&&<><p className="control-health-state"><Activity size={18}/>{data.overall} · checked {new Date(data.checked_at).toLocaleString('en-GB',{timeZone:'Asia/Tbilisi'})} · Asia/Tbilisi</p>
   <div className="control-service-list">{data.services.map(service=><article key={service.id} data-service-status={service.status}><div><strong>{service.label}</strong><span>{service.status.replaceAll('_',' ')}</span></div><p>{service.detail}</p></article>)}</div>
   <dl className="control-metrics"><div><dt>Your private saved design briefs</dt><dd>{data.private_briefs??'UNAVAILABLE'}</dd></div><div><dt>Public CORE collections</dt><dd>{data.public_catalog?.collections??'UNAVAILABLE'}</dd></div><div><dt>Public catalog Brand Line references</dt><dd>{data.public_catalog?.brand_lines??'UNAVAILABLE'}</dd></div>{['Verified CORE orders','Verified payments','Available commissions','Production queue'].map(label=><div key={label}><dt>{label}</dt><dd>CORE CONNECTION REQUIRED</dd></div>)}</dl>
  </>}
  <section className="growth-scenario" aria-label="Isolated growth scenario"><span className="eyebrow">SCENARIO ONLY · NOT GUARANTEED</span><h3>Growth planning</h3><p>The Founder’s three-month target is a scenario. A combination of two order sets does not create official orders. Only unique, explicitly confirmed CORE Order IDs count as actual orders.</p><div><label>Seed orders<input type="number" min="0" max="1000000" step="1" value={seeds} onChange={e=>setSeeds(e.target.value)}/></label><label>Additional orders per seed<input type="number" min="0" max="1000000" step="1" value={fanout} onChange={e=>setFanout(e.target.value)}/></label></div><output>{scenario?scenario.possibleAdditionalOrders.toLocaleString('en-US'):'Enter whole numbers from 0 to 1,000,000'}</output><p>12,000 buyers × 12 orders = 144,000 orders. Two disjoint sets of 12,000 actual orders contain 24,000 unique orders. The 144,000,000 scenario requires 12,000 additional orders per seed and corresponding real confirmations.</p><small>This calculation creates zero orders, payments or commissions.</small></section>
  <p className="fine-note"><ShieldCheck size={15}/> A readable public catalog or private Site sign-in does not establish complete CORE integration.</p>
 </section>;
}
