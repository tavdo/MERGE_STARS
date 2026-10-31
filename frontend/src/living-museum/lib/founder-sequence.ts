const asset = (name: string) => `/living-museum/assets/${name}-oct18.png`;

export const founderSequence = [
  { id: 'entrance', title: 'შესასვლელი', image: asset('founder-open-portal'), action: 'museum', label: 'მუზეუმში შესვლა' },
  { id: 'collections', title: 'კოლექციები', image: asset('founder-collection-fit'), action: 'catalog', label: 'CORE კოლექციების გახსნა' },
  { id: 'fit', title: 'პირადი მორგება', image: asset('founder-private-studios'), action: '/digital-twin', label: 'Digital Twin-ის გახსნა' },
  { id: 'creation', title: 'შექმნა და ვერსიები', image: asset('founder-journey-01-18'), action: '/create', label: 'შექმნის სივრცე' },
  { id: 'ateliers', title: 'თემატური სახელოსნოები', image: asset('founder-journey-19-24'), action: 'catalog', label: 'ნივთის არჩევა კოლექციიდან' },
  { id: 'materials', title: 'მასალა და შემოწმება', image: asset('founder-journey-01-18'), action: '/materials', label: 'მასალების სივრცე' },
  { id: 'order', title: 'შეკვეთა', image: asset('founder-journey-19-24'), action: 'commercial', label: 'შეკვეთის პირობების შემოწმება' },
  { id: 'brand', title: 'ჩემი Brand Room', image: asset('founder-journey-19-24'), action: '/my-museum', label: 'ჩემი Brand Museum' },
] as const;

export const founderSequencePhotos = Array.from(new Map(founderSequence.map(stage => [stage.image, {
  image: stage.image, title: stage.title, alt: `MERGE · ${stage.title} · დამფუძნებლის კონცეფტუალური რეფერენსი`,
}])).values());
