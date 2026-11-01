import {founderPaymentLaw} from './founder-payment-law';

/** Normalized educational arithmetic only. Never reads a live price, issues a
 * quote, creates an order, credits a wallet or settles a deferred charge. */
export function commissionCoinScenario(input:{orderGrossCoinUnits:number;vatPercent:0|18;brandShareBasisPoints:3300|1650}){
 const {orderGrossCoinUnits:gross,vatPercent,brandShareBasisPoints:share}=input;
 if(!Number.isFinite(gross)||gross<.01||gross>100||![0,18].includes(vatPercent)||![3300,1650].includes(share))return null;
 // Existing separate 2% fee is ON TOP of the product base. This scenario assumes
 // the customer total includes it and VAT applies equally to product + service.
 // Dividing by 1.02 removes that included fee; subtracting 2% again would be wrong.
 const beforeVat=gross/(1+vatPercent/100);
 const productBase=beforeVat/(1+founderPaymentLaw.separatePlatformFeeBasisPoints/10000);
 const platformFee=beforeVat-productBase,vat=gross-beforeVat;
 const commission=productBase*share/10000;
 const ordersRequired=Math.ceil(1/commission);
 if(!Number.isSafeInteger(ordersRequired))return null;
 return {scenarioOnly:true,targetCoinUnits:1,assumedStartingAvailableCoinUnits:0,gross,vat,platformFee,productBase,commission,
   ordersRequired,totalCommission:ordersRequired*commission,
   previousOrderCountCommission:(ordersRequired-1)*commission,
   scenarioRows:[1,2,3,4].map(orders=>({orders,commission:orders*commission})),
   doublingWaves:[{stage:1,newOrders:1,cumulativeOrders:1},{stage:2,newOrders:2,cumulativeOrders:3},{stage:3,newOrders:4,cumulativeOrders:7}],
   orderCreated:false,paymentVerified:false,commissionAvailable:false,coinSettled:false} as const;
}
