import type {CityHouseId} from './megapolis-domain';

// Artwork routes are navigation metadata, never CORE products or permissions.
export type VisualDestination={kind:'city'|'museum'|'ai'|'fit'|'collection'|'materials'|'passport'|'journey'|'studio'|'brand';label:string}|{kind:'house';houseId:CityHouseId;label:string};
const city:VisualDestination={kind:'city',label:'Explore Megapolis'},museum:VisualDestination={kind:'museum',label:'Enter Grand Museum'},ai:VisualDestination={kind:'ai',label:'Open MERGE AI'},materials:VisualDestination={kind:'materials',label:'Explore materials'},collection:VisualDestination={kind:'collection',label:'Open my designs'};
const house=(houseId:CityHouseId,label:string):VisualDestination=>({kind:'house',houseId,label});
export const visualRoutes:Readonly<Record<string,VisualDestination>>={
 '/museum-v78/images/merge-ascension/originals/watch.png':house('watches','Enter Watch House · ASCENSION'),
 '/museum-v78/images/merge-ascension/originals/belt.png':house('fashion','Enter Fashion House · ASCENSION'),
 '/museum-v78/images/merge-ascension/originals/crown.png':house('jewelry','Enter Jewelry House · ASCENSION'),
 '/museum-v78/assets/merge-twelve-brand-towns-20261019.png':city,
 '/museum-v78/assets/founder-living-luxury-system-20261019.png':ai,
 '/museum-v78/assets/founder-aurum-argentum-portal.png':museum,
 '/museum-v78/assets/founder-brand-manager-dashboard.png':ai,
 '/museum-v78/assets/founder-atelier-stages-19-24.png':museum,
 '/museum-v78/assets/founder-merge-watch-your-time.png':house('watches','Enter Watch House'),
 '/museum-v78/assets/founder-composite-yarn-research.png':materials,
 '/museum-v78/assets/founder-watch-orbit-study.png':house('watches','Enter Watch House'),'/museum-v78/assets/founder-family-wardrobe-study.png':house('fashion','Enter Fashion House'),'/museum-v78/assets/founder-couture-ruby-study.png':house('fashion','Enter Fashion House'),'/museum-v78/assets/founder-yarn-process-study.png':materials,'/museum-v78/assets/founder-office-study.png':{kind:'studio',label:'Open Founder Studio'},
 '/museum-v78/assets/founder-entry-closed.png':city,'/museum-v78/assets/founder-entry-open-approved.png':city,'/museum-v78/assets/entrance.png':city,'/museum-v78/assets/entrance-dual.png':museum,
 '/museum-v78/assets/founder-megapolis-2026-10-16.png':city,'/museum-v78/assets/founder-brand-megapolis.png':city,'/museum-v78/assets/founder-clock-megapolis.png':city,'/museum-v78/assets/founder-twelve-house-metropolis.png':city,'/museum-v78/assets/founder-futuristic-museum.png':city,
 '/museum-v78/assets/founder-grand-museum-interior.png':museum,'/museum-v78/assets/approved-mega-museum.png':museum,'/museum-v78/assets/museum-world.png':museum,'/museum-v78/assets/vip-grand-museum.png':museum,'/museum-v78/assets/vip-star-dome.png':museum,'/museum-v78/assets/vip-labyrinth.png':museum,
 '/museum-v78/assets/founder-atrium-fashion.png':house('fashion','Enter Fashion House'),'/museum-v78/assets/vip-category-hall.png':house('fashion','Enter Fashion House'),'/museum-v78/assets/family-house.png':house('fashion','Enter Fashion House'),'/museum-v78/assets/elita-house.png':house('fashion','Enter Fashion House'),'/museum-v78/assets/elita-silver.png':house('fashion','Enter Fashion House'),'/museum-v78/assets/mosaic-gold.png':house('mosaic','Enter Mosaic House'),
 '/museum-v78/assets/eyewear.png':house('eyewear','Enter Eyewear House'),'/museum-v78/assets/eyewear-silver.png':house('eyewear','Enter Eyewear House'),'/museum-v78/assets/coin-case.png':house('eyewear','Explore eyewear cases'),'/museum-v78/assets/geni-story.png':house('mobility','Enter Mobility House'),
 '/museum-v78/assets/founder-brand-house-tbilisi.png':{kind:'brand',label:'Open My Brand Museum'},'/museum-v78/assets/smart-key.png':house('robotics','Open Smart Device concepts'),'/museum-v78/assets/coin-reference.png':materials,'/museum-v78/assets/museum-coin-world.png':materials,
 '/museum-v78/assets/founder-ai-brand-board.png':ai,'/museum-v78/assets/founder-ai-concierge.png':ai,'/museum-v78/assets/vip-digital-twin.png':{kind:'fit',label:'Open Fit to Me'},'/museum-v78/assets/vip-create-version.png':collection,
 '/museum-v78/assets/material-library.png':materials,'/museum-v78/assets/material-passport.png':{kind:'passport',label:'Open passport requirements'},'/museum-v78/assets/craft-ecosystem.png':{kind:'journey',label:'Explore the creation journey'},
};
export function visualDestination(image:string):VisualDestination|null{return visualRoutes[image]??null;}
export const visualJourney=[
 {image:'/museum-v78/assets/founder-megapolis-2026-10-16.png',label:'01 · Megapolis'},
 {image:'/museum-v78/assets/founder-grand-museum-interior.png',label:'02 · Grand Museum'},
 {image:'/museum-v78/assets/founder-family-wardrobe-study.png',label:'03 · Fashion House'},
 {image:'/museum-v78/assets/founder-atelier-stages-19-24.png',label:'04 · Studio / Lab · 19–24'},
 {image:'/museum-v78/assets/vip-digital-twin.png',label:'05 · Fit to Me'},
 {image:'/museum-v78/assets/material-library.png',label:'06 · Materials'},
 {image:'/museum-v78/assets/founder-brand-house-tbilisi.png',label:'07 · My Brand Museum'},
 {image:'/museum-v78/assets/founder-ai-brand-board.png',label:'08 · MERGE AI'},
] as const;
export const houseReferenceImages:Partial<Record<CityHouseId,readonly string[]>>={
 fashion:['/museum-v78/assets/founder-family-wardrobe-study.png','/museum-v78/assets/founder-couture-ruby-study.png','/museum-v78/assets/elita-house.png','/museum-v78/assets/elita-silver.png','/museum-v78/assets/family-house.png'],
 watches:['/museum-v78/assets/founder-merge-watch-your-time.png','/museum-v78/assets/founder-watch-orbit-study.png'],
 mosaic:['/museum-v78/assets/mosaic-gold.png','/museum-v78/assets/founder-yarn-process-study.png','/museum-v78/assets/material-library.png'],
 eyewear:['/museum-v78/assets/eyewear.png','/museum-v78/assets/eyewear-silver.png','/museum-v78/assets/coin-case.png'],
 mobility:['/museum-v78/assets/geni-story.png'],
};
export function houseVisualsFor(houseId:CityHouseId){return houseReferenceImages[houseId]??['/museum-v78/assets/approved-mega-museum.png'];}
