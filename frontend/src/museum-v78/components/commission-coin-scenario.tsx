"use client";
import {useId,useState} from 'react';
import {commissionCoinScenario} from '@/museum-v78/lib/commission-coin-scenario';

const units=(value:number)=>new Intl.NumberFormat('en-US',{maximumFractionDigits:4}).format(value);
export function CommissionCoinScenario(){
 const id=useId(),[gross,setGross]=useState('1'),[share,setShare]=useState<3300|1650>(3300),[vat,setVat]=useState<0|18>(18);
 const result=commissionCoinScenario({orderGrossCoinUnits:Number(gross),brandShareBasisPoints:share,vatPercent:vat});
 return <section className="commission-coin-scenario" data-financial-state="SCENARIO_ONLY" lang="en" aria-label="Orders needed for one MERGE Coin · scenario only">
  <span className="eyebrow">PAY LATER · UNDERSTAND THE NUMBERS</span><h3>How many paid orders fund one Coin?</h3>
  <p>This illustration targets the value of <strong>1 Coin</strong>, starting from zero available commission. It uses Coin-price units, not an actual Coin balance or a LIVE offer.</p>
  <div className="coin-scenario-inputs"><label htmlFor={id+'gross'}>Customer total per order · Coin-price units<input id={id+'gross'} type="number" min="0.01" max="100" step="0.01" inputMode="decimal" value={gross} onChange={event=>setGross(event.target.value)}/><small>1 means the customer's full payment equals your target Coin price.</small></label>
   <label htmlFor={id+'share'}>Your attributed brand share<select id={id+'share'} value={share} onChange={event=>setShare(Number(event.target.value) as 3300|1650)}><option value={3300}>33% · full combined brand share</option><option value={1650}>16.5% · one Source / Destination share</option></select><small>33% is the total brand allocation. Different Houses receive 16.5% each under the current rule.</small></label>
   <label htmlFor={id+'vat'}>VAT assumption for this illustration<select id={id+'vat'} value={vat} onChange={event=>setVat(Number(event.target.value) as 0|18)}><option value={18}>18% · included in customer total</option><option value={0}>0% · illustrative alternative</option></select></label>
  </div>
  <p className="fine-note">Assumptions: the separate 2% platform fee is added to the product base and included in the customer total; the selected VAT rate applies to both. No reserve, refund, withholding or other cost is assumed. Actual CORE tax treatment, attribution, rounding, eligibility and settlement control the real result.</p>
  {result?<div aria-live="polite"><dl className="coin-scenario-breakdown"><div><dt>Customer payment per order</dt><dd>{units(result.gross)}</dd></div><div><dt>Included VAT</dt><dd>−{units(result.vat)}</dd></div><div><dt>Included platform fee · 2% of base</dt><dd>−{units(result.platformFee)}</dd></div><div><dt>Product allocation base</dt><dd>{units(result.productBase)}</dd></div><div><dt>Your {share/100}% share of that base</dt><dd>{units(result.commission)} Coin-price units</dd></div></dl>
   <div className="coin-scenario-result"><strong>{result.ordersRequired}</strong><span>equally priced, paid and fully eligible orders<br/><small>Illustrated target: 1 Coin · not a guaranteed earning</small></span></div>
   <p className="coin-scenario-formula">orders = round up [1 ÷ ((order total ÷ {1+vat/100} ÷ 1.02) × {share/10000})]</p>
   <div className="allocation-table-wrap"><table><caption>Illustrated commission · only after it becomes AVAILABLE</caption><thead><tr><th scope="col">Paid orders</th><th scope="col">Coin-price units</th></tr></thead><tbody>{result.scenarioRows.map(row=><tr key={row.orders}><th scope="row">{row.orders}</th><td>{units(row.commission)}</td></tr>)}</tbody></table></div>
  </div>:<p role="status">Enter an order value between 0.01 and 100 Coin-price units.</p>}
  <details><summary>Order growth and commission are separate</summary><p>Illustrative doubling: stage 1 has 1 new order; stage 2 has 2; stage 3 has 4. Those are 1, 3 and 7 cumulative orders. This is an arithmetic scenario, not recruitment-based earnings or a guaranteed sales forecast. Registrations and generated unpaid orders do not credit a commission balance.</p></details>
  <p><strong>Every successfully generated item is intended to be registered as an unpaid CORE order in the authorized generation flow.</strong> A CORE Order ID confirms registration. A saved brief is not a generated item. With CORE generation or order registration unavailable, the screen must show REGISTRATION PENDING and must not invent an order.</p>
  <p>Eligible deferred Coin charges are paid later from real, verified AVAILABLE sales commissions. Payment, commission availability and production authorization remain separate CORE decisions.</p>
  <p className="fine-note">Actual available balance: CORE CONNECTION REQUIRED. This calculator creates no orders, credit, Coin or payment. <a href="https://voice.rs.ge/Default.aspx?id=4331" target="_blank" rel="noopener noreferrer">Georgia Revenue Service · VAT information ↗</a></p>
 </section>;
}
