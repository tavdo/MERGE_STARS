"use client";
import { ArrowRight, Expand, ShieldCheck, Fingerprint } from "lucide-react";
import type { Product, Config } from "@/museum-v78/lib/museum-domain";
import type { DesignDraft } from "@/museum-v78/lib/draft-contract";

const materialNames = { mixed: "ოქრო + ვერცხლი", gold: "ოქრო", silver: "ვერცხლი" };

export function ExhibitDossier({ product, draft, preview, custom, onOriginal, onVerification, onFit }: {
  product: Product; draft: DesignDraft | null; preview: Config; custom: boolean;
  onOriginal: () => void; onVerification: () => void; onFit: () => void;
}) {
  return <div className="exhibit-dossier">
    <div className="dossier-portrait"><img src={product.image} alt={product.description} /><button className="text-link" onClick={onOriginal}><Expand size={15} />ორიგინალის დათვალიერება</button></div>
    <div className="dossier-heading"><span className="eyebrow">{product.category} · MERGE</span><h3>{draft?.name ?? (custom && preview.name.trim() ? preview.name.trim() : product.title)}</h3><span className="status">კონცეფცია</span></div>
    <dl className="dossier-facts">
      <div><dt>მასალა</dt><dd>{custom ? materialNames[preview.material] : "ორიგინალის ვიზუალური პალიტრა"}<small>შემადგენლობა და სინჯი ჯერ არ არის დადასტურებული.</small></dd></div>
      <div><dt>მოზაიკა</dt><dd>{preview.scale.toUpperCase()}<small>კონცეფციის პარამეტრი; ახალი გეომეტრია ჯერ არ შექმნილა.</small></dd></div>
      {custom ? <><div><dt>ჩემი ვერსიის წონა</dt><dd>გამოთვლას ელოდება<small>საჭიროა მორგებული გაზომვადი გეომეტრია, მოცულობა და მასალის სიმკვრივე.</small></dd></div><div><dt>ჩემი ვერსიის გამოთვლილი ფასი</dt><dd>ჯერ მიუწვდომელია<small>ფასს ადგენს MERGE CORE წონის, დამტკიცებული მიმდინარე წყაროსა და მოქმედი წესის მიხედვით.</small></dd></div></> : <div><dt>წყაროს ექსპონატი</dt><dd>საჩვენებელი ნიმუში<small>წონა და ფასი გამოითვლება შენი მორგებული ვერსიისთვის. საწყის ექსპონატს გასაყიდი ფასი არ ენიჭება.</small></dd></div>}
      <div><dt>ხარისხი · QC</dt><dd>ჯერ არ არის დადასტურებული<small>მწარმოებლისა და ხარისხის შემოწმების ჩანაწერი არ არის მოწოდებული.</small></dd></div>
      <div><dt>პასპორტი · QR</dt><dd>ჯერ მიუწვდომელია<small>საჭიროა CORE-ში დადასტურებული პროდუქტის ჩანაწერთან კავშირი.</small></dd></div>
    </dl>
    <div className="dossier-source"><h4>წყარო და ისტორია</h4><dl>
      <div><dt>ვიზუალური წყარო</dt><dd>შენ მიერ ატვირთული MERGE კონცეფცია</dd></div>
      <div><dt>კონცეფციის Reference</dt><dd><code>{product.product_id}</code></dd></div>
      <div><dt>პირველწყაროს Reference</dt><dd><code>{draft?.root_reference_id ?? product.root_product_id}</code></dd></div>
      {draft && <><div><dt>შენახული მონახაზი</dt><dd><code>{draft.draft_id}</code></dd></div><div><dt>წინამორბედი მონახაზი</dt><dd><code>{draft.parent_draft_id ?? "პირველი მონახაზი"}</code></dd></div></>}
      <div><dt>CORE Product / Version</dt><dd>ჯერ არ არის დაკავშირებული</dd></div>
      <div><dt>უფლებები და რევიზია</dt><dd>CORE-ის დადასტურებას ელოდება</dd></div>
    </dl></div>
    <button className="dossier-next" onClick={onFit}><Fingerprint size={19} /><span>{product.category === "EYEWEAR" ? "ჩემს ავატარზე მორგება" : "Fit to Me"}<small>არსებული CORE Fit Profile-ის კავშირის მდგომარეობა.</small></span><ArrowRight size={18} /></button>
    <button className="dossier-next" onClick={onVerification}><ShieldCheck size={19} /><span>ვერიფიკაციის გზა<small>შეკვეთამდე საჭიროა დადასტურებული შეთავაზება.</small></span><ArrowRight size={18} /></button>
  </div>;
}
