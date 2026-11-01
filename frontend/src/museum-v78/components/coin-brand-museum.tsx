"use client";
import { useId, useState } from 'react';
import { AtelierLibrary } from '@/museum-v78/components/atelier-library';
import { ArrowRight, Building2, Check, Coins, Copy, LockKeyhole, RefreshCw, Sparkles } from 'lucide-react';
import { useCoreRead } from '@/museum-v78/components/core-context';
import { CompanyMark } from '@/museum-v78/components/company-identity';
import { CoinPackagePreview } from '@/museum-v78/components/gold-package-preview';
import { FilamentPreference } from '@/museum-v78/components/filament-preference';
import { coinMuseumLine, coinMuseumLines, prepareMuseumDesignBrief, type CoinMuseumLine } from '@/museum-v78/lib/coin-museum';
import { cityHouses } from '@/museum-v78/lib/megapolis-domain';
import { coreReadMessages } from '@/museum-v78/lib/core-read-state';
import { privateCreationPath, privateCreationTarget } from '@/museum-v78/lib/private-creation-path';
import { ProductStudioConfigurator } from '@/museum-v78/components/product-studio-configurator';
import type { MaterialPreference } from '@/museum-v78/lib/museum-domain';

export type BrandMuseumIntent = { house: string; category: string; description: string; material: MaterialPreference };
export function emptyBrandMuseumIntent(line: CoinMuseumLine): BrandMuseumIntent {
  return { house: '', category: '', description: '', material: { base_filament: '', precious_metal: coinMuseumLine(line).metal, integration: '', intended_use: '', details: '' } };
}

export function CoinMuseumGateway({ line, onLine, onMuseum, onRules, disabled }: { line: CoinMuseumLine; onLine: (line: CoinMuseumLine) => void; onMuseum: () => void; onRules: () => void; disabled: boolean }) {
  const access = useCoreRead<unknown>('/api/core/coin-access');
  return <section className="coin-museum-gateway" aria-label="MERGE Coin და საკუთარი Brand Museum">
    <div className="coin-museum-intro"><CompanyMark/><div><span className="eyebrow">12 INDUSTRIES · YOUR BRAND LINES</span><h3>აირჩიე HOUSE. დაგეგმე შენი ნივთები.</h3><p>ორივე Coin ხსნის 12 Brand Line-ს. SILVER ქეისში მზადდება 1 ნივთი; GOLD ქეისში — 12. დიზაინის მოთხოვნების მომზადება შეგიძლია წინასწარი გადახდის გარეშე.</p></div></div>
    <div className="coin-museum-lines" role="group" aria-label="აირჩიე Coin-ის ხაზი">{coinMuseumLines.map(value=><button key={value.line} data-line={value.line.toLowerCase()} aria-pressed={line===value.line} disabled={disabled} onClick={()=>onLine(value.line)}><span className="eyebrow">{value.label}</span><strong>{value.creation}</strong><span>დიზაინის შენახვა ≠ გადახდა</span><small>{value.basis}</small></button>)}</div>
    <div className="coin-museum-access"><Coins size={18}/><p role="status">დადასტურებული Coin-ები და ანგარიშსწორება: {access.error?coreReadMessages[access.error]:'CORE-ში გადამოწმების მოლოდინშია.'}</p><button className="text-link" disabled={disabled} onClick={access.retry} aria-label="Coin-ის უფლების გადამოწმების ხელახლა ცდა"><RefreshCw size={15}/></button></div>
    <div className="coin-museum-actions"><button className="button" disabled={disabled} onClick={onMuseum}><Building2 size={17}/>ჩემი Brand Museum<ArrowRight size={16}/></button><button className="text-link" disabled={disabled} onClick={onRules}>Coin · ფასი და წესები</button></div>
    <p className="fine-note">ხაზის არჩევა სურვილს აფიქსირებს. გადახდა ნებაყოფლობითია; შესაბამისი დაფარვა და წარმოების ავტორიზაცია CORE-ში ცალ-ცალკე მოწმდება. ეს ხედი მოქმედ Brand Line-ს ან შეკვეთას არ ქმნის.</p>
  </section>;
}

