import { Coins, LockKeyhole } from "lucide-react";

/** Founder-approved presentation rule. No quote, balance or payment is calculated here. */
export function ItemCoinLaw({ compact = false }: { compact?: boolean }) {
  return <section className="item-coin-law" aria-label="ნივთის წონა, Coin და საკომისიოდან დაფარვა">
    <div className="generation-heading"><Coins size={21} aria-hidden="true" /><div><span className="eyebrow">MERGE · ITEM / COIN</span><h3>ნივთის ღირებულება — საკომისიოდან</h3></div></div>
    <div className="item-coin-examples"><span><strong>1 კგ</strong> ნივთი → <strong>1 MERGE Coin</strong></span><span><strong>10 კგ</strong> ნივთი → <strong>10 MERGE Coin</strong></span></div>
    <p>Coin-ების რაოდენობა განისაზღვრება კონკრეტული ნივთის CORE-ში დამტკიცებული წონით. თანხა ეფუძნება შესაბამისი მასალის დამტკიცებულ LIVE ფასის snapshot-სა და CORE-ის ფასის წესს.</p>
    {!compact && <p>Silver-ის საფუძველია 2 კგ ვერცხლის ღირებულება, Gold-ის — 1 კგ ოქროს ღირებულება. ნივთის წონა და ფასის საფუძველი ცალკეა; თანხა CORE-ის მოქმედ კოტირებას მოითხოვს.</p>}
    <p>კონკრეტული VERIFIED OFFER / შეკვეთის დაფარვისთვის გამოიყენება მხოლოდ CORE-ის მიერ დადასტურებული, ხელმისაწვდომი საკომისიო. მოლოდინში, რეზერვში ან დაბლოკილი თანხა ხელმისაწვდომ ბალანსად არ ითვლება.</p>
    <div className="item-coin-pending" role="status"><LockKeyhole size={17} aria-hidden="true" /><span>საკომისიოდან დაფარვა — CORE-ის დაკავშირების მოლოდინში</span></div>
    {!compact && <p className="fine-note">CORE უნდა დაადასტუროს ნივთის წონა, Coin-ის რაოდენობა, ვალუტა, ფასი, ხელმისაწვდომი საკომისიო და ამ შეკვეთის დაფარვის ჩანაწერი. არასაკმარისი ბალანსი ან გაურკვეველი მონაცემები ვერ შექმნის PAID სტატუსს. ნაწილობრივი დაფარვისა და დამრგვალების წესი ჯერ დასამტკიცებელია.</p>}
  </section>;
}
