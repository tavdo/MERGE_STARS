import {Coins,ShieldCheck} from 'lucide-react';
import {entryLineRequirements} from '@/museum-v78/lib/entry-law';
import {ItemCoinLaw} from '@/museum-v78/components/item-coin-law';
import {OrderFundingPath} from '@/museum-v78/components/order-funding-path';
import {CommercialAllocationLaw} from '@/museum-v78/components/commercial-allocation-law';

export function EntryPaymentLaw(){
  return <section className="entry-payment-law" aria-label="Gold and Silver entry and payment rules" lang="en">
    <div className="generation-heading"><Coins size={23}/><div><span className="eyebrow">MERGE · GOLD / SILVER</span><h3>Both Coins · 12 Brand Lines</h3></div></div>
    <p>One Brand House, one catalog, 12 Brand Lines. Every line may receive GOLD and SILVER orders. Every successfully generated item must be registered as an unpaid order through the authorized CORE generation flow, without upfront payment. Only the real CORE Order ID confirms registration.</p>
    <div className="entry-line-options">{entryLineRequirements.map(line=><div key={line.line} data-line={line.line}><span className="eyebrow">{line.label}</span><h3>1 {line.line} COIN = 12 BRAND LINES</h3><p><strong>{line.line==='GOLD'?'GOLD COIN CASE = 12 PRODUCTS':'SILVER COIN CASE = 1 PRODUCT'}</strong></p><p>Price basis: LIVE value of 1 kg of {line.line==='GOLD'?'gold':'silver'}. This is a price reference, not 1 kg of pure metal delivered.</p><p className="fine-note">Nominal 1:2 metal-to-polymer mass ratio: 33⅓% metal input + 66⅔% selected base. Gold: nominal 8K composite. Silver: silver–polymer composite with fineness confirmed by the material passport.</p><span className="entry-quote-pending">VERIFIED CORE OFFER PENDING</span></div>)}</div>
    <p>CORE supplies the approved price rule, LIVE snapshot, currency and verified offer. The Museum does not create another price source. No wait for 1,000 registrations is required. A private brief is not a generated item; failed or unavailable CORE order registration remains pending.</p>
    <div className="entry-status-law"><ShieldCheck size={20}/><p>REGISTERED ≠ ORDERED ≠ PAID.<br/>PAID ≠ COMMISSION AVAILABLE.<br/>ACTIVITY ≠ AVAILABLE COMMISSION.<br/>PAYMENT PENDING ≠ PAYMENT VERIFIED.</p></div>
    <p>The first 1,000 registrations have deferred-payment eligibility under the Founder specification. CORE confirms cohort and entitlement. Coin charges are paid later from real verified AVAILABLE sales commissions; CORE owns the conversion, snapshot and unique settlement record.</p>
    <OrderFundingPath/><ItemCoinLaw/><CommercialAllocationLaw language="en"/>
  </section>;
}
