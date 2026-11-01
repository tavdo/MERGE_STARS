// Founder clarification, 15 October 2026. Experience rules only; no CORE
// ownership, payment or commercial entitlement is created by these labels.
export const coinProductLaw = Object.freeze({
  housesArePrepaidCoins: false,
  planningRequiresPayment: false,
  paymentIsVoluntary: true,
  productionRequiresAuthorization: true,
  gold: Object.freeze({brandLineSlots:12,productSlots:12,productsPerCoin:12,productsPerCase:12,totalCompositeGrams:1000,compositeIncludesCase:true,allSlotsTogether:true,confirmationSource:'MERGE_CORE'}),
  silver: Object.freeze({brandLineSlots:12,productsPerCoin:1,productsPerCase:1,totalCompositeGrams:null,planningRequiresPayment:false}),
  firstCohort: Object.freeze({registrationLimit:1000,eligibilitySource:'MERGE_CORE',funding:'VERIFIED_AVAILABLE_COMMISSION',registrationIsPayment:false}),
});

export function draftCasePlan(records:readonly {id:string;intent:{coin_line:'GOLD'|'SILVER'}}[],selected:readonly string[]){
  const wanted=new Set(selected),seen=new Set<string>();let gold=0,silver=0;
  for(const record of records){if(!wanted.has(record.id)||seen.has(record.id))continue;seen.add(record.id);if(record.intent.coin_line==='GOLD')gold++;else if(record.intent.coin_line==='SILVER')silver++;}
  return {gold,silver,total:gold+silver,goldSlotsPlanned:gold,silverCoinsPlanned:silver,silverCasesPlanned:silver,goldCasesRequired:null,goldPackagesRequired:null,totalCasesRequired:gold?null:silver,goldWeightVerified:false,goldExceedsSinglePackageSlots:gold>coinProductLaw.gold.productSlots,confirmedCoins:null,paymentVerified:false,orderCreated:false,productionAuthorized:false} as const;
}
