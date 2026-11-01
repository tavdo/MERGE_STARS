import {ascensionExhibits} from './ascension-exhibits';
import {orderMuseumReferences} from "./luxury-windows";
export type VisualCategory = "მასალები" | "სამყარო" | "კოლექციები";
export type MuseumVisual = { image: string; title: string; kicker: string; category: VisualCategory; alt: string; position: string };
// Owner-supplied concept images. These visual references do not create CORE products or verified specifications.
export const museumVisuals: readonly MuseumVisual[] = orderMuseumReferences<MuseumVisual>([
 ...ascensionExhibits.map(item=>({image:item.original,title:item.title,kicker:'ASCENSION · CONCEPT',category:'კოლექციები' as const,alt:item.description,position:'center'})),
 {image:'/museum-v78/assets/merge-twelve-brand-towns-20261019.png',title:'MERGE · Twelve Brand Towns',kicker:'CONNECTED WORLD · ARCHITECTURAL CONCEPT',category:'სამყარო',alt:'Generated concept panorama of twelve town-islands around the Grand Living Museum; these are virtual creative districts, not confirmed factories or partners',position:'center'},
 {image:'/museum-v78/assets/founder-living-luxury-system-20261019.png',title:'The Living Luxury System · Founder Reference',kicker:'FOUNDER LOGO SOURCE · CONCEPT BOARD',category:'სამყარო',alt:'Founder-selected company coin medallion and luxury product concept board. Its composition labels, example weights, prices, QR codes and LIVE PASS badges are illustrative and not verified CORE records',position:'center'},
 {image:'/museum-v78/assets/founder-aurum-argentum-portal.png',title:'Aurum & Argentum · Entrance Interior',kicker:'FOUNDER ARCHITECTURAL REFERENCE',category:'სამყარო',alt:'Founder-supplied gold and silver Museum entrance interior; embedded certificates and material captions are reference artwork, not verified records',position:'center'},
 {image:'/museum-v78/assets/founder-brand-manager-dashboard.png',title:'Brand House · Working Spaces 31–36',kicker:'WORKFLOW REFERENCE · ILLUSTRATIVE METRICS',category:'სამყარო',alt:'Founder-supplied Brand House, AI, social, showroom, order and Megapolis storyboard; sample figures and connected/payment badges are illustrative',position:'center'},
 {image:'/museum-v78/assets/founder-atelier-stages-19-24.png',title:'Creative Ateliers · Stages 19–24',kicker:'DESIGN WORKFLOW · CONCEPT',category:'სამყარო',alt:'Watch, jewelry, fashion fit and accessory studios with order and Brand Room concepts; sample prices and fit/payment labels are not live records',position:'center'},
 {image:'/museum-v78/assets/founder-merge-watch-your-time.png',title:'MERGE STARS · Your Time',kicker:'WATCH DESIGN REFERENCE · CONCEPT',category:'კოლექციები',alt:'Founder-supplied ornamental gold and silver-tone MERGE watch design; physical composition, mechanism, fit, dimensions and weight are unverified',position:'center'},
 {image:'/museum-v78/assets/founder-watch-orbit-study.png',title:'Orbit Watch · Design Study',kicker:'CONCEPT · TECHNICAL VERIFICATION PENDING',category:'კოლექციები',alt:'Gold-tone and turquoise watch with illustrated dial, crown and case studies; specifications and QR are unverified',position:'center'},
 {image:'/museum-v78/assets/founder-family-wardrobe-study.png',title:'Family Wardrobe · Museum Study',kicker:'FASHION HOUSE · CONCEPT',category:'სამყარო',alt:'Founder-supplied wardrobe museum with womenswear, menswear and accessories',position:'center'},
 {image:'/museum-v78/assets/founder-couture-ruby-study.png',title:'Ruby Mosaic · Couture Study',kicker:'FASHION HOUSE · CONCEPT',category:'კოლექციები',alt:'Red, gold and silver-tone suit and gown with textile, shoe and accessory detail studies',position:'center'},
 {image:'/museum-v78/assets/founder-office-study.png',title:'Founder Studio · Architectural Study',kicker:'FOUNDER SPACE · CONCEPT',category:'სამყარო',alt:'Founder-supplied black and gold panoramic office concept',position:'center'},
 {image:'/museum-v78/assets/founder-yarn-process-study.png',title:'Composite to Textile · Process Study',kicker:'MATERIAL LIBRARY · UNVERIFIED PROCESS CONCEPT',category:'მასალები',alt:'Founder-supplied illustrated composite, spinning, yarn, weaving and finished design sequence',position:'center'},
 {image:'/museum-v78/assets/founder-composite-yarn-research.png',title:'From Composite to Yarn · Research Concept',kicker:'RESEARCH CONCEPT · TESTING REQUIRED',category:'მასალები',alt:'Founder-supplied research concept: materials, mixing, forming, fiber and yarn; melt processing, strength, conductivity and skin-contact testing remain required',position:'center'},
{"image":"/museum-v78/assets/founder-ai-brand-board.png","title":"MERGE AI · Brand Manager","kicker":"FOUNDER VISUAL · CONCEPT","category":"სამყარო","alt":"MERGE AI · Brand Manager · approved visual reference, not live data","position":"center"},
{"image":"/museum-v78/assets/founder-clock-megapolis.png","title":"12 Houses · Clock Megapolis","kicker":"FOUNDER VISUAL · CONCEPT","category":"სამყარო","alt":"12 Houses · Clock Megapolis · approved visual reference, not live data","position":"center"},
{"image":"/museum-v78/assets/founder-atrium-fashion.png","title":"Grand Atrium · Fashion House","kicker":"FOUNDER VISUAL · CONCEPT","category":"სამყარო","alt":"Grand Atrium · Fashion House · approved visual reference, not live data","position":"center"},
{"image":"/museum-v78/assets/founder-twelve-house-metropolis.png","title":"12 Houses · Grand Living Museum","kicker":"FOUNDER VISUAL · CONCEPT","category":"სამყარო","alt":"12 Houses · Grand Living Museum · approved visual reference, not live data","position":"center"},
{"image":"/museum-v78/assets/founder-futuristic-museum.png","title":"Futuristic Grand Living Museum","kicker":"FOUNDER VISUAL · CONCEPT","category":"სამყარო","alt":"Futuristic Grand Living Museum · approved visual reference, not live data","position":"center"},
{"image":"/museum-v78/assets/founder-brand-house-tbilisi.png","title":"MERGE Brand House · Tbilisi","kicker":"FOUNDER VISUAL · CONCEPT","category":"სამყარო","alt":"MERGE Brand House · Tbilisi · approved visual reference, not live data","position":"center"},
{"image":"/museum-v78/assets/founder-ai-concierge.png","title":"MERGE AI · Museum Concierge","kicker":"FOUNDER VISUAL · CONCEPT","category":"სამყარო","alt":"MERGE AI · Museum Concierge · approved visual reference, not live data","position":"center"},
  {
    "image": "/museum-v78/assets/vip-grand-museum.png",
    "title": "Grand Museum · One World",
    "kicker": "VIP MASTER EXPERIENCE",
    "category": "სამყარო",
    "alt": "MERGE-ის მრავალკატეგორიული Grand Living Museum-ის დამფუძნებლის კონცეფცია",
    "position": "center"
  },
  {
    "image": "/museum-v78/assets/vip-category-hall.png",
    "title": "კატეგორიების დიდი დარბაზი",
    "kicker": "DISCOVER · CHOOSE · CREATE",
    "category": "სამყარო",
    "alt": "VIP კლიენტის მრავალკატეგორიული სამუზეუმო დარბაზის კონცეფცია",
    "position": "center"
  },
  {
    "image": "/museum-v78/assets/vip-create-version.png",
    "title": "Create My Version",
    "kicker": "SOURCE → VERSION → LINEAGE",
    "category": "სამყარო",
    "alt": "ექსპონატის არჩევისა და საკუთარი ვერსიის შექმნის ინტერფეისის კონცეფცია",
    "position": "center"
  },
  {
    "image": "/museum-v78/assets/vip-digital-twin.png",
    "title": "Digital Twin · Fit to Me",
    "kicker": "CONSENT-BASED FIT",
    "category": "სამყარო",
    "alt": "თანხმობაზე დაფუძნებული Digital Twin და პროდუქტის მორგების სივრცის კონცეფცია",
    "position": "center"
  },
  {
    "image": "/museum-v78/assets/vip-star-dome.png",
    "title": "ვარსკვლავური გუმბათი",
    "kicker": "ONE MUSEUM · MANY HOUSES",
    "category": "სამყარო",
    "alt": "ერთიანი MERGE Living Museum-ის ვარსკვლავური გუმბათის კონცეფცია",
    "position": "center"
  },
  {
    "image": "/museum-v78/assets/vip-labyrinth.png",
    "title": "MERGE Labyrinth",
    "kicker": "DISCOVERY MAP · CONCEPT",
    "category": "სამყარო",
    "alt": "MERGE-ის მუზეუმის ლაბირინთული აღმოჩენის რუკის კონცეფცია",
    "position": "center"
  },
  {
    "image": "/museum-v78/assets/material-passport.png",
    "title": "ფილამენტი და ძაფი",
    "kicker": "MATERIAL STUDIES",
    "category": "მასალები",
    "alt": "MERGE-ის ფილამენტისა და ძაფის ვიზუალური სპეციფიკაციები",
    "position": "center"
  },
  {
    "image": "/museum-v78/assets/material-library.png",
    "title": "მასალების კოლექცია",
    "kicker": "THE MATERIAL LIBRARY",
    "category": "მასალები",
    "alt": "MERGE-ის მეტალის ტონის ფილამენტები და მოზაიკის ძაფები",
    "position": "center"
  },
  {
    "image": "/museum-v78/assets/geni-story.png",
    "title": "MERGE GENI",
    "kicker": "AUTOMOTIVE HOUSE",
    "category": "სამყარო",
    "alt": "MERGE GENI ავტომობილისა და Living Museum-ის სცენარი",
    "position": "center"
  },
  {
    "image": "/museum-v78/assets/eyewear-silver.png",
    "title": "ვერცხლისფერი ხედვა",
    "kicker": "MERGE EYEWEAR",
    "category": "კოლექციები",
    "alt": "შავი კუთხოვანი სათვალე ვერცხლისფერი ჩარჩოთი და ლურჯი მოზაიკით",
    "position": "center 25%"
  },
  {
    "image": "/museum-v78/assets/family-house.png",
    "title": "Family House",
    "kicker": "THE WARDROBE MUSEUM",
    "category": "სამყარო",
    "alt": "MERGE Family House-ის სამოსისა და აქსესუარების მუზეუმი",
    "position": "center"
  },
  {
    "image": "/museum-v78/assets/smart-key.png",
    "title": "პირადი გასაღები",
    "kicker": "SMART KEY · CONCEPT",
    "category": "კოლექციები",
    "alt": "MERGE Smart Key Card-ის კონცეფცია მრგვალ გახსნად ფუტლარში",
    "position": "center 30%"
  },
  {
    "image": "/museum-v78/assets/craft-ecosystem.png",
    "title": "შენი ბრენდი. ჩვენი ხელობა.",
    "kicker": "THE JEWELER OF BRANDS",
    "category": "სამყარო",
    "alt": "MERGE-ის ბრენდის, მასალისა და წარმოების კონცეპტუალური სქემა",
    "position": "center"
  },
  {
    "image": "/museum-v78/assets/elita-silver.png",
    "title": "ELITA · ვერცხლისფერი",
    "kicker": "FASHION · TIME · EYEWEAR",
    "category": "კოლექციები",
    "alt": "ELITA-ს ვერცხლისფერი მოზაიკის სამოსი, საათი, სათვალე და სამკაული",
    "position": "center 30%"
  },
  {
    "image": "/museum-v78/assets/mosaic-gold.png",
    "title": "მოზაიკის ხელწერა",
    "kicker": "ONE PATTERN · MANY FORMS",
    "category": "კოლექციები",
    "alt": "MERGE-ის ოქროსფერი მოზაიკის სამოსი, საათი და სათვალე",
    "position": "center 35%"
  },
  {
    "image": "/museum-v78/assets/elita-house.png",
    "title": "MERGE ELITA",
    "kicker": "THE BRAND HOUSE",
    "category": "კოლექციები",
    "alt": "MERGE ELITA-ს სამოსი, მოზაიკის ჩანთები და ბრენდის ფუტლარის ვიზუალი",
    "position": "center 30%"
  }
]);
