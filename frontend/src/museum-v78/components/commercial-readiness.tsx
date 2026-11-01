"use client";

import { Check, CircleDollarSign, Factory, FileCheck2, LockKeyhole, QrCode, ShieldCheck } from "lucide-react";
import { OrderFundingPath } from "@/museum-v78/components/order-funding-path";
import { ItemCoinLaw } from "@/museum-v78/components/item-coin-law";
import { CommercialAllocationLaw } from "@/museum-v78/components/commercial-allocation-law";

const states = [
  ["01", "REGISTER → CREATE 12 MODELS", "CORE", "არსებული იდენტობა, წყაროს შენარჩუნება და მოდელების შენახვა — წინასწარი გადახდის გარეშე"],
  ["02", "REGISTER GENERATED ITEMS AS ORDERS", "CORE", "ყოველ წარმატებით გენერირებულ ნივთზე უნიკალური CORE Order ID; გადაუხდელი შეკვეთა PAID მდგომარეობას არ ნიშნავს"],
  ["02A", "VERIFIED OFFER", "CORE", "გადახდამდე დადასტურებული სპეციფიკაცია, ფასი, ვადა და პირობები"],
  ["03", "PAYMENT_PENDING / DEFERRED_PAYMENT", "CORE / PSP / BANK", "ახლავე გადახდა ან მიღებული გადავადება; ჯერ არ ნიშნავს PAID / SETTLED მდგომარეობას"],
  ["04", "PAID / SETTLED", "CORE EVIDENCE", "PSP-ის დადასტურებული გადახდა ან AVAILABLE საკომისიოდან ამ Order ID-ის ავტორიტეტული settlement"],
  ["05", "PRODUCTION_AUTHORIZED", "CORE", "მხოლოდ დადასტურებული გადახდისა და უფლებამოსილების შემდეგ"],
  ["06", "IN_PRODUCTION", "MANUFACTURER", "დამტკიცებული სპეციფიკაცია, მასალა, პარტია და ვადები"],
  ["07", "QC / XRF", "AUTHORIZED EVIDENCE", "წონა, შემადგენლობა, შედეგი, დანართები და გამონაკლისები"],
  ["08", "PASSPORT + QR", "CORE", "კონფიდენციალურობის დაცვით საბოლოო წარმომავლობა და ისტორია"],
] as const;

const controls = [
  "ბრაუზერს არ შეუძლია PAID, VERIFIED, QC ან Passport მდგომარეობის მინიჭება",
  "ყოველი წარმატებით გენერირებული ნივთი ავტორიზებული გენერაციის ფარგლებში CORE-ში შეკვეთად რეგისტრირდება; გადახდა VERIFIED OFFER-ს მოითხოვს",
  "ბანკის / PSP-ის webhook მოითხოვს პროვაიდერის ხელმოწერის შემოწმებას",
  "თითო event_id მუშავდება მხოლოდ ერთხელ — idempotency",
  "თანხა, ვალუტა და Order ID ემთხვევა CORE-ის მოსალოდნელ ჩანაწერს",
  "Refund, reversal და chargeback ქმნის ახალ audit event-ს",
  "წარმოების ავტორიზაცია იკეტება დადასტურებულ გადახდამდე",
  "MERGE არ აჩვენებს კლიენტის თანხას პლატფორმის საკუთრებად",
] as const;

export function CommercialReadiness() {
  return <section className="commercial-readiness" aria-label="შეკვეთისა და გადახდის მზადყოფნა">
    <div className="commercial-readiness-hero">
      <div><span>COMMERCIAL READINESS</span><h3>ბანკისა და PSP-ის დასაკავშირებელი ბირთვი</h3><p>პლატფორმის კომერციული გზა მზადდება რეალური პროვაიდერის შემოწმებისთვის. გადახდის წარმატება არ სიმულირდება.</p></div>
      <ShieldCheck size={34} aria-hidden="true" />
    </div>

    <div className="commercial-state-list">{states.map(([number,title,authority,evidence],index) => <article key={title}>
      <span>{number}</span><div><strong>{title}</strong><small>{authority}</small><p>{evidence}</p></div>
      {index < 3 ? <CircleDollarSign size={18} /> : index < 6 ? <Factory size={18} /> : index === 6 ? <FileCheck2 size={18} /> : <QrCode size={18} />}
    </article>)}</div>

    <div className="commercial-gate"><LockKeyhole size={22}/><div><strong>CONFIRM CORE ORDER → VERIFIED OFFER → CONFIRMED SETTLEMENT → AUTHORIZED PRODUCTION</strong><p>გადავადება არ არის დაფარვა. Order Created არ არის Payment. Payment არ არის Commission Earned. საბოლოო Passport არ გაიცემა საჭირო QC/XRF მტკიცებულების გარეშე.</p></div></div>

    <OrderFundingPath />
    <ItemCoinLaw />
    <CommercialAllocationLaw />
    <h3 className="workflow-title">სავალდებულო უსაფრთხოების კონტროლები</h3>
    <div className="commercial-controls">{controls.map(control => <div key={control}><Check size={15}/><span>{control}</span></div>)}</div>

    <div className="commercial-provider-status"><strong>მიმდინარე ინტეგრაციის მდგომარეობა</strong><dl><div><dt>პლატფორმის პროცესი</dt><dd>SPECIFICATION ONLY · CORE INTEGRATION REQUIRED</dd></div><div><dt>ბანკი / PSP</dt><dd>PROVIDER CONFIGURATION REQUIRED</dd></div><div><dt>რეალური PAID მტკიცებულება</dt><dd>NOT CONNECTED — FAIL CLOSED</dd></div></dl><p>ბანკის ან PSP-ის არჩევის შემდეგ ემატება მხოლოდ მისი ოფიციალური endpoint, signing secret და sandbox/production კონტრაქტი. კომერციული მდგომარეობების კანონი უცვლელი რჩება.</p></div>
  </section>;
}
