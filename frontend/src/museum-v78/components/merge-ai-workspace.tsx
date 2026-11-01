"use client";
import {useEffect,useId,useState,type MutableRefObject} from 'react';
import {ArrowLeft,ArrowRight,BarChart3,Bot,Building2,CalendarDays,ChevronRight,Coins,Globe2,House,LayoutDashboard,LifeBuoy,Mail,MessageSquare,Palette,RefreshCw,ShieldCheck,ShoppingBag,Wallet} from 'lucide-react';
import {CompanyWordmark} from '@/museum-v78/components/company-identity';
import {useCoreRead} from '@/museum-v78/components/core-context';
import {BrandActivitySummary,BrandEmailSetup,BrandIdentityPanel,ContentPreferences,LaunchReview,PersonalMERGEAIChat,SocialAccountConnections,SocialGalleryPreview,type BriefChange} from '@/museum-v78/components/merge-ai-panels';
import {emptyManagerBrief,officialOrderLaw,prepareManagerBrief,type ManagerBriefInput} from '@/museum-v78/lib/merge-ai-manager';
import {CommercialAllocationLaw} from '@/museum-v78/components/commercial-allocation-law';
import {BrandManagerWorkbench} from '@/museum-v78/components/brand-manager-workbench';
import type {BrandWorkItem} from '@/museum-v78/lib/brand-manager-workbench';
import {ContextPhotoSequence,FounderStoryboard} from './photo-scenario';
import {clientRequestId} from '@/museum-v78/lib/client-request-id';

