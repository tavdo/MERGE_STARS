import { museumV78Fetch } from '@/museum-v78/transport';
"use client";
import {clientRequestId} from '@/museum-v78/lib/client-request-id';
import { useEffect, useRef, useState } from 'react';
import { atelierInputSchema, atelierListSchema, atelierSavedSchema, type AtelierRecord } from '@/museum-v78/lib/atelier-contract';
import { prepareMuseumDesignBrief, type MuseumDesignIntent } from '@/museum-v78/lib/coin-museum';
import { cityHouses } from '@/museum-v78/lib/megapolis-domain';
import { draftCasePlan } from '@/museum-v78/lib/coin-product-law';
import {museumStudy} from '@/museum-v78/lib/museum-studies';

async function request(input?: unknown) {
  const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await museumV78Fetch('/api/atelier', { method: input ? 'POST' : 'GET', credentials: 'same-origin', cache: 'no-store', redirect: 'error', signal: controller.signal, headers: { Accept: 'application/json', ...(input ? { 'Content-Type': 'application/json' } : {}) }, ...(input ? { body: JSON.stringify(input) } : {}) });
    const reader = response.body?.getReader(); if (!reader) throw new Error('INVALID_RESPONSE');
    const chunks: Uint8Array[] = []; let size = 0;
    try { while (true) { const part = await reader.read(); if (part.done) break; size += part.value.length; if (size > 2000000) { await reader.cancel(); throw new Error('INVALID_RESPONSE'); } chunks.push(part.value); } } finally { reader.releaseLock(); }
    const bytes = new Uint8Array(size); let offset = 0; for (const part of chunks) { bytes.set(part, offset); offset += part.length; }
    const body = JSON.parse(new TextDecoder().decode(bytes));
    if (!response.ok) throw new Error(body.error ?? 'STORAGE_UNAVAILABLE');
    return body;
  } finally { clearTimeout(timer); }
}
export function AtelierLibrary({ intent, signedIn, onRestore, language='ka',houseId }: { intent: unknown; signedIn: boolean; onRestore: (value: MuseumDesignIntent) => void;language?:'ka'|'en';houseId?:string }) {
  const en=language==='en';
  const [records, setRecords] = useState<AtelierRecord[]>([]), [busy, setBusy] = useState(false), [loading, setLoading] = useState(false), [message, setMessage] = useState('');
  const pending = useRef<{ payload: string; id: string } | null>(null), lock = useRef(false), mounted = useRef(true), sequence = useRef(0);
  const [savedPayload, setSavedPayload] = useState('');
  const [selectedForPlan,setSelectedForPlan]=useState<string[]>([]);
  const casePlan=draftCasePlan(records,selectedForPlan);
  const parsed = atelierInputSchema.safeParse({ request_id: '00000000-0000-4000-8000-000000000000', intent });
  const payload = parsed.success ? JSON.stringify(parsed.data.intent) : '';
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; ++sequence.current; }; }, []);
  async function load() {
    const current = ++sequence.current; setLoading(true);
    try { const result = atelierListSchema.parse(await request()); if (mounted.current && current === sequence.current) { setRecords(result.drafts); setMessage(''); } }
    catch { if (mounted.current && current === sequence.current) setMessage(en?'Saved briefs could not load. Retry to read the actual saved records.':'შენახული მოთხოვნები ვერ ჩაიტვირთა. ხელახლა სცადე.'); }
    finally { if (mounted.current && current === sequence.current) setLoading(false); }
  }
  useEffect(() => { if (signedIn) void load(); else {++sequence.current;setRecords([]);setSelectedForPlan([]);} }, [signedIn]);
  async function save() {
    if (lock.current || !payload || !signedIn || payload === savedPayload) return;
    lock.current = true; setBusy(true); setMessage(''); ++sequence.current; setLoading(false);
    if (pending.current?.payload !== payload) pending.current = { payload, id: clientRequestId() };
    try {
      const result = atelierSavedSchema.parse(await request({ request_id: pending.current.id, intent: JSON.parse(payload) }));
      if (JSON.stringify(result.draft.intent) !== payload) throw new Error('INVALID_RESPONSE');
      if (!mounted.current) return;
      setRecords(values => [result.draft, ...values.filter(value => value.id !== result.draft.id)].slice(0, 100)); setSavedPayload(payload);
      setMessage(en?'Private brief saved. You can reopen it and continue later. No CORE order has been created.':'მოთხოვნის მონახაზი შენახულია. შეგიძლია მოგვიანებით გახსნა და გააგრძელო.');
    } catch (error) {
      if (mounted.current) setMessage(error instanceof Error && error.message === 'COLLECTION_LIMIT_REACHED' ? (en?'The private experience brief limit is 100. CORE catalog capacity is separate.':'100 მოთხოვნის ლიმიტი მიღწეულია.') : (en?'Save was not confirmed. Retry checks the same request without creating a duplicate.':'შენახვა ვერ დადასტურდა. ხელახლა ცდა იმავე მოთხოვნას გადაამოწმებს.'));
    } finally { lock.current = false; if (mounted.current) setBusy(false); }
  }
  function download() {
    const brief = prepareMuseumDesignBrief(intent,en?'en':'ka'); if (!brief) return;
    const url = URL.createObjectURL(new Blob([brief], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'MERGE-design-brief.txt'; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  if(en)return <section className="atelier-library" aria-label="Private saved design briefs" lang="en">
    <h3>{intent?'Save to My Museum':'My saved designs'}</h3><p>Private briefs and 3D study settings are stored under your existing private Site session. Reopen a saved study to continue with the same finish, mosaic, style and variation. CORE product and order registration is separate.</p>
    <div className="studio-actions"><button className="button" type="button" disabled={!signedIn||!payload||busy||payload===savedPayload} onClick={()=>void save()}>{busy?'Saving…':payload&&payload===savedPayload?'Brief saved':'Save private brief'}</button><button type="button" disabled={!payload} onClick={download}>Download brief TXT</button><button type="button" disabled={loading||busy||!signedIn} onClick={()=>void load()}>{loading?'Reading saved records…':'Refresh saved briefs'}</button></div>
    {!signedIn&&<p>Sign in to save private briefs on the server.</p>}<p role="status" aria-live="polite">{message}</p>
    <details open={!intent?true:undefined}><summary>My {houseId?'House ':''}briefs · {records.filter(r=>!houseId||r.intent.experience_house_id===houseId).length}</summary>
      <div className="core-record-list">{records.filter(r=>!houseId||r.intent.experience_house_id===houseId).map(record=><div className="atelier-saved-row" key={record.id}><label><input type="checkbox" checked={selectedForPlan.includes(record.id)} disabled={busy} onChange={e=>setSelectedForPlan(v=>e.target.checked?[...new Set([...v,record.id])]:v.filter(id=>id!==record.id))}/>Include in private plan</label><button type="button" disabled={busy} onClick={()=>{onRestore(record.intent);setSavedPayload(JSON.stringify(record.intent));setMessage('Saved brief opened. Edits save as a new brief; the original remains intact.');}}><span><strong>{record.intent.visual_study?museumStudy(record.intent.visual_study.reference_id)?.title:record.intent.description.slice(0,90)}</strong><small>{record.intent.coin_line} · {cityHouses.find(h=>h.id===record.intent.experience_house_id)?.title} · {new Date(record.created_at).toLocaleDateString('en-GB',{timeZone:'Asia/Tbilisi'})}</small><small>{record.intent.visual_study?'CONCEPT · saved 3D study configuration':'CONCEPT · private design brief'}</small></span><span>{record.intent.visual_study?'Open 3D study':'Open brief'}</span></button></div>)}</div>
      {!records.some(r=>!houseId||r.intent.experience_house_id===houseId)&&!loading&&<p>No saved briefs are available for this House.</p>}
    </details>
    <details className="atelier-case-plan"><summary>Private package plan · optional</summary><h4>Private package plan</h4><p>Selected: {casePlan.gold} Gold items · {casePlan.silver} Silver items. Selected briefs are planning data; they do not reserve a package or create orders.</p><p>Gold: up to 12 items. The combined finished MERGE 8K gold-composite mass of items AND case must be ≤1,000 g. Missing case or item weight stays pending. Silver: one item and approved case.</p>{casePlan.goldExceedsSinglePackageSlots&&<p role="status">More than 12 Gold items are selected. Additional full-package requirements must be confirmed by CORE, including each case.</p>}<small>Plan selection lasts only while this view is open. Saved briefs remain private server records.</small></details>
  </section>;
  return <section className="atelier-library" aria-label="ჩემი შენახული დიზაინის მოთხოვნები">
    <h4>დიზაინის მოთხოვნის შენახვა</h4>
    <p className="fine-note">მონახაზის შენახვა წინასწარ გადახდას არ მოითხოვს. ეს არ არის მიღებული CORE შეკვეთა ან გადახდილი Coin.</p>
    <div className="brand-museum-atelier-actions"><button className="button" type="button" disabled={!signedIn || !payload || busy || payload === savedPayload} onClick={() => void save()}>{busy ? 'ინახება…' : payload && payload === savedPayload ? 'შენახულია' : 'მონახაზის შენახვა'}</button><button className="button outline" type="button" disabled={!payload} onClick={download}>ტექსტის ჩამოტვირთვა</button></div>
    {!signedIn && <p className="fine-note">სერვერზე პირადი შენახვისთვის შედი ანგარიშით.</p>}
    <p role="status" aria-live="polite">{message}</p>
    <div className="atelier-case-plan" aria-label="ქეისებისა და კომერციული პაკეტის პირადი გეგმა"><h4>ჩემი ნივთების გეგმა</h4><p>მონიშნე მოთხოვნები ცალკე ნივთებად. SILVER ქეისში არის 1 ნივთი; GOLD ქეისში — 12 ნივთი. ორივე ხაზს აქვს 12 Brand Line.</p><div><span>GOLD · {casePlan.gold} არჩეული ნივთი · ქეისები დასადასტურებელია</span><span>SILVER · {casePlan.silver} ნივთი / დაგეგმილი ქეისი</span><strong>სულ: {casePlan.total} არჩეული ნივთი</strong></div><p>GOLD: ერთ პაკეტსა და ფიზიკურ ქეისში 12 ნივთი, ჯამურად 1,000 გ კომპოზიტის ფარგლებში. საჭირო ქეისების / პაკეტების რაოდენობა დასადასტურებელია — მხოლოდ ნივთების დათვლა არ კმარა; საჭიროა CORE-ის დადასტურებული წონა და შეფუთვის ჩანაწერიც.</p>{casePlan.goldExceedsSinglePackageSlots&&<p role="status">არჩეული GOLD ნივთები ერთი პაკეტის 12 ადგილს აღემატება. დამატებითი პაკეტის პირობები CORE-ში უნდა გადამოწმდეს.</p>}<p>დადასტურებული პაკეტები, ადგილები და Coin-ების რაოდენობა — CORE-ის დაკავშირების მოლოდინში.</p><small>ეს არჩევანი ამ გახსნილ გვერდზე ინახება და განახლებისას გასუფთავდება. გეგმა არ ქმნის პაკეტის შეძენას, ადგილის დაფიქსირებას, შეკვეთას, გადახდას ან წარმოების ავტორიზაციას.</small></div>
    <details><summary>ჩემი მოთხოვნები · {records.length}</summary>
      <button type="button" className="text-link" disabled={loading || busy || !signedIn} onClick={() => void load()}>{loading ? 'იტვირთება…' : 'სიის განახლება'}</button>
      {!records.length && !loading && <p className="fine-note">შენახული მოთხოვნები ჯერ არ ჩანს.</p>}
      <div className="core-record-list">{records.map(record => <div key={record.id} className="atelier-saved-row"><label><input type="checkbox" checked={selectedForPlan.includes(record.id)} disabled={busy} onChange={event=>setSelectedForPlan(current=>event.target.checked?[...new Set([...current,record.id])]:current.filter(id=>id!==record.id))}/><span>ჩემს გეგმაში</span></label><button type="button" disabled={busy} onClick={() => { onRestore(record.intent); setSavedPayload(JSON.stringify(record.intent)); setMessage('შენახული მოთხოვნა გაიხსნა. ცვლილებები ახალ მონახაზად შეინახება.'); }}><span><strong>{record.intent.description.slice(0, 90)}</strong><small>{record.intent.coin_line} · {cityHouses.find(house => house.id === record.intent.experience_house_id)?.title} · {new Date(record.created_at).toLocaleDateString('ka-GE')}</small><small>კონცეფცია · გენერაციის კავშირის მოლოდინში</small></span><span>გახსნა</span></button></div>)}</div>
    </details>
    <p className="fine-note">ეს არის კერძო მოთხოვნის მონახაზი. CORE პროდუქტი, Brand House, გენერაციის დავალება, შეთავაზება და შეკვეთა ჯერ არ შექმნილა.</p>
  </section>;
}
