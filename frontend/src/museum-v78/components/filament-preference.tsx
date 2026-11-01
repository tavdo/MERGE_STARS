"use client";
import { useId, useState } from "react";
import { materialPreferenceSchema } from "@/museum-v78/lib/draft-contract";
import type { MaterialPreference } from "@/museum-v78/lib/museum-domain";
import { polymerCandidates } from "@/museum-v78/lib/material-candidates";

export const emptyMaterialPreference: MaterialPreference = { base_filament: "", precious_metal: "", integration: "", intended_use: "", details: "" };
export function materialPreferenceComplete(value: MaterialPreference | undefined) { return materialPreferenceSchema.safeParse(value).success; }

export function FilamentPreference({ value, onChange, disabled = false, lockedMetal }: { value?: MaterialPreference; onChange: (value: MaterialPreference) => void; disabled?: boolean; lockedMetal?: "gold" | "silver" }) {
  const id=useId(), preference=value??emptyMaterialPreference;
  const update=(patch:Partial<MaterialPreference>)=>onChange({...preference,...patch});
  return <fieldset className="filament-preference" disabled={disabled}>
    <legend>რომელ ფილამენტთან გსურს ოქროს ან ვერცხლის ინტეგრაცია?</legend>
    <label htmlFor={id+"-polymer"}>პოლიმერის ოჯახი · შესამოწმებელი ვარიანტები</label>
    <select id={id+"-polymer"} value={(polymerCandidates as readonly string[]).includes(preference.base_filament)?preference.base_filament:""} onChange={e=>{if(e.target.value)update({base_filament:e.target.value});}}><option value="">აირჩიე ჩამონათვალიდან ან ქვემოთ ჩაწერე ზუსტი მასალა</option>{polymerCandidates.map(name=><option key={name} value={name}>{name}</option>)}</select>
    <label htmlFor={id+"-base"}>საბაზისო ფილამენტი / მასალა</label>
    <input id={id+"-base"} required maxLength={160} value={preference.base_filament} placeholder="მაგ. კარბონის ბოჭკოთი შევსებული ფილამენტი" onChange={e=>update({base_filament:e.target.value})} aria-describedby={id+"-pending"}/>
    <label htmlFor={id+"-metal"}>რომელი ძვირფასი ლითონი გსურს?</label>
    <select id={id+"-metal"} required disabled={!!lockedMetal} value={lockedMetal??preference.precious_metal} onChange={e=>update({precious_metal:e.target.value as MaterialPreference["precious_metal"]})}><option value="">აირჩიე ლითონი</option><option value="gold">ოქრო</option><option value="silver">ვერცხლი</option>{!lockedMetal&&<option value="both">ოქრო და ვერცხლი</option>}</select>
    <p className="fine-note">ჩამონათვალი მასალის მოთხოვნისთვისაა. არც ერთი პოლიმერის არჩევა დამტკიცებულ ნარევს არ ნიშნავს. კარბონის ბოჭკო შემავსებელია — მიუთითე მისი საბაზისო პოლიმერიც.</p>
    <label htmlFor={id+"-integration"}>სასურველი ინტეგრაცია</label>
    <select id={id+"-integration"} required value={preference.integration} onChange={e=>update({integration:e.target.value as MaterialPreference["integration"]})}>
      <option value="">აირჩიე ინტეგრაციის ფორმა</option><option value="blend">მასალაში შერევა</option><option value="mosaic">მოზაიკა</option><option value="surface">ზედაპირზე ინტეგრაცია</option><option value="separate_component">ცალკე კომპონენტი</option><option value="lab_recommendation">Material Lab-მა შემომთავაზოს</option>
    </select>
    <label htmlFor={id+"-use"}>რისთვის გჭირდება ეს მასალა?</label>
    <input id={id+"-use"} required maxLength={160} value={preference.intended_use} placeholder="ნივთი, ფუნქცია და სასურველი შედეგი" onChange={e=>update({intended_use:e.target.value})}/>
    <label htmlFor={id+"-details"}>დაზუსტება, თუ იცი · არჩევითი</label>
    <textarea id={id+"-details"} rows={3} maxLength={500} value={preference.details} placeholder="საბაზისო პოლიმერი, ფილამენტის დასახელება ან არსებული სპეციფიკაცია" onChange={e=>update({details:e.target.value})}/>
    <p id={id+"-pending"} className="fine-note">ეს შენი სასურველი სპეციფიკაციაა. თავსებადობა, ნარევის შემადგენლობა და დამზადების შესაძლებლობა Material Lab-სა და მწარმოებელს დასადასტურებელი აქვთ. შერჩევა არ ადასტურებს წონას, ფასს ან წარმოებას.</p>
  </fieldset>;
}

export function CoreMaterialIntent({ itemId }: { itemId: string }) {
  const id=useId(), [preference,setPreference]=useState<MaterialPreference>();
  return <section className="core-material-intent" aria-labelledby={id+"-title"}>
    <h3 id={id+"-title"}>Material Lab · შენი არჩევანი</h3>
    <FilamentPreference value={preference} onChange={setPreference}/>
    <p role="status" className="fine-note">CORE catalog_item · {itemId}. არჩევანი მხოლოდ ამ ეკრანზეა; CORE-ში მასალის მოთხოვნის შენახვა ჯერ მიუწვდომელია. მონაცემები დამტკიცებულ სპეციფიკაციად არ ჩაითვლება.</p>
  </section>;
}
