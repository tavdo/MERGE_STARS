import {z} from 'zod';
import {prepareSocialProfile,socialProfilePreparationSchema} from './social-brand-preparation';

// Presentation intent only. This is neither a CORE identity nor an email,
// social connection, order, consent record, AI response or financial ledger.
export const managerBriefSchema=socialProfilePreparationSchema.extend({
  industry:z.enum(['Design & Lifestyle','Fashion','Jewelry & Watches','Art & Collectibles','Technology','Home & Furniture','Games & Toys','Music']),
  email_setup:z.enum(['CREATE','EXISTING']),
  content_language:z.enum(['English','French','German','Italian','Spanish']),
  tone:z.enum(['Refined & editorial','Warm & personal','Bold & contemporary']),
  deliverables:z.array(z.enum(['Product captions','First 12 post ideas','Video outlines','Publishing calendar'])).min(1).max(4).refine(v=>new Set(v).size===v.length),
}).strict();
export type ManagerBriefInput=z.infer<typeof managerBriefSchema>;
export const emptyManagerBrief:ManagerBriefInput={brand_name:'',description:'',channels:[],registration_mode:'SELF',industry:'Design & Lifestyle',email_setup:'EXISTING',content_language:'English',tone:'Refined & editorial',deliverables:['Product captions','First 12 post ideas']};
export function prepareManagerBrief(input:unknown){
  const result=managerBriefSchema.safeParse(input);if(!result.success)return null;
  const value=result.data;
  const profile=prepareSocialProfile({brand_name:value.brand_name,description:value.description,channels:value.channels,registration_mode:value.registration_mode});
  if(!profile)return null;
  return {...profile,text:[profile.text,'Industry: '+value.industry,'Email setup preference: '+(value.email_setup==='CREATE'?'Create through an authorized provider':'Connect an existing mailbox'),'Content language: '+value.content_language,'Tone: '+value.tone,'Requested draft deliverables: '+value.deliverables.join(', '),'Preferences are a transient working brief, not saved CORE settings or permission to publish.'].join('\n\n')};
}

// Latest Founder specification. Actual order creation is an existing CORE
// responsibility. No method in this module issues IDs or grants production.
export const officialOrderLaw=Object.freeze({
  source:'FOUNDER_SPECIFICATION',brandLinePlaces:12,
  modelSaveAloneCreatesOrder:false,userConfirmationRequired:true,
  generationActionIncludesOrderAuthorization:true,
  everyGeneratedItemRequiresCoreOrder:true,
  additionalPostGenerationConfirmationRequired:false,
  generationOrderRegistrationState:'UNPAID',
  orderRegistrationFailureState:'CORE_ORDER_REGISTRATION_PENDING',
  orderRegistrationIsPayment:false,
  orderAuthority:'MERGE_CORE',paymentRequiredBeforeOrder:false,
  waitForThousandRegistrations:false,deferredOrderIsPaidSale:false,
  orderCountAuthority:'ACTUAL_CORE_ORDER_IDS',
  paymentRequiresVerifiedOffer:true,
  productionRequires:'VERIFIED_SETTLEMENT_TECHNICAL_APPROVAL_AND_CORE_AUTHORIZATION',
  goldProductLimit:12,silverProductLimit:1,
} as const);
