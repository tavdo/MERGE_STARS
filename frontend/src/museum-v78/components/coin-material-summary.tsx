import {coinMaterialSpecification as material,coinMaterialLabels} from '@/museum-v78/lib/coin-material';

export function CoinMaterialSummary({line}:{line:'GOLD'|'SILVER'}){
 const label=coinMaterialLabels(line);
 return <section className="coin-material-summary" data-material-state={material.status} lang="en" aria-label={`${line} material composition`}>
  <span className="eyebrow">WHAT YOUR PRODUCT IS MADE OF</span><h3>MERGE · {label.name}</h3>
  <div className="coin-composition-bar" aria-hidden="true"><span>{material.metalFraction}</span><span>{material.baseFraction}</span></div>
  <dl><div><dt>Precious-metal input · by mass</dt><dd>{material.metalFraction} {label.metal}</dd></div><div><dt>Base material · by mass</dt><dd>{material.baseFraction} selected polymer / filament</dd></div><div><dt>Nominal formulation</dt><dd>{material.metalToBaseMassRatio} metal to base</dd></div><div><dt>Declared input metal fineness</dt><dd>{label.symbol} {material.declaredMetalInputFineness} · passport verification required</dd></div></dl>
  <p>Formulation example only: 1 kg of finished composite uses approximately {material.nominalMetalInputGramsPerKgComposite} g of {label.metal} input and {material.nominalBaseGramsPerKgComposite} g of base. This is not the weight of your item or a promise of 1 kg of pure metal.</p>
  <p>{line==='GOLD'?'8K is the nominal gold formulation (8/24). The input purity, composite mass fraction and certified fine-gold content are separate.':'Silver is identified by its silver fraction and verified fineness. A gold karat rating is not used as a silver assay.'} The selected polymer, any fillers, approved recipe, measured weight and batch certificate must come from CORE Material Lab and the material passport. A polymer candidate is not an approved formulation.</p>
  <strong className="coin-material-status">FOUNDER FORMULATION · BATCH CERTIFICATION PENDING</strong>
 </section>;
}
