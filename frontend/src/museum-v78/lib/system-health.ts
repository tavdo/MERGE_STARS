import {z} from 'zod';
export const systemHealthSchema=z.object({
 checked_at:z.string().datetime(),scope:z.literal('PRIVATE_EXPERIENCE_PROJECT'),overall:z.enum(['DEGRADED','INCIDENT']),
 services:z.array(z.object({id:z.string(),label:z.string(),status:z.enum(['AVAILABLE','DEGRADED','UNAVAILABLE','SETUP_REQUIRED']),detail:z.string()})).max(20),
 private_briefs:z.number().int().nonnegative().nullable(),
 public_catalog:z.object({collections:z.number().int().nonnegative(),brand_lines:z.number().int().nonnegative()}).nullable(),
 verified_orders:z.null(),verified_payments:z.null(),production_queue:z.null(),commissions_available:z.null(),
}).strict();
export type SystemHealth=z.infer<typeof systemHealthSchema>;
// Isolated planning arithmetic: never creates CORE orders or settlement events.
export function growthScenario(seedOrders:number,ordersPerSeed:number){
 if(!Number.isSafeInteger(seedOrders)||!Number.isSafeInteger(ordersPerSeed)||seedOrders<0||ordersPerSeed<0||seedOrders>1000000||ordersPerSeed>1000000)throw Error('INVALID_SCENARIO');
 return {seedOrders,ordersPerSeed,possibleAdditionalOrders:seedOrders*ordersPerSeed,scenarioOnly:true,guaranteed:false,realOrdersCreated:0} as const;
}
export function goldMassReadiness(itemMasses:readonly (number|null)[],caseMass:number|null){
 if(itemMasses.length<1||itemMasses.length>12)return {status:'VERIFICATION_REQUIRED',totalGrams:null} as const;
 if(caseMass===null||itemMasses.some(value=>value===null))return {status:'CALCULATION_PENDING',totalGrams:null} as const;
 const values=[...itemMasses,caseMass] as number[];
 if(values.some(v=>!Number.isFinite(v)||v<0))return {status:'VERIFICATION_REQUIRED',totalGrams:null} as const;
 const total=values.reduce((a,b)=>a+b,0);
 return {status:total<=1000?'WITHIN_MASS_LIMIT':'EXCEEDS_MASS_LIMIT',totalGrams:total} as const;
}
