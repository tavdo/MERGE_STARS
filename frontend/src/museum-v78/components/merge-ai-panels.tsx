"use client";
import {useId,useState} from 'react';
import {ArrowUpRight,AtSign, Check,ChevronRight,Copy,Download,FileCheck2,Globe2,ImageIcon,LockKeyhole, ShieldCheck,Sparkles} from 'lucide-react';
import {socialChannels,type SocialChannel} from '@/museum-v78/lib/social-brand-preparation';
import {type ManagerBriefInput,prepareManagerBrief} from '@/museum-v78/lib/merge-ai-manager';

export type BriefChange=<K extends keyof ManagerBriefInput>(key:K,value:ManagerBriefInput[K])=>void;
export function ManagerCardHeading({step,title,children}:{step:string;title:string;children?:React.ReactNode}){
  return <div className="mai-card-heading"><span>{step}</span><div><h2>{title}</h2>{children&&<p>{children}</p>}</div></div>;
}
export function BrandIdentityPanel({draft,change}:{draft:ManagerBriefInput;change:BriefChange}){
  const id=useId();return <section className="mai-card mai-identity" id="mai-brand">
    <ManagerCardHeading step="01" title="Brand information">Your identity. Your signature.</ManagerCardHeading>
    <div className="mai-source-note"><LockKeyhole size={14}/><span>CORE Brand House pending</span></div>
    <p className="mai-note">Prepare a brief below. Your official Brand House and owner details will load only from your authorized CORE session.</p>
    <label htmlFor={id+'-name'}>Brand name <span>*</span></label><input id={id+'-name'} autoComplete="off" required minLength={2} maxLength={100} value={draft.brand_name} placeholder="Your brand name" onChange={e=>change('brand_name',e.target.value)}/>
    <label htmlFor={id+'-industry'}>Industry</label><select id={id+'-industry'} value={draft.industry} onChange={e=>change('industry',e.target.value as ManagerBriefInput['industry'])}>{['Design & Lifestyle','Fashion','Jewelry & Watches','Art & Collectibles','Technology','Home & Furniture','Games & Toys','Music'].map(v=><option key={v}>{v}</option>)}</select>
    <label htmlFor={id+'-description'}>Brand description <span>*</span></label><textarea id={id+'-description'} rows={5} required minLength={10} maxLength={2000} value={draft.description} placeholder="Describe your style and the products you actually create." onChange={e=>change('description',e.target.value)}/>
    <div className="mai-brand-art"><ShieldCheck size={29}/><strong>YOUR BRAND<br/><span>YOUR LEGACY</span></strong><small>Authorized brand assets will appear here.</small></div>
    <button type="button" className="mai-secondary" disabled title="The CORE brand asset service is not connected."><ImageIcon size={15}/>Upload brand logo</button>
  </section>;
}
export function BrandEmailSetup({draft,change}:{draft:ManagerBriefInput;change:BriefChange}){
  const id=useId();return <section className="mai-card mai-email" id="mai-email">
    <ManagerCardHeading step="02" title="Brand email">A professional home for your brand.</ManagerCardHeading>
    <fieldset className="mai-radio-list"><legend className="mai-sr-only">Email setup preference</legend>{([['CREATE','Create brand email','An authorized mailbox provider is required.'],['EXISTING','Connect existing email','Keep your current mailbox and recovery.']] as const).map(([value,label,note])=><label key={value}><input type="radio" name={id+'-email'} checked={draft.email_setup===value} onChange={()=>change('email_setup',value)}/><span><strong>{label}</strong><small>{note}</small></span></label>)}</fieldset>
    <div className="mai-email-display"><AtSign size={20}/><div><strong>Provider setup required</strong><small>No mailbox has been created or verified.</small></div></div>
    <ul className="mai-ownership-list"><li><ShieldCheck size={16}/>You own your email and accounts.</li><li><ShieldCheck size={16}/>You control passwords and recovery.</li><li><ShieldCheck size={16}/>Official verification stays with you.</li><li><ShieldCheck size={16}/>Revoke authorized access at any time.</li></ul>
    <button type="button" className="mai-secondary" disabled><LockKeyhole size={14}/>{draft.email_setup==='CREATE'?'Create mailbox':'Connect mailbox'} · unavailable</button>
  </section>;
}
const channelOrder=['instagram','facebook','tiktok','linkedin','youtube','pinterest','x'];
export function SocialAccountConnections({draft,change}:{draft:ManagerBriefInput;change:BriefChange}){
  const id=useId();const [existing,setExisting]=useState<Partial<Record<SocialChannel,'UNKNOWN'|'EXISTING'|'NEW'>>>({});
  return <section className="mai-card mai-social" id="mai-social"><ManagerCardHeading step="03" title="Social networks">One brand. Your connected world.</ManagerCardHeading>
    <label htmlFor={id+'-mode'}>Registration path</label><select id={id+'-mode'} value={draft.registration_mode} onChange={e=>change('registration_mode',e.target.value as ManagerBriefInput['registration_mode'])}><option value="SELF">SELF REGISTRATION</option><option value="AI_ASSISTED">AI-ASSISTED REGISTRATION</option></select>
    <p className="mai-note">Choose channels for your brief. A selection is not a connection or publishing permission.</p>
    <div className="mai-social-rows">{channelOrder.map(value=>socialChannels.find(c=>c.id===value)!).map(channel=><article key={channel.id} className="mai-social-row" data-connection-state="SETUP_REQUIRED">
      <div className="mai-social-top"><label><input type="checkbox" checked={draft.channels.includes(channel.id)} onChange={e=>change('channels',e.target.checked?[...draft.channels,channel.id]:draft.channels.filter(v=>v!==channel.id))}/><span className={'mai-channel-icon mai-channel-'+channel.id} aria-hidden="true">{channel.name==='LinkedIn'?'in':channel.name.slice(0,1)}</span><strong>{channel.name}</strong></label><span className="mai-state">SETUP REQUIRED</span></div>
      {draft.channels.includes(channel.id)&&<div className="mai-social-options"><label className="mai-sr-only" htmlFor={id+'-'+channel.id}>{channel.name} account availability</label><select id={id+'-'+channel.id} value={existing[channel.id]??'UNKNOWN'} onChange={e=>setExisting(current=>({...current,[channel.id]:e.target.value as 'UNKNOWN'|'EXISTING'|'NEW'}))}><option value="UNKNOWN">Check existing account first</option><option value="EXISTING">I have an existing account</option><option value="NEW">I need a new account</option></select><a href={channel.url} target="_blank" rel="noopener noreferrer">{existing[channel.id]==='EXISTING'?'Open official account page':'Continue on official site'}<ArrowUpRight size={13}/></a><button type="button" className="mai-secondary" disabled><LockKeyhole size={12}/>{draft.registration_mode==='AI_ASSISTED'?'AI setup':'Connect existing account'} · unavailable</button></div>}
    </article>)}</div><p className="mai-note">Connection has not been verified. CAPTCHA, passwords and 2FA are completed with the official provider.</p>
  </section>;
}
export function ContentPreferences({draft,change}:{draft:ManagerBriefInput;change:BriefChange}){
  const id=useId();return <section className="mai-card mai-content" id="mai-content"><ManagerCardHeading step="04" title="Content style">Give your brand a consistent voice.</ManagerCardHeading>
    <label htmlFor={id+'-language'}>Content language</label><select id={id+'-language'} value={draft.content_language} onChange={e=>change('content_language',e.target.value as ManagerBriefInput['content_language'])}>{['English','French','German','Italian','Spanish'].map(v=><option key={v}>{v}</option>)}</select>
    <label htmlFor={id+'-tone'}>Brand tone</label><select id={id+'-tone'} value={draft.tone} onChange={e=>change('tone',e.target.value as ManagerBriefInput['tone'])}>{['Refined & editorial','Warm & personal','Bold & contemporary'].map(v=><option key={v}>{v}</option>)}</select>
    <fieldset className="mai-deliverables"><legend>Include in the working brief</legend>{(['Product captions','First 12 post ideas','Video outlines','Publishing calendar'] as const).map(v=><label key={v}><input type="checkbox" checked={draft.deliverables.includes(v)} onChange={e=>change('deliverables',e.target.checked?[...draft.deliverables,v]:draft.deliverables.filter(x=>x!==v))}/>{v}</label>)}</fieldset>
    <div className="mai-palette" aria-label="Approved black, gold and silver visual style"><span/><span/><span/><p>BLACK · GOLD · SILVER</p></div><p className="mai-note">These preferences prepare a brief. They do not start content generation or authorize publication.</p>
  </section>;
}
export function LaunchReview({draft,prepared,onPrepare}:{draft:ManagerBriefInput;prepared:ReturnType<typeof prepareManagerBrief>;onPrepare:()=>void}){
  const preparedId=useId();
  const [copyState,setCopyState]=useState<'IDLE'|'COPIED'|'FAILED'>('IDLE');
  const valid=prepareManagerBrief(draft)!==null;
  async function copy(){if(!prepared)return;try{await navigator.clipboard.writeText(prepared.text);setCopyState('COPIED');}catch{setCopyState('FAILED');}}
  function download(){if(!prepared)return;const url=URL.createObjectURL(new Blob([prepared.text],{type:'text/plain;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='MERGE-brand-working-brief.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),0);}
  return <section className="mai-card mai-review" id="mai-review"><ManagerCardHeading step="05" title="Final review">Prepare your brand. Connect when CORE is ready.</ManagerCardHeading>
    <div className="mai-review-status"><span><FileCheck2 size={17}/>{prepared?'Working brief prepared':'Working brief not prepared'}</span><span><LockKeyhole size={15}/>CORE identity pending</span><span><Globe2 size={15}/>{draft.channels.length} channels selected · unverified</span></div>
    <div className="mai-review-actions"><button type="button" className="mai-primary" disabled={!valid} onClick={()=>{setCopyState('IDLE');onPrepare();}}><Sparkles size={16}/>Prepare brand brief<ChevronRight size={16}/></button><button type="button" className="mai-secondary" disabled={!prepared} onClick={()=>void copy()}>{copyState==='COPIED'?<Check size={15}/>:<Copy size={15}/>} {copyState==='COPIED'?'Copied':'Copy brief'}</button><button type="button" className="mai-secondary" disabled={!prepared} onClick={download}><Download size={15}/>Download TXT</button><button type="button" className="mai-secondary" disabled><LockKeyhole size={14}/>Launch MERGE AI</button></div>
    {!valid&&<p className="mai-note">Enter a brand name (2–100 characters), description (10–2,000 characters), and select at least one channel and deliverable.</p>}
    {copyState==='FAILED'&&<p role="status" className="mai-note">Clipboard access failed. Select the brief below and copy it manually.</p>}
    {prepared&&<div className="mai-prepared" data-profile-state="PREPARATION_ONLY"><label htmlFor={preparedId}>Your working brief · assembled from your text</label><textarea id={preparedId} readOnly rows={7} value={prepared.text}/><p className="mai-note">Suggested handle: {prepared.proposedHandle?'@'+prepared.proposedHandle:'choose manually'} · availability not checked. This is a template, not an AI response. It is cleared when you leave this workspace.</p></div>}
  </section>;
}
export {PersonalMERGEAIChat} from './manager-live-chat';
export function SocialGalleryPreview(){return <section className="mai-card mai-gallery" id="mai-gallery"><ManagerCardHeading step="↗" title="Brand gallery">Your public stories, connected to real products.</ManagerCardHeading><div className="mai-empty"><ImageIcon size={28}/><strong>Authorized media pending</strong><p>Connected public posts, original videos, CORE product IDs and QR attribution will appear here after authorization.</p></div><div className="mai-gallery-actions">{['Watch video','View product','Fit to me','Create my version','Order'].map(v=><button type="button" disabled key={v}>{v}</button>)}</div><p className="mai-note">No demonstration posts, product claims or social metrics are substituted for your records.</p></section>;}
export function BrandActivitySummary(){return <section className="mai-card mai-activity" id="mai-activity"><ManagerCardHeading step="↗" title="Brand activity">Only confirmed CORE records.</ManagerCardHeading><dl>{['Brand visits','QR views','New orders','Verified payments','Available commissions','Deferred payment balance'].map(v=><div key={v}><dt>{v}</dt><dd>—<small>NOT AVAILABLE</small></dd></div>)}</dl><p className="mai-note">Likes, views and registrations do not create earnings. The existing 30+3-day policy, deferred-payment privilege and historical settlements remain in CORE.</p></section>;}
