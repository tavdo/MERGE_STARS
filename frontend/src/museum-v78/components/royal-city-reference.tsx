import { CompanyMark } from '@/museum-v78/components/company-identity';

// Keep the source photograph intact. Display the founder's current identity
// over the obsolete company badges in this previously approved concept.
const badges = [
  { left: '50.0%', top: '7.3%', width: '7.2%', height: '12.5%' },
  { left: '55.9%', top: '33.5%', width: '4.4%', height: '9.3%' },
  { left: '46.3%', top: '40.5%', width: '2.2%', height: '6.0%' },
  { left: '6.1%', top: '52.8%', width: '4.4%', height: '11.8%' },
  { left: '98.0%', top: '53.7%', width: '3.2%', height: '8.1%' },
  { left: '34.7%', top: '63.4%', width: '2.1%', height: '6.0%' },
  { left: '73.3%', top: '62.1%', width: '1.8%', height: '5.5%' },
  { left: '61.2%', top: '62.8%', width: '1.6%', height: '4.9%' },
] as const;

export function RoyalCityReference() {
  return <div className="royal-city-reference"><img src="/museum-v78/assets/megapolis-city-concept.png" alt="MERGE-ის დამტკიცებული ქალაქის არქიტექტურული კონცეფცია კომპანიის ოფიციალური ნიშნებით" loading="lazy"/>{badges.map((badge,index)=><span className="royal-city-badge" key={index} style={badge} aria-hidden="true"><CompanyMark decorative/></span>)}</div>;
}
