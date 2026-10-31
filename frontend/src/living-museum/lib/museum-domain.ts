export type Config={material:"mixed"|"silver"|"gold";scale:"fine"|"medium";name:string};
export type Product={product_id:string;root_product_id:string;title:string;subtitle:string;description:string;category:string;image:string;config:Config};
// Retained source catalog identifiers are concept references, not CORE registrations.
export const catalog:readonly Product[]=Object.freeze([
 Object.freeze({product_id:"MERGE-EYE-001",root_product_id:"MERGE-EYE-001",title:"MERGE Eyewear",subtitle:"სკულპტურული ჩარჩო · წითელი მოზაიკა",description:"შენი ატვირთული MERGE სათვალის კონცეფცია: შავი კუთხოვანი ლინზები, მეტალის ჩარჩო და წითელი მოზაიკა",category:"EYEWEAR",image:"/living-museum/assets/eyewear.png",config:Object.freeze({material:"mixed",scale:"fine",name:""}) as Config}),
 Object.freeze({product_id:"MERGE-CASE-001",root_product_id:"MERGE-CASE-001",title:"MERGE COIN",subtitle:"მრგვალი ფუტლარი · ვერცხლის ტონი",description:"შენი ატვირთული MERGE-ის გახსნილი მრგვალი ვერცხლისფერი ფუტლარი შავი კუთხოვანი სათვალით",category:"COIN CASE",image:"/living-museum/assets/coin-case.png",config:Object.freeze({material:"mixed",scale:"medium",name:""}) as Config})
]);
export function nextIndex(current:number,direction:number,length:number){if(!Number.isInteger(current)||!Number.isInteger(direction)||!Number.isInteger(length)||length<1)throw new Error("Invalid navigation");return ((current+direction)%length+length)%length;}