export type ManagerWorkspaceMemory={brief:ManagerBriefInput;items:BrandWorkItem[]};
type WorkspaceProps={initialSection?:string;onStage?:(id:number)=>void;onOriginal?:(image:string)=>void;signedIn:boolean;onIdentity?:()=>void;onOrders?:()=>void;memory?:MutableRefObject<ManagerWorkspaceMemory|null>};
export function MERGEBrandHeader(){return <header className="mai-topbar"><a className="mai-company" href="/" aria-label="MERGE STARS Museum home"><CompanyWordmark/></a><nav aria-label="MERGE workspace navigation"><a href="/"><House size={18}/>Museum</a><a href="#mai-brand"><Building2 size={18}/>Brand House</a><a href="#mai-orders"><LayoutDashboard size={18}/>Brand Lines</a><a href="#mai-orders"><ShoppingBag size={18}/>Orders</a><a href="#mai-activity"><Wallet size={18}/>Wallet</a><a href="#mai-activity"><Coins size={18}/>Commissions</a><a href="#mai-manager" className="selected" aria-current="page"><Bot size={18}/>MERGE AI</a></nav><div className="mai-account"><ShieldCheck size={18}/><span>CORE IDENTITY<small>Connection pending</small></span></div></header>;}
const sideLinks=[{label:'Working desk',id:'mai-workbench',icon:Palette},{label:'Overview',id:'mai-manager',icon:LayoutDashboard},{label:'My brand',id:'mai-brand',icon:Building2},{label:'AI Manager',id:'mai-manager',icon:Bot},{label:'Social media',id:'mai-social',icon:Globe2},{label:'Email & domain',id:'mai-email',icon:Mail},{label:'Content studio',id:'mai-content',icon:Palette},{label:'Schedule',id:'mai-review',icon:CalendarDays},{label:'Analytics',id:'mai-activity',icon:BarChart3},{label:'Orders',id:'mai-orders',icon:ShoppingBag},{label:'Commissions',id:'mai-activity',icon:Coins},{label:'AI conversation',id:'mai-chat',icon:MessageSquare},{label:'Connection status',id:'mai-connection',icon:LifeBuoy}];
function OfficialOrderJourney({onOrders}:{onOrders?:()=>void}){
  const [choice,setChoice]=useState<'NOW'|'LATER'>('NOW');
  return <section className="mai-card mai-orders" id="mai-orders" data-order-authority={officialOrderLaw.orderAuthority}><div className="mai-orders-heading"><div><span className="mai-kicker">ONE BRAND HOUSE · 12 BRAND LINES</span><h2>Create first. Confirm your orders. Choose how to pay.</h2></div><ShoppingBag size={26}/></div>
    <ol className="mai-order-journey">{['Register · CORE identity','Create 12 models','Register each generated item in CORE','PAY NOW or PAY LATER','Verified settlement','Authorized production'].map((v,i)=><li key={v}><span>{String(i+1).padStart(2,'0')}</span>{v}</li>)}</ol>
    <p className="mai-note">Each successfully generated item must be registered as an unpaid order within the authorized generation action, with a real CORE Order ID and no second post-generation order action. Missing CORE registration remains pending. No upfront payment or wait for 1,000 registrations is required to create models or register unpaid orders. A saved draft alone is not an order.</p>
    <details className="mai-line-places"><summary>View the 12 Brand Line places <ChevronRight size={15}/></summary><p className="mai-note">Planning places only. These are not existing Brand Line IDs, saved models or confirmed orders.</p><ol>{Array.from({length:12},(_,i)=><li key={i}><strong>Line {String(i+1).padStart(2,'0')}</strong><span>Model pending</span><small>CORE Order ID pending</small></li>)}</ol></details>
    <div className="mai-funding" role="group" aria-label="Read the payment route conditions"><button type="button" aria-pressed={choice==='NOW'} onClick={()=>setChoice('NOW')}>PAY NOW</button><button type="button" aria-pressed={choice==='LATER'} onClick={()=>setChoice('LATER')}>PAY LATER</button></div>
    <p className="mai-note" aria-live="polite">{choice==='NOW'?'Pay only against the applicable CORE verified offer and confirmed order. Opening checkout is not proof of payment.':'Campaign eligibility comes from CORE. Deferred orders remain real unpaid orders until settled from actually earned, verified AVAILABLE commissions. Future earnings, social activity and pending balances are not payment.'}</p>
    <div className="mai-package-rule"><span>SILVER CASE<strong>1 product</strong></span><span>GOLD PACKAGE / CASE<strong>Up to 12 products</strong><small>Within the approved aggregate weight</small></span></div>
    <p className="mai-note">Twelve Order IDs do not mean twelve paid Coins or twelve funded products. Production requires verified settlement, technical and rights approval, and CORE authorization. Order counts come only from actual CORE records.</p>
    {onOrders&&<button type="button" className="mai-secondary" onClick={onOrders}>View the existing order workflow<ArrowRight size={15}/></button>}
    <button type="button" className="mai-secondary" disabled>Confirm official orders · CORE required</button><details className="mai-allocation"><summary>Approved allocation specification</summary><CommercialAllocationLaw language="en"/></details>
  </section>;
}
export function MERGEAIManagerPage({initialSection,onStage,onOriginal,signedIn,onIdentity,onOrders,memory:memoryRef}:WorkspaceProps){
  const scope=useId(),core=useCoreRead<unknown>(signedIn?'/api/core/brand-house':null);
  const [activeSection,setActiveSection]=useState('AI Manager');
  // Read the owner's transient snapshot only when this keyed workspace mounts.
  // eslint-disable-next-line react-hooks/refs -- Lazy state initialization; subsequent rendering uses state, not this snapshot.
  const [draft,setDraft]=useState<ManagerBriefInput>(()=>memoryRef?.current?.brief??({...emptyManagerBrief,channels:[],deliverables:[...emptyManagerBrief.deliverables]}));
  const [prepared,setPrepared]=useState<ReturnType<typeof prepareManagerBrief>>(null);
  // eslint-disable-next-line react-hooks/refs -- Same mount-only restoration; account changes remount/reset the workspace.
  const [workItems,setWorkItems]=useState<BrandWorkItem[]>(()=>memoryRef?.current?.items??[]);
  useEffect(()=>{setDraft(memoryRef?.current?.brief??({...emptyManagerBrief,channels:[],deliverables:[...emptyManagerBrief.deliverables]}));setWorkItems(memoryRef?.current?.items??[]);setPrepared(null);},[signedIn,memoryRef]);
  useEffect(()=>{if(memoryRef)memoryRef.current={brief:draft,items:workItems};},[draft,workItems,memoryRef]);
  useEffect(()=>{if(!initialSection)return;const frame=requestAnimationFrame(()=>document.getElementById(initialSection)?.scrollIntoView({block:'start',behavior:'auto'}));return()=>cancelAnimationFrame(frame);},[initialSection]);
  const change:BriefChange=(key,value)=>{setDraft(current=>({...current,[key]:value}));setPrepared(null);};
  // ChatGPT's private Museum session is not a MERGE CORE session. Unknown or
  // unvalidated responses cannot supply a brand, account or connected badge.
  return <section className="merge-ai-workspace" lang="en" aria-label="MERGE AI personal brand management center" data-social-state="PREPARATION_ONLY" data-core-state="INTEGRATION_REQUIRED">
    <MERGEBrandHeader/>
    <header className="mai-hero"><div className="mai-bot"><Bot size={59} strokeWidth={1.3}/><span>MERGE AI</span></div><div><span className="mai-kicker">YOUR PERSONAL BRAND MANAGEMENT CENTER</span><h1>MERGE AI</h1><p>Your brand. Your vision. Your world.</p><small>Prepare your identity, connect your channels and shape what comes next.</small></div><div className="mai-hero-motto"><strong>One vision. A world of possibilities.</strong><span>AI · SOCIAL · BRAND · GROWTH</span></div></header>
    <div className="mai-shell"><aside className="mai-sidebar" aria-label="Brand manager sections"><div><Bot size={20}/><strong>MERGE AI</strong></div><nav>{sideLinks.map(link=><a href={'#'+link.id} key={link.label} aria-current={activeSection===link.label?'location':undefined} onClick={()=>setActiveSection(link.label)}><link.icon size={17}/>{link.label}</a>)}</nav><div className="mai-sidebar-brand"><CompanyWordmark/><small>ONE CORE. ONE HISTORY.</small></div></aside>
    <div id="mai-manager" className="mai-main" role="region" aria-label="Brand management workspace">
      <nav className="mai-progress" aria-label="Brand preparation steps">{[['01','Brand information','mai-brand'],['02','Brand email','mai-email'],['03','Social networks','mai-social'],['04','Content style','mai-content'],['05','Final review','mai-review']].map(([n,label,id])=><a href={'#'+id} key={id}><span>{n}</span>{label}<ChevronRight size={12}/></a>)}</nav>
      <div className="mai-connection" id="mai-connection" role="status"><ShieldCheck size={20}/><div><strong>Working brief available · CORE integration pending</strong><p>{signedIn?'Private Museum session detected. This does not establish a MERGE CORE identity or authorized Brand House.':'Your existing MERGE CORE identity is required for account data and external actions.'} {core.error&&<span>CORE status: {core.error.replaceAll('_',' ')}.</span>}</p></div>{onIdentity&&<button type="button" className="mai-secondary" onClick={onIdentity}>Existing identity<ArrowRight size={13}/></button>}<button type="button" className="mai-icon-button" disabled={!signedIn} onClick={core.retry} aria-label="Retry the CORE Brand House connection"><RefreshCw size={17}/></button></div>
      <ContextPhotoSequence context="ai" onOriginal={onOriginal}/>{onStage&&<FounderStoryboard group="brand" onStage={onStage}/>}
      <BrandManagerWorkbench brief={draft} items={workItems} onChange={setWorkItems} onImport={(brief,items)=>{setDraft(brief);setWorkItems(items);setPrepared(null);}}/>
      <form className="mai-onboarding" noValidate aria-label="Prepare a private brand brief" onSubmit={e=>{e.preventDefault();setPrepared(prepareManagerBrief(draft));}}>
        <BrandIdentityPanel draft={draft} change={change}/><BrandEmailSetup draft={draft} change={change}/><SocialAccountConnections key={scope+signedIn} draft={draft} change={change}/><ContentPreferences draft={draft} change={change}/><LaunchReview key={prepared?.text??'unprepared'} draft={draft} prepared={prepared} onPrepare={()=>setPrepared(prepareManagerBrief(draft))}/>
      </form>
      <div className="mai-lower"><OfficialOrderJourney onOrders={onOrders}/><BrandActivitySummary/><SocialGalleryPreview/></div>
    </div><aside className="mai-assistant"><PersonalMERGEAIChat key={scope+signedIn} signedIn={signedIn} brief={draft} onDraft={workItems.length<60?body=>setWorkItems(v=>[...v,{local_id:clientRequestId(),kind:'AI response',title:'MERGE AI · working draft',body,review:'DRAFT'}].slice(0,60) as BrandWorkItem[]):undefined}/><div className="mai-private-note"><ShieldCheck size={19}/><strong>YOUR BRAND. YOUR CONTROL.</strong><p>Drafts stay in this workspace until you copy or download them. No account, order, publication or payment is created here.</p><a href="/">Return to the Living Museum<ArrowLeft size={14}/></a></div></aside></div>
  </section>;
}