export function BrandMuseumAtelier({ onArchitect,onPersonalAI,line, intent, onIntent, onLine, signedIn, onIdentity, onRules }: { onArchitect?:()=>void;onPersonalAI?:()=>void; line: CoinMuseumLine; intent: BrandMuseumIntent; onIntent: (intent: BrandMuseumIntent) => void; onLine: (line: CoinMuseumLine) => void; signedIn: boolean; onIdentity: () => void; onRules: () => void }) {
  const id=useId(), [copied,setCopied]=useState(false),[copyError,setCopyError]=useState(false);
  const [creationStep,setCreationStep]=useState('home');
  const owner=useCoreRead<unknown>('/api/core/brand-house'), generation=useCoreRead<unknown>('/api/core/generate');
  const house=cityHouses.find(value=>value.id===intent.house), rule=coinMuseumLine(line);
  const brief=prepareMuseumDesignBrief({experience_house_id:intent.house,experience_category:intent.category,coin_line:line,description:intent.description,material_preference:intent.material});
  function change(patch:Partial<BrandMuseumIntent>){setCopied(false);setCopyError(false);onIntent({...intent,...patch});}
  async function copy(){if(!brief)return;setCopyError(false);try{await navigator.clipboard.writeText(brief);setCopied(true);}catch{setCopyError(true);}}
  return <section className="brand-museum-atelier" aria-label="საკუთარი Brand Museum-ის დიზაინის მომზადება">
    <div className="brand-museum-owner"><Building2 size={23}/><div><span className="eyebrow">MY LIVING BRAND MUSEUM</span><h3>შენი ბრენდი. შენი ნივთების სამყარო.</h3><p role="status">{owner.error?coreReadMessages[owner.error]:'არსებული CORE Brand House-ის გადამოწმების მოლოდინშია.'}</p></div></div>
    <p>ერთი მფლობელი — ერთი არსებული Brand House. ახალი დიზაინი მას ემატება; კატეგორიის ან Coin-ის არჩევა მეორე ბრენდს არ ქმნის.</p>
    {onArchitect&&<details className="private-house-transform-entry"><summary>Private House transformation · architectural study</summary><p>Try a whole-House composition, then save and restore private scene versions. Your existing Brand Museum stays in place.</p><button className="button outline" type="button" onClick={onArchitect}><Building2 size={16}/>Transform a private House study<ArrowRight size={15}/></button></details>}
    <nav aria-label="პირადი შექმნის მიმართულებები" className="atelier-coin-selector">{privateCreationPath.map(step=><button type="button" key={step.id} aria-pressed={creationStep===step.id} onClick={()=>setCreationStep(step.id)}>{step.label}</button>)}</nav>
    <div role="group" aria-label="აირჩიე შესაქმნელი ობიექტი" className="coin-museum-actions">{privateCreationPath.find(step=>step.id===creationStep)?.options.map(option=><button type="button" className="button outline" key={option.label} aria-pressed={intent.house===option.house&&intent.category===privateCreationTarget(option.house,option.categoryIndex)?.category} onClick={()=>{const target=privateCreationTarget(option.house,option.categoryIndex);if(target)change(target);}}>{option.label}</button>)}</div>
    <p className="fine-note">ავტომობილი და მოტოციკლი ცალ-ცალკე დიზაინებად მზადდება. მიმართულების შეცვლა აღწერას არ შლის და არც გენერაციას ან გადახდას იწყებს.</p>
    {onPersonalAI&&<button type="button" className="button outline" onClick={onPersonalAI}><Sparkles size={16}/>ჩემი MERGE AI · სოციალური ბრენდის მომზადება</button>}
    {!signedIn&&<button className="button outline" onClick={onIdentity}>იდენტობის მომზადება<ArrowRight size={15}/></button>}
    <div className="atelier-coin-selector" role="group" aria-label="Brand Museum-ის Coin ხაზი">{coinMuseumLines.map(value=><button key={value.line} data-line={value.line.toLowerCase()} aria-pressed={line===value.line} onClick={()=>{setCopied(false);setCopyError(false);onLine(value.line);}}>{value.label}</button>)}</div>
    <div className="atelier-product-rule"><Coins size={19}/><div><strong>{rule.creation}</strong><p>{rule.capacity}</p><small>ორივე ხაზი — 12 Brand Line. SILVER ქეისი — 1 ნივთი; GOLD ქეისი — 12 ნივთი. GOLD-ის 1,000 გ კომპოზიტის ჯამური ლიმიტი და LIVE ლითონის ფასის ერთეული განსხვავებული მონაცემებია.</small></div></div>
    <CoinPackagePreview line={line}/>
    <form onSubmit={event=>event.preventDefault()}>
      <label htmlFor={id+'-house'}>რომელ HOUSE-ში იქმნება ნივთი?</label><select id={id+'-house'} value={intent.house} required onChange={event=>change({house:event.target.value,category:''})}><option value="">აირჩიე მიმართულება</option>{cityHouses.map(value=><option key={value.id} value={value.id}>{value.title} · {value.name}</option>)}</select>
      <label htmlFor={id+'-category'}>ნივთის კატეგორია</label><select id={id+'-category'} value={intent.category} required disabled={!house} onChange={event=>change({category:event.target.value})}><option value="">აირჩიე ნივთის ტიპი</option>{house?.categories.map(value=><option key={value} value={value}>{value}</option>)}</select>
      <label htmlFor={id+'-design'}>აღწერე შენი ახალი დიზაინი</label><textarea id={id+'-design'} value={intent.description} required minLength={10} maxLength={3000} rows={4} placeholder="ფორმა, სტილი, საკუთარი ლოგო, ფუნქცია და სასურველი დეტალები" onChange={event=>change({description:event.target.value})}/>
      {house&&<ProductStudioConfigurator key={house.id+':'+intent.category} houseId={house.id} description={intent.description} onApply={description=>change({description})}/>}
      <FilamentPreference value={intent.material} lockedMetal={rule.metal} onChange={material=>change({material})}/>
      <p className="fine-note">{rule.metal==='gold'?'ოქროს':'ვერცხლის'} ცალკე კომპოზიტის მოთხოვნა · 1:2 თანაფარდობა: 33⅓% ლითონის კომპონენტი და 66⅔% შერჩეული პოლიმერული საფუძველი. დამტკიცებული რეცეპტი, პოლიმერი და პარტია Material Lab-იდან უნდა მოვიდეს.</p>
      <div className="atelier-generation-boundary"><Sparkles size={19}/><div><strong>ახალი 3D ნივთის გენერაცია</strong><p role="status">{generation.error?coreReadMessages[generation.error]:'გენერაციის სერვისისა და CORE შექმნის უფლების გადამოწმების მოლოდინშია.'}</p></div></div>
      <div className="brand-museum-atelier-actions"><button className="button" type="button" disabled><LockKeyhole size={16}/>3D გენერაცია — დაკავშირების მოლოდინში</button><button className="button outline" type="button" disabled={!brief} onClick={()=>void copy()}>{copied?<Check size={15}/>:<Copy size={15}/>} {copied?'მოთხოვნის მონახაზი დაკოპირებულია':'მოთხოვნის მონახაზის კოპირება'}</button></div>
      {copyError&&<div role="status"><p>ავტომატური კოპირება ვერ მოხერხდა. ტექსტი მონიშნე და დააკოპირე.</p><textarea readOnly value={brief??''} rows={6} aria-label="დიზაინის მოთხოვნის მონახაზი"/></div>}
    </form>
    <AtelierLibrary signedIn={signedIn} intent={{experience_house_id:intent.house,experience_category:intent.category,coin_line:line,description:intent.description,material_preference:intent.material}} onRestore={value=>{onLine(value.coin_line);onIntent({house:value.experience_house_id,category:value.experience_category,description:value.description,material:value.material_preference});setCopied(false);setCopyError(false);}}/>
    <ol className="brand-museum-save-path"><li>დიზაინისა და Brand Line-ის მოთხოვნა მზადდება წინასწარი გადახდის იძულების გარეშე; CORE ამოწმებს იდენტობასა და უფლებებს.</li><li>ავტორიზებული რეალური გენერაცია ქმნის ახალ ვერსიას და CORE-ში გადაუხდელი შეკვეთის რეგისტრაციას უნდა უკავშირდებოდეს; მხოლოდ ნამდვილი Order ID ადასტურებს რეგისტრაციას.</li><li>პირველი წარმატებული CORE შენახვა ავტომატურად ქმნის Brand House / Brand Line-ს, თუ არ არსებობს; არსებულს ახალი ნივთი ემატება.</li><li>ნებადართული საჯარო ექსპონატი მთავარ მუზეუმშიც იმავე ID-ით ჩანს.</li><li>მომხმარებელი ირჩევს დაფარვას. მხოლოდ შესაბამისი წარმოების ავტორიზაციის შემდეგ მზადდება ნივთი საკუთარ MERGE COIN ქეისში.</li></ol>
    <button className="text-link" onClick={onRules}>GOLD / SILVER · პირობების ნახვა<ArrowRight size={15}/></button>
    <p className="fine-note">მოთხოვნის კოპირება არ ქმნის CORE ჩანაწერს, 3D მოდელს, შეკვეთას ან გადახდას. რეალური შენახვა და ავტომატური განთავსება შესაბამის CORE კონტრაქტებს ელოდება.</p>
  </section>;
}
