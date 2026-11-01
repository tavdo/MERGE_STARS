import {coinProductLaw} from '@/museum-v78/lib/coin-product-law';
import {CoinMaterialSummary} from '@/museum-v78/components/coin-material-summary';

// Shared specification preview for both lines, never a local entitlement record.
export function CoinPackagePreview({language='ka',line='GOLD',showMaterial=true}:{language?:'ka'|'en';line?:'GOLD'|'SILVER';showMaterial?:boolean}){
  const en=language==='en',rule=line==='GOLD'?coinProductLaw.gold:coinProductLaw.silver;
  return <section className="gold-package-preview" data-coin-package={line} data-package-state="PREVIEW_ONLY" aria-label={en?`${line} package specification preview`:`${line} პაკეტის წესის პრევიუ`} lang={language}>
    <span className="eyebrow">ONE OWNER · ONE BRAND HOUSE</span><h3>1 {line} COIN · {rule.brandLineSlots} BRAND LINES</h3>
    <p>{en?'Both Gold and Silver open all 12 Brand Lines in one Brand House and catalog. Every line may receive Gold and Silver orders.':'GOLD და SILVER ორივე ხსნის 12-ვე Brand Line-ს ერთ Brand House-სა და კატალოგში. ყველა ხაზს შეუძლია მიიღოს GOLD და SILVER შეკვეთები.'}</p>
    <ol className="gold-package-slots">{Array.from({length:rule.brandLineSlots},(_,index)=><li key={index} data-planning-slot={index+1}><strong>Line {String(index+1).padStart(2,'0')}</strong><span>{en?'Brand Line place':'Brand Line-ის ადგილი'}</span></li>)}</ol>
    <strong className="gold-package-inclusion">{line==='GOLD'?'GOLD COIN CASE = 12 PRODUCTS':'SILVER COIN CASE = 1 PRODUCT'}</strong>
    <p>{line==='GOLD'?(en?'One Gold package includes up to 12 products. The combined mass of PRODUCTS AND CASE must not exceed 1,000 g of finished MERGE 8K gold composite.':'ერთი GOLD პაკეტი მოიცავს 12-მდე ნივთს. ნივთებისა და ქეისის ერთობლივი დასრულებული MERGE 8K ოქროს კომპოზიტის მასა არ უნდა აღემატებოდეს 1,000 გ-ს.'):(en?'One Silver order and physical case contain one selected product; all 12 Brand Lines remain available under the same eligibility rule.':'ერთი SILVER შეკვეთა და ფიზიკური ქეისი შეიცავს ერთ არჩეულ ნივთს; 12-ვე Brand Line-ს იგივე წვდომის წესი აქვს.')}</p>
    {showMaterial&&<CoinMaterialSummary line={line}/>}
    <p>{en?'CORE confirms eligibility and the actual Brand Line records. The first 1,000 registrations qualify for deferred payment; settlement uses only verified AVAILABLE commissions. This preview does not show a purchased package or 12 confirmed records.':'უფლებამოსილებასა და რეალურ Brand Line ჩანაწერებს CORE ადასტურებს. პირველი 1,000 რეგისტრაციისთვის მოქმედებს გადავადება; დაფარვა ხდება მხოლოდ დადასტურებული AVAILABLE საკომისიოდან. პრევიუ შეძენილ პაკეტს ან 12 დადასტურებულ ჩანაწერს არ წარმოადგენს.'}</p>
    <div className="gold-package-pending" role="status">{en?'YOUR ENTITLEMENT · CORE CONFIRMATION PENDING':'შენი უფლება · CORE დადასტურების მოლოდინში'}</div>
    <small>{en?'Brand Line access, product quantity, verified weight, payment and production authorization are separate. No equal per-item weight is assumed.':'Brand Line-ზე წვდომა, ნივთების რაოდენობა, დადასტურებული წონა, გადახდა და წარმოების ავტორიზაცია ცალკე მოვლენებია. თითო ნივთზე თანაბარი წონა არ იგულისხმება.'}</small>
  </section>;
}
export function GoldPackagePreview({language='ka'}:{language?:'ka'|'en'}){return <CoinPackagePreview line="GOLD" language={language}/>;}
