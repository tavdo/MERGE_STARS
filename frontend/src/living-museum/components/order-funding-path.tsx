"use client";
import { useState } from 'react';
import { CircleDollarSign, LockKeyhole } from 'lucide-react';
export function OrderFundingPath() {
  const [choice,setChoice]=useState<'NOW'|'DEFERRED'>('NOW');
  return <section className="order-funding-path" aria-label="რეალური შეკვეთის დაფარვის გზები">
    <div className="generation-heading"><CircleDollarSign size={23}/><div><span className="eyebrow">REAL ORDERS · FIRST 1,000</span><h3>გადაიხადე ახლა ან საკომისიოდან</h3></div></div>
    <p>რეგისტრაციის შემდეგ მომხმარებელს ორი გზა აქვს. შეკვეთა იქმნება მხოლოდ კონკრეტული VERIFIED OFFER-ის მიღებითა და CORE-ის ავტორიზაციით. ყველა მიღებული შეკვეთა რეალურია.</p>
    <div className="funding-choices" role="group" aria-label="დაფარვის გზის პირობების ნახვა"><button aria-pressed={choice==='NOW'} onClick={()=>setChoice('NOW')}>PAY NOW<br/><small>ახლავე გადახდა</small></button><button aria-pressed={choice==='DEFERRED'} onClick={()=>setChoice('DEFERRED')}>FROM COMMISSION<br/><small>გადავადებული დაფარვა</small></button></div>
    <div className="funding-explanation" aria-live="polite">{choice==='NOW'?<><h4>დამტკიცებული ბანკი / PSP</h4><p>გადასახდელი თანხა და ვალუტა მოდის CORE შეთავაზებიდან. გადახდის დაწყება PAID-ს არ ნიშნავს; საჭიროა რეალური დადასტურებული მტკიცებულება.</p></>:<><h4>მეორე ეტაპის რეალური AVAILABLE საკომისიო</h4><p>პირველ ეტაპზე შეკვეთა შეიძლება იყოს გადავადებული. მომავალი შემოსავალი ხელმისაწვდომი თანხა არ არის. მეორე ეტაპზე კონკრეტული შეკვეთა იფარება რეალური, დადასტურებული AVAILABLE საკომისიოთი — CORE-ის ატომური, უნიკალური settlement ჩანაწერით.</p><p>PENDING, RESERVED და NEGATIVE ბალანსები არ გამოიყენება. საკომისიოს გარეშე შეკვეთა გადავადებულ მდგომარეობაში რჩება; ნაწილობრივი დაფარვა მხოლოდ დამტკიცებული CORE წესით იხსნება.</p></>}</div>
    <div className="item-coin-pending"><LockKeyhole size={17}/><span>რეალური შეთავაზება და დაფარვის endpoint ჯერ დასაკავშირებელია</span></div>
    <p className="fine-note">ეს არჩევანი მხოლოდ პირობების სანახავადაა. შეკვეთა ან გადახდის დავალება არ შექმნილა. წარმოება მხოლოდ დადასტურებული დაფარვისა და CORE-ის ტექნიკური / უფლებრივი ავტორიზაციის შემდეგ იწყება.</p>
  </section>;
}
