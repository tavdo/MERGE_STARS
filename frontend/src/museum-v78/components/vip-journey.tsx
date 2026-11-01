"use client";

import { Check, CircleDot, LockKeyhole, ShieldCheck } from "lucide-react";

type StageState = "AVAILABLE" | "CONCEPT" | "BLOCKED";

const stages: ReadonlyArray<{ number: string; title: string; detail: string; state: StageState; owner: string; evidence: string }> = [
  { number: "01", title: "IDENTITY + CONSENT", detail: "არსებული CORE ანგარიში, თანხმობა და უფლებამოსილი პროფილი", state: "BLOCKED", owner: "MERGE CORE", evidence: "საერთო CORE სესია" },
  { number: "02", title: "DIGITAL TWIN", detail: "ნებაყოფლობითი Face / Wrist / Finger / Body / Foot Fit Profile", state: "BLOCKED", owner: "MERGE CORE", evidence: "თანხმობისა და Fit snapshot-ის ID" },
  { number: "03", title: "LIVING MUSEUM", detail: "სივრცითი აღმოჩენა, წყარო, ისტორია და ნივთის არჩევა", state: "AVAILABLE", owner: "Living Museum", evidence: "მოქმედი მუზეუმის სცენა" },
  { number: "04", title: "FIT TO ME", detail: "კატეგორიასთან შესაბამისი, შერჩეული Fit მონაცემის გამოყენება", state: "BLOCKED", owner: "CORE + Client", evidence: "თანხმობა და Fit snapshot" },
  { number: "05", title: "CREATE MY VERSION", detail: "წყარო უცვლელია; ადგილობრივი ვერსია ინახება როგორც CONCEPT", state: "CONCEPT", owner: "Living Museum", evidence: "Draft ID და source reference" },
  { number: "06", title: "MOSAIC + MESHY", detail: "შერჩევითი ოქრო/ვერცხლის მოზაიკა და რეალური server-side generation", state: "BLOCKED", owner: "Gateway + Meshy", evidence: "API secret, task ID და asset ID" },
  { number: "06A", title: "AUTO REGISTER CORE ORDERS", detail: "ავტორიზებული გენერაციის წარმატებულ შედეგს CORE-ში ავტომატურად უნდა მიენიჭოს რეალური უნიკალური Order ID — წინასწარი გადახდის და 1,000 რეგისტრაციის ლოდინის გარეშე", state: "BLOCKED", owner: "MERGE CORE", evidence: "გენერაციისას შეკვეთის ავტორიზაცია, source/version და CORE Order ID" },
  { number: "07", title: "CALCULATE", detail: "გეომეტრია → მოცულობა → მასალა → წონა → ფასის snapshot", state: "BLOCKED", owner: "MERGE CORE", evidence: "დამტკიცებული გეომეტრია და pricing rule" },
  { number: "08", title: "TECHNICAL VERIFICATION", detail: "უფლებები, შესრულებადობა, მასალა, მწარმოებელი და ვადა", state: "BLOCKED", owner: "Verifier + Manufacturer", evidence: "ხელმოწერილი ტექნიკური მტკიცებულება" },
  { number: "09", title: "VERIFIED OFFER", detail: "უკვე დადასტურებულ გადაუხდელ CORE შეკვეთაზე შესაბამისი გადახდის კარიბჭე", state: "BLOCKED", owner: "MERGE CORE", evidence: "მოქმედი verified_offer_id" },
  { number: "10", title: "ORDER + PAYMENT", detail: "შეკვეთა, ბანკის დადასტურებული გადახდა ან ხელმისაწვდომი საკომისიოდან CORE settlement", state: "BLOCKED", owner: "CORE + PSP", evidence: "Order ID და დადასტურებული payment / settlement" },
  { number: "11", title: "PRODUCTION + QC/XRF", detail: "ავტორიზებული წარმოება, ხარისხი და რეალური გაზომვები", state: "BLOCKED", owner: "Manufacturer + QC", evidence: "წარმოების, QC/XRF ჩანაწერები" },
  { number: "12", title: "PASSPORT + QR", detail: "კონფიდენციალურობის დაცვით პროდუქტის ისტორია და წარმომავლობა", state: "BLOCKED", owner: "MERGE CORE", evidence: "passport_id და signed QR" },
  { number: "13", title: "EXHIBIT → HOUSE → LEGACY", detail: "დადასტურებული ნივთი ბრუნდება მუზეუმში და აგრძელებს ისტორიას", state: "BLOCKED", owner: "MERGE CORE", evidence: "VERIFIED პროდუქტი და Passport" },
];

const stateLabel: Record<StageState, string> = { AVAILABLE: "მოქმედებს", CONCEPT: "კონცეფცია", BLOCKED: "მტკიცებულება საჭიროა" };

export function VipJourney({ onEnterMuseum }: { onEnterMuseum: () => void }) {
  return <section className="vip-journey" aria-label="MERGE VIP კლიენტის გზა">
    <div className="vip-law"><ShieldCheck size={24} /><div><strong>ერთი გზა · ერთი ავტორიტეტული CORE</strong><p>Living Museum ქმნის გამოცდილებას და CONCEPT მონახაზს. იდენტობა, ფასი, შეთავაზება, გადახდა, წარმოება, QC და Passport მხოლოდ რეალური CORE მტკიცებულებით იხსნება.</p></div></div>
    <div className="vip-stage-list">{stages.map(stage => <article key={stage.number} data-status={stage.state}>
      <span>{stage.number}</span><div className="vip-stage-copy"><strong>{stage.title}</strong><p>{stage.detail}</p><dl><div><dt>პასუხისმგებელი</dt><dd>{stage.owner}</dd></div><div><dt>საჭირო მტკიცებულება</dt><dd>{stage.evidence}</dd></div></dl></div>
      <small>{stage.state === "AVAILABLE" ? <><Check size={13}/>{stateLabel[stage.state]}</> : stage.state === "CONCEPT" ? <><CircleDot size={13}/>{stateLabel[stage.state]}</> : <><LockKeyhole size={13}/>{stateLabel[stage.state]}</>}</small>
    </article>)}</div>
    <div className="vip-commercial-law"><strong>CONFIRM CORE ORDER → VERIFIED OFFER → CONFIRMED SETTLEMENT → AUTHORIZED PRODUCTION</strong><p>MERGE არის შეკვეთაზე დაფუძნებული ფიზიკური პროდუქტის პლატფორმა — არა კრიპტო, ტოკენი, საინვესტიციო პროდუქტი ან გარანტირებული შემოსავალი. Digital Twin ნებაყოფლობითი და თანხმობაზე დაფუძნებულია.</p></div>
    <button className="button light" onClick={onEnterMuseum}>შევიდე Living Museum-ში</button>
  </section>;
}
