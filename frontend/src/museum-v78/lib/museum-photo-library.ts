import {orderMuseumReferences} from './luxury-windows';
import {museumVisuals,type VisualCategory} from './museum-visuals';
export const museumSourcePhotos = orderMuseumReferences([
  {image:"/museum-v78/assets/founder-entry-closed.png",title:"01 · Closed entrance",alt:"დამფუძნებლის დახურული შესასვლელის რეფერენსი"},
  {image:"/museum-v78/assets/founder-entry-open-approved.png",title:"02 · Open entrance",alt:"დამფუძნებლის ახალი ოქროსა და ვერცხლის რელიეფებიანი ღია კარი"},
  {image:"/museum-v78/assets/founder-brand-megapolis.png",title:"03 · მეგაპოლისის არქიტექტურა",alt:"მეგაპოლისის არქიტექტურული კონცეფცია; გამოსახული ფასები და ინტერფეისი მოქმედი მონაცემები არ არის"},
  {image:"/museum-v78/assets/founder-megapolis-2026-10-16.png",title:"03 · Megapolis",alt:"Megapolis-ის გარე არქიტექტურული რეფერენსი Grand Museum-ის ცენტრალური შესასვლელით"},
  {image:"/museum-v78/assets/founder-grand-museum-interior.png",title:"04 · Grand Museum · 12 Industries",alt:"Grand Museum-ის შიდა ატრიუმის დამფუძნებლის ვიზუალური რეფერენსი"},
  { image: "/museum-v78/assets/approved-mega-museum.png", title: "MEGA MUSEUM · დამტკიცებული რეფერენსი", alt: "შენ მიერ მოწოდებული ოქროსა და ვერცხლის MERGE Mega Museum" },
  { image: "/museum-v78/assets/entrance.png", title: "MERGE GATE", alt: "შენს მიერ მოწოდებული MERGE-ის ოქროსა და ვერცხლის კარი" },
  { image: "/museum-v78/assets/entrance-dual.png", title: "AURUM / ARGENTUM", alt: "შენს მიერ მოწოდებული ოქროსა და ვერცხლის დარბაზები" },
  { image: "/museum-v78/assets/coin-reference.png", title: "COIN · წყარო", alt: "შენს მიერ მოწოდებული COIN-ის იდენტობის ვიზუალური წყარო" },
  { image: "/museum-v78/assets/museum-world.png", title: "MERGE სამყარო", alt: "MERGE House & Museum-ის ვიზუალური კონცეფცია" },
  { image: "/museum-v78/assets/museum-coin-world.png", title: "MERGE COIN მუზეუმი", alt: "შენი დამატებული MERGE COIN მუზეუმის ორიგინალი ვიზუალი" },
  { image: "/museum-v78/assets/eyewear.png", title: "წითელი სათვალე", alt: "MERGE-ის წითელი მოზაიკის სათვალის ორიგინალი ვიზუალი" },
  { image: "/museum-v78/assets/coin-case.png", title: "მრგვალი ფუტლარი", alt: "MERGE-ის გახსნადი მრგვალი ფუტლარი სათვალისთვის" },
  ...museumVisuals,
]);
export const visualPhotos=museumSourcePhotos.map(photo=>({...photo,category:('category' in photo?photo.category:'სამყარო') as VisualCategory,position:'position' in photo?photo.position:'center',kicker:'kicker' in photo?photo.kicker:'FOUNDER VISUAL · CONCEPT'}));
