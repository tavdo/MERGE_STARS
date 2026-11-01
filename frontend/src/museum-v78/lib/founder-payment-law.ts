// Founder-authored specification and explicit examples, not a pricing,
// commission, entitlement or settlement engine. CORE is the system of record.
export const founderPaymentLaw = Object.freeze({
  status: 'SPECIFICATION_ONLY',
  allocations: Object.freeze([
    Object.freeze({key:'company',basisPoints:3300,percent:'33%',ka:'MERGE · წარმოება, პოლიმერი, მომსახურება',en:'MERGE · production, polymer, service'}),
    Object.freeze({key:'metal',basisPoints:3300,percent:'33%',ka:'ძვირფასი ლითონის წილი',en:'Precious-metal allocation'}),
    Object.freeze({key:'source',basisPoints:1650,percent:'16.5%',ka:'Source Brand House',en:'Source Brand House'}),
    Object.freeze({key:'destination',basisPoints:1650,percent:'16.5%',ka:'Destination Brand House',en:'Destination Brand House'}),
    Object.freeze({key:'construction',basisPoints:100,percent:'1%',ka:'ფიზიკური მეგაპოლისის სამშენებლო ფონდი',en:'Physical Megapolis construction fund'}),
  ]),
  separatePlatformFeeBasisPoints:200,
  sameHouseBrandShareBasisPoints:3300,
  taxStatus:'CORE_TAX_TREATMENT_PENDING',
  payable:false,
  verifiedOffer:false,
} as const);

// Amounts supplied by the Founder, in USD cents. They are deliberately
// independent of the LIVE feed and never used by an order/payment endpoint.
export const commercialIllustrations = Object.freeze({
  SILVER:Object.freeze({baseMinor:200000,company:66000,metal:66000,source:33000,destination:33000,construction:2000,platformFeeMinor:4000,subtotalBeforeVatMinor:204000}),
  GOLD:Object.freeze({baseMinor:13000000,company:4290000,metal:4290000,source:2145000,destination:2145000,construction:130000,platformFeeMinor:260000,subtotalBeforeVatMinor:13260000}),
});
