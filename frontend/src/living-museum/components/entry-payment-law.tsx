import { Coins, ShieldCheck } from "lucide-react";
import { entryLineRequirements } from "@/living-museum/lib/entry-law";
import { ItemCoinLaw } from "@/living-museum/components/item-coin-law";
import { OrderFundingPath } from "@/living-museum/components/order-funding-path";
import { CommercialAllocationLaw } from "@/living-museum/components/commercial-allocation-law";

export function EntryPaymentLaw() {
  return <section className="entry-payment-law" aria-label="Gold და Silver ხაზის შესვლისა და გადახდის წესი">
    <div className="generation-heading"><Coins size={23} /><div><span className="eyebrow">MERGE · GOLD / SILVER</span><h3>ორი ხაზი. ცალკე რეგისტრაცია და გადახდა.</h3></div></div>
    <div className="entry-line-options">{entryLineRequirements.map(line => <div key={line.line} data-line={line.line}><span className="eyebrow">{line.label}</span><h3>მინიმუმ {line.minimum_coins} MERGE Coin</h3><p>{line.basis}</p><span className="entry-quote-pending">თანხა და CORE შეთავაზება მოლოდინშია</span></div>)}</div>
    <p>ეს კომერციული ფასის საფუძველია; ფიზიკური Coin-ის წონას არ ნიშნავს. დოლარში ან ევროში ფიქსირებული თანხა არ არის მითითებული.</p>
    <p>CORE იღებს დამტკიცებულ LIVE ფასს, აფიქსირებს წყაროს, დროს, ვალუტას, price snapshot-სა და წესის ვერსიას. მხოლოდ VERIFIED OFFER შეიძლება გადაიქცეს შეკვეთად.</p>
    <div className="entry-status-law"><ShieldCheck size={20} /><p>რეგისტრირებული ≠ შეკვეთილი ≠ გადახდილი.<br />გადახდილი ≠ საკომისიო გამომუშავებული.<br />გადახდის მოლოდინი ≠ გადახდის დადასტურება.</p></div>
    <p><strong>პირველი 1,000 მონაწილე</strong> ცალკე cohort-ია. რეგისტრაცია ავტომატურად არც უფასო Coin-ს, არც გადახდას და არც cohort-ში ადგილს ადასტურებს; შესაბამის მდგომარეობას CORE განსაზღვრავს.</p>
    <p className="fine-note">ფასის წესი: brand-line-2026-10-09-v2. ეს ეკრანი გადასახდელ თანხას არ ქმნის. Premium Line დამტკიცებული წესის გარეშე დაბლოკილია.</p>
    <OrderFundingPath />
    <ItemCoinLaw />
    <CommercialAllocationLaw />
    <p className="fine-note">ორივე ხაზის რეალური შეთავაზება, გადახდა და მუზეუმში კომერციული შესვლის უფლება CORE-თან ჯერ არ არის დაკავშირებული. ეს ეკრანი თანხას არ იღებს და გადახდის სტატუსს არ ქმნის.</p>
  </section>;
}
