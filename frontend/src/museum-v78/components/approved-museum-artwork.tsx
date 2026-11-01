import {companyIdentity} from '@/museum-v78/lib/company-identity';

// Presentation composition over the unchanged approved image. The image's
// baked navigation and approximate logo are not active UI or company identity.
// Every visible architectural identity overlay uses the canonical asset itself.
export function ApprovedMuseumArtwork({className='',onError}:{className?:string;onError?:()=>void}){
 return <svg className={'approved-museum-artwork '+className} viewBox="0 0 1536 1024" width="1536" height="1024" preserveAspectRatio="xMidYMin slice" role="img" aria-label="Approved Grand Museum architecture with the unchanged official MERGE identity">
  <image href="/museum-v78/assets/founder-grand-museum-interior.png" x="0" y="0" width="1536" height="1024" onError={onError}/>
  <rect x="0" y="0" width="1536" height="62" fill="#080a0d"/>
  <rect x="704" y="64" width="128" height="151" rx="4" fill="#090b0e" stroke="#b59a65" strokeWidth="1"/>
  <image href={companyIdentity.mark} x="721" y="71" width="94" height="94" preserveAspectRatio="xMidYMid meet"/>
  <text x="768" y="187" textAnchor="middle" fill="#ddc297" fontFamily="Georgia, serif" fontSize="13" letterSpacing="2">MERGE STARS</text>
 </svg>;
}
