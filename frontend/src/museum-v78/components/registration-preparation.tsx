import { museumV78Fetch } from '@/museum-v78/transport';
"use client";
import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, LockKeyhole, ShieldCheck, UserRound } from 'lucide-react';
import { personalPreparation, deliveryPreparation, purposePreparation, registrationPurposes } from '@/museum-v78/lib/registration-preparation';
const steps = ['პირადი ინფორმაცია','მიწოდება','შენი მიზანი','დადასტურება'];
export function RegistrationPreparation({ onPayment }: { onPayment: () => void }) {
  const [step,setStep]=useState(0),[errors,setErrors]=useState<Record<string,string>>({}),[retry,setRetry]=useState(false),[status,setStatus]=useState('რეგისტრაციისთვის და პროფილისთვის გამოიყენე არსებული MERGE ანგარიში. ეს ფორმა მოსამზადებელი მონახაზია.');
  const [personal,setPersonal]=useState({first_name:'',last_name:'',email:'',phone:'',country:'',region:''});
  const [delivery,setDelivery]=useState({country:'',region:'',city:'',street:'',building:'',apartment:'',postal_code:'',recipient_name:'',recipient_phone:'',instructions:''});
  const [purpose,setPurpose]=useState<typeof registrationPurposes[number]['id']>('BOTH'),[confirmed,setConfirmed]=useState(false);
  const heading=useRef<HTMLHeadingElement>(null),retrying=useRef(false);
  function next() {
    const result=step===0?personalPreparation.safeParse(personal):step===1?deliveryPreparation.safeParse(delivery):purposePreparation.safeParse({purpose,confirmed});
    if(!result.success){const values:Record<string,string>={};for(const issue of result.error.issues)values[String(issue.path[0])]=issue.message;setErrors(values);return;}
    setErrors({});setStep(value=>Math.min(3,value+1));requestAnimationFrame(()=>heading.current?.focus());
  }
  async function checkCore() {
    if(retrying.current)return;retrying.current=true;setRetry(true);const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
    try{const response=await museumV78Fetch('/api/core/authentication',{credentials:'same-origin',cache:'no-store',signal:controller.signal});
      // Never trust a successful HTTP response as identity/profile completion.
      setStatus(response.ok ? 'არსებული MERGE სესია დადასტურებულია. პროფილი და რეგისტრაცია იმართება შენს ანგარიშში.' : response.status===401 ? 'შედი არსებულ MERGE ანგარიშში ან გაიარე რეგისტრაცია.' : 'სესიის შემოწმება დროებით მიუწვდომელია.');
    }catch{setStatus('CORE-ის მდგომარეობა ვერ შემოწმდა. პირადი ინფორმაცია არ გაგზავნილა.');}finally{clearTimeout(timer);setRetry(false);retrying.current=false;}
  }
  function input(key:string,label:string,value:string,set:(value:string)=>void,type='text',autoComplete='off',required=true) {
    return <label className="registration-field" key={key}><span>{label}{required?' *':''}</span><input id={`merge-register-${key}`} name={key} type={type} value={value} maxLength={key==='instructions'?500:key==='street'?240:254} autoComplete={autoComplete} required={required} aria-invalid={!!errors[key]} aria-describedby={errors[key]?`error-${key}`:undefined} onChange={event=>set(key==='country'?event.target.value.toUpperCase():event.target.value)}/>{errors[key]&&<small id={`error-${key}`} role="alert">{errors[key]}</small>}</label>;
  }
  return <section className="registration-preparation" aria-label="MERGE რეგისტრაციის მომზადება">
    <div className="generation-heading"><UserRound size={24}/><div><span className="eyebrow">CREATE YOUR MERGE ID</span><h3>შენი იდენტობა. შენი სამყარო.</h3></div></div>
    <div className="registration-core-note"><LockKeyhole size={18}/><div><strong>რეგისტრაცია CORE-ის დაკავშირებას ელოდება</strong><p>შეგიძლია მოამზადო ფორმა. მონაცემები მხოლოდ გახსნილ ეკრანში რჩება; დახურვისას იშლება. CORE-ში ანგარიში, მისამართი ან Master ID ჯერ არ იქმნება.</p></div></div>
    <ol className="registration-steps" aria-label="ფორმის ეტაპები">{steps.map((title,i)=><li key={title} aria-current={step===i?'step':undefined}><span>{i+1}</span>{title}</li>)}</ol>
    <h3 ref={heading} tabIndex={-1}>{steps[step]}</h3>
    <form autoComplete="off" onSubmit={event=>{event.preventDefault();if(step<3)next();}}>
      {step===0&&<div className="registration-fields">
        {input('first_name','სახელი',personal.first_name,v=>setPersonal(p=>({...p,first_name:v})), 'text','given-name')}
        {input('last_name','გვარი',personal.last_name,v=>setPersonal(p=>({...p,last_name:v})), 'text','family-name')}
        {input('email','ელფოსტა',personal.email,v=>setPersonal(p=>({...p,email:v})), 'email','email')}
        {input('phone','ტელეფონი (+ ქვეყნის კოდი)',personal.phone,v=>setPersonal(p=>({...p,phone:v})), 'tel','tel')}
        {input('country','ქვეყნის კოდი (მაგ. GE)',personal.country,v=>setPersonal(p=>({...p,country:v})), 'text','country')}
        {input('region','ქალაქი / რეგიონი',personal.region,v=>setPersonal(p=>({...p,region:v})), 'text','address-level1')}
      </div>}
      {step===1&&<><p className="fine-note">მიწოდების მისამართი აუცილებელია. რეგიონისა და ZIP-ის ქვეყნის-specific წესს CORE ამოწმებს; ამ ეკრანის ვალიდაცია საბოლოო მისამართის დადასტურება არ არის.</p><div className="registration-fields">
        {input('country','მიწოდების ქვეყნის კოდი',delivery.country,v=>setDelivery(p=>({...p,country:v})), 'text','shipping country')}
        {input('region','რეგიონი / შტატი',delivery.region,v=>setDelivery(p=>({...p,region:v})), 'text','shipping address-level1',false)}
        {input('city','ქალაქი',delivery.city,v=>setDelivery(p=>({...p,city:v})), 'text','shipping address-level2')}
        {input('street','ქუჩა',delivery.street,v=>setDelivery(p=>({...p,street:v})), 'text','shipping address-line1')}
        {input('building','სახლი / შენობა',delivery.building,v=>setDelivery(p=>({...p,building:v})))}
        {input('apartment','ბინა / ოფისი',delivery.apartment,v=>setDelivery(p=>({...p,apartment:v})), 'text','shipping address-line2',false)}
        {input('postal_code','ZIP / საფოსტო ინდექსი (სადაც გამოიყენება)',delivery.postal_code,v=>setDelivery(p=>({...p,postal_code:v})), 'text','shipping postal-code',false)}
        {input('recipient_name','მიმღების სახელი და გვარი',delivery.recipient_name,v=>setDelivery(p=>({...p,recipient_name:v})), 'text','shipping name')}
        {input('recipient_phone','მიმღების ტელეფონი',delivery.recipient_phone,v=>setDelivery(p=>({...p,recipient_phone:v})), 'tel','shipping tel')}
        {input('instructions','მიწოდების მითითება',delivery.instructions,v=>setDelivery(p=>({...p,instructions:v})), 'text','off',false)}
      </div></>}
      {step===2&&<><div className="registration-purposes">{registrationPurposes.map(item=><label key={item.id}><input type="radio" name="purpose" checked={purpose===item.id} onChange={()=>{setPurpose(item.id);setConfirmed(false);}}/><span>{item.title}</span></label>)}</div><label className="registration-confirm"><input type="checkbox" checked={confirmed} onChange={event=>setConfirmed(event.target.checked)}/>ვადასტურებ ჩემს არჩევანს</label>{errors.confirmed&&<p role="alert">{errors.confirmed}</p>}<p className="fine-note">ორივე გზა ხილული იქნება; რეალურ მოქმედებებს არსებული CORE უფლებები გახსნის.</p></>}
      {step===3&&<><div className="registration-core-note"><ShieldCheck size={20}/><div><strong>ფორმა მომზადებულია — რეგისტრაცია დასრულებული არ არის</strong><p>საჭიროა არსებული Master ID-ის მოძიება, კონტაქტების დადასტურება, ასაკობრივი პოლიტიკა, ქვეყნის მიხედვით მისამართის შემოწმება და CORE-ის მოქმედი Terms / Privacy დოკუმენტები. თანხმობას დოკუმენტის გარეშე არ ვითხოვთ.</p></div></div><div className="registration-levels"><p><strong>LEVEL 1</strong> — პროფილი და აუცილებელი კონტაქტები</p><p><strong>LEVEL 2</strong> — კონკრეტული შეკვეთისთვის მზადყოფნა</p><p><strong>LEVEL 3</strong> — შესაბამისი ფინანსური შემოწმება</p></div><p className="fine-note">არც ერთი VERIFIED სტატუსი ამ ფორმით არ მინიჭებულა. ძველი შეკვეთის მისამართის snapshot CORE-ში უცვლელი უნდა დარჩეს.</p><button className="button light" type="button" disabled>რეგისტრაციის დასრულება — CORE საჭიროა</button></>}
      <div className="registration-actions">{step>0&&<button type="button" className="button outline" onClick={()=>{setErrors({});setStep(s=>s-1);}}><ArrowLeft size={16}/>უკან</button>}{step<3&&<button type="submit" className="button light">შემდეგი ეტაპი<ArrowRight size={16}/></button>}</div>
    </form>
    <nav aria-label="MERGE account"><a className="button light" href="/login?tab=register">MERGE ანგარიშზე შესვლა / რეგისტრაცია</a><a className="button outline" href="/dashboard/profile">My MERGE profile</a></nav>
    <p className="fine-note" role="status">{status}</p><button className="text-link" disabled={retry} onClick={()=>void checkCore()}>{retry?'ვამოწმებ…':'CORE კავშირის შემოწმება'}</button><button className="text-link" onClick={onPayment}>ახლავე / საკომისიოდან — პირობები<ArrowRight size={15}/></button>
  </section>;
}
