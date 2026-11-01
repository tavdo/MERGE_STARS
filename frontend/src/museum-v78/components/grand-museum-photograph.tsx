"use client";
import {CompanyWordmark} from './company-identity';
import {museumPresentationAsset} from '@/museum-v78/lib/museum-assets';

// The retained interior photograph is the arrival scene. Only its illustrative
// interface areas are covered; all navigation is real DOM in GrandAtrium.
export function GrandMuseumPhotograph({onError}:{onError:()=>void}){
 return <div className="grand-museum-photograph" data-primary-museum-image="/museum-v78/assets/approved-mega-museum.png">
  <img src={museumPresentationAsset('/museum-v78/assets/approved-mega-museum.png')} alt="Approved gold and silver Grand Living Museum interior with the central fountain and category exhibits" onError={onError} fetchPriority="high"/>
  <div className="grand-photo-interface-masks" aria-hidden="true"><i className="grand-photo-mask-header"/><i className="grand-photo-mask-left"/><i className="grand-photo-mask-right"/><i className="grand-photo-mask-footer"/></div>
  <div className="grand-photo-identity"><CompanyWordmark/><span>GRAND LIVING MUSEUM</span></div>
 </div>;
}
