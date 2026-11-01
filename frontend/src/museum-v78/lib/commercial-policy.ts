import {z} from 'zod';
import {founderPaymentLaw} from './founder-payment-law';

const minor=z.string().regex(/^(0|[1-9]\d{0,17})$/);
const role=z.enum(['company','metal','source','destination','construction']);
export const commercialPolicySchema=z.object({
  id:z.string().regex(/^[A-Z0-9_-]{1,80}$/),version:z.number().int().positive().max(1000000),
  coin_line:z.enum(['GOLD','SILVER']),currency:z.string().regex(/^[A-Z]{3}$/),
  status:z.literal('DRAFT_SPECIFICATION'),base_definition:z.string().trim().min(1).max(300),
  allocations:z.array(z.object({key:role,basis_points:z.number().int().min(0).max(10000)}).strict()).min(1).max(5),
  separate_platform_fee_basis_points:z.number().int().min(0).max(10000),
  rounding:z.literal('LARGEST_REMAINDER_KEY_ORDER'),tax_status:z.literal('CONFIRMATION_REQUIRED'),
}).strict().superRefine((policy,ctx)=>{
  if(new Set(policy.allocations.map(a=>a.key)).size!==policy.allocations.length)ctx.addIssue({code:'custom',message:'Allocation keys must be unique'});
  if(policy.allocations.reduce((sum,a)=>sum+a.basis_points,0)!==10000)ctx.addIssue({code:'custom',message:'Base allocation must total 10000 basis points'});
});
export type CommercialPolicy=z.infer<typeof commercialPolicySchema>;
const attribution=z.object({source_house_id:z.string().trim().min(1).max(160),destination_house_id:z.string().trim().min(1).max(160)}).strict();
function freeze<T>(value:T):Readonly<T>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}

// Pure, bounded integer arithmetic. It creates no offer, balance or transfer.
// The frozen snapshot is a calculation record, never an approval signature.
export function calculateCommercialEstimate(rawPolicy:unknown,baseMinor:string,rawAttribution:unknown){
  const policy=commercialPolicySchema.parse(rawPolicy),base=BigInt(minor.parse(baseMinor)),actors=attribution.parse(rawAttribution);
  const shares=policy.allocations.map(a=>({key:a.key,basis_points:a.basis_points,amount:base*BigInt(a.basis_points)/BigInt(10000),remainder:base*BigInt(a.basis_points)%BigInt(10000)}));
  const residual=Number(base-shares.reduce((sum,a)=>sum+a.amount,BigInt(0)));
  const ranked=[...shares].sort((a,b)=>a.remainder===b.remainder?a.key.localeCompare(b.key):a.remainder>b.remainder?-1:1);
  for(let i=0;i<residual;i++)ranked[i].amount+=BigInt(1);
  // A separate fee is rounded once, half-up, on the explicitly declared base.
  const fee=(base*BigInt(policy.separate_platform_fee_basis_points)+BigInt(5000))/BigInt(10000);
  const brandShares=new Map<string,bigint>();
  for(const share of shares){const house=share.key==='source'?actors.source_house_id:share.key==='destination'?actors.destination_house_id:null;if(house)brandShares.set(house,(brandShares.get(house)??BigInt(0))+share.amount);}
  return freeze({
    status:'CALCULATED_ESTIMATE' as const,payable:false as const,verified_offer:false as const,order_created:false as const,
    payment_verified:false as const,commission_available:false as const,production_authorized:false as const,
    policy_snapshot:policy,attribution_snapshot:actors,base_minor:base.toString(),currency:policy.currency,
    allocations:shares.map(({key,basis_points,amount})=>({key,basis_points,amount_minor:amount.toString()})),
    brand_shares:[...brandShares].sort(([a],[b])=>a.localeCompare(b)).map(([house_id,amount])=>({house_id,amount_minor:amount.toString()})),
    platform_fee_minor:fee.toString(),subtotal_before_tax_minor:(base+fee).toString(),tax_minor:null,
    final_payable_minor:null,
  });
}

export function founderPolicySpecification(line:'GOLD'|'SILVER'):CommercialPolicy{
  return commercialPolicySchema.parse({id:'MERGE_'+line+'_FOUNDER_SPEC',version:1,coin_line:line,currency:'USD',status:'DRAFT_SPECIFICATION',
    base_definition:'Illustrative product base, before the separate platform fee and tax. Not a LIVE price or approved transaction.',
    allocations:founderPaymentLaw.allocations.map(row=>({key:row.key,basis_points:row.basisPoints})),
    separate_platform_fee_basis_points:founderPaymentLaw.separatePlatformFeeBasisPoints,rounding:'LARGEST_REMAINDER_KEY_ORDER',tax_status:'CONFIRMATION_REQUIRED'});
}
export function calculateFounderIllustration(line:'GOLD'|'SILVER',baseMinor:number){
  if(!Number.isSafeInteger(baseMinor)||baseMinor<0)throw Error('INVALID_MINOR_AMOUNT');
  const result=calculateCommercialEstimate(founderPolicySpecification(line),String(baseMinor),{source_house_id:'ILLUSTRATIVE_SOURCE',destination_house_id:'ILLUSTRATIVE_DESTINATION'});
  const allocated=Object.fromEntries(result.allocations.map(a=>[a.key,Number(a.amount_minor)])) as Record<z.infer<typeof role>,number>;
  return {...allocated,baseMinor,platformFeeMinor:Number(result.platform_fee_minor),subtotalBeforeVatMinor:Number(result.subtotal_before_tax_minor)};
}
