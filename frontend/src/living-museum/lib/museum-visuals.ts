export type VisualCategory = "მასალები" | "სამყარო" | "კოლექციები";
export type MuseumVisual = { image: string; title: string; kicker: string; category: VisualCategory; alt: string; position: string };
// Owner-supplied concept images. These visual references do not create CORE products or verified specifications.
export const museumVisuals: readonly MuseumVisual[] = [
  {
    "image": "/living-museum/assets/vip-grand-museum.png",
    "title": "Grand Museum · One World",
    "kicker": "VIP MASTER EXPERIENCE",
    "category": "სამყარო",
    "alt": "MERGE-ის მრავალკატეგორიული Grand Living Museum-ის დამფუძნებლის კონცეფცია",
    "position": "center"
  },
  {
    "image": "/living-museum/assets/vip-category-hall.png",
    "title": "კატეგორიების დიდი დარბაზი",
    "kicker": "DISCOVER · CHOOSE · CREATE",
    "category": "სამყარო",
    "alt": "VIP კლიენტის მრავალკატეგორიული სამუზეუმო დარბაზის კონცეფცია",
    "position": "center"
  },
  {
    "image": "/living-museum/assets/vip-create-version.png",
    "title": "Create My Version",
    "kicker": "SOURCE → VERSION → LINEAGE",
    "category": "სამყარო",
    "alt": "ექსპონატის არჩევისა და საკუთარი ვერსიის შექმნის ინტერფეისის კონცეფცია",
    "position": "center"
  },
  {
    "image": "/living-museum/assets/vip-digital-twin.png",
    "title": "Digital Twin · Fit to Me",
    "kicker": "CONSENT-BASED FIT",
    "category": "სამყარო",
    "alt": "თანხმობაზე დაფუძნებული Digital Twin და პროდუქტის მორგების სივრცის კონცეფცია",
    "position": "center"
  },
  {
    "image": "/living-museum/assets/vip-star-dome.png",
    "title": "ვარსკვლავური გუმბათი",
    "kicker": "ONE MUSEUM · MANY HOUSES",
    "category": "სამყარო",
    "alt": "ერთიანი MERGE Living Museum-ის ვარსკვლავური გუმბათის კონცეფცია",
    "position": "center"
  },
  {
    "image": "/living-museum/assets/vip-labyrinth.png",
    "title": "MERGE Labyrinth",
    "kicker": "DISCOVERY MAP · CONCEPT",
    "category": "სამყარო",
    "alt": "MERGE-ის მუზეუმის ლაბირინთული აღმოჩენის რუკის კონცეფცია",
    "position": "center"
  },
  {
    "image": "/living-museum/assets/material-passport.png",
    "title": "ფილამენტი და ძაფი",
    "kicker": "MATERIAL STUDIES",
    "category": "მასალები",
    "alt": "MERGE-ის ფილამენტისა და ძაფის ვიზუალური სპეციფიკაციები",
    "position": "center"
  },
  {
    "image": "/living-museum/assets/material-library.png",
    "title": "მასალების კოლექცია",
    "kicker": "THE MATERIAL LIBRARY",
    "category": "მასალები",
    "alt": "MERGE-ის მეტალის ტონის ფილამენტები და მოზაიკის ძაფები",
    "position": "center"
  },
  {
    "image": "/living-museum/assets/geni-story.png",
    "title": "MERGE GENI",
    "kicker": "AUTOMOTIVE HOUSE",
    "category": "სამყარო",
    "alt": "MERGE GENI ავტომობილისა და Living Museum-ის სცენარი",
    "position": "center"
  },
  {
    "image": "/living-museum/assets/eyewear-silver.png",
    "title": "ვერცხლისფერი ხედვა",
    "kicker": "MERGE EYEWEAR",
    "category": "კოლექციები",
    "alt": "შავი კუთხოვანი სათვალე ვერცხლისფერი ჩარჩოთი და ლურჯი მოზაიკით",
    "position": "center 25%"
  },
  {
    "image": "/living-museum/assets/family-house.png",
    "title": "Family House",
    "kicker": "THE WARDROBE MUSEUM",
    "category": "სამყარო",
    "alt": "MERGE Family House-ის სამოსისა და აქსესუარების მუზეუმი",
    "position": "center"
  },
  {
    "image": "/living-museum/assets/smart-key.png",
    "title": "პირადი გასაღები",
    "kicker": "SMART KEY · CONCEPT",
    "category": "კოლექციები",
    "alt": "MERGE Smart Key Card-ის კონცეფცია მრგვალ გახსნად ფუტლარში",
    "position": "center 30%"
  },
  {
    "image": "/living-museum/assets/craft-ecosystem.png",
    "title": "შენი ბრენდი. ჩვენი ხელობა.",
    "kicker": "THE JEWELER OF BRANDS",
    "category": "სამყარო",
    "alt": "MERGE-ის ბრენდის, მასალისა და წარმოების კონცეპტუალური სქემა",
    "position": "center"
  },
  {
    "image": "/living-museum/assets/elita-silver.png",
    "title": "ELITA · ვერცხლისფერი",
    "kicker": "FASHION · TIME · EYEWEAR",
    "category": "კოლექციები",
    "alt": "ELITA-ს ვერცხლისფერი მოზაიკის სამოსი, საათი, სათვალე და სამკაული",
    "position": "center 30%"
  },
  {
    "image": "/living-museum/assets/mosaic-gold.png",
    "title": "მოზაიკის ხელწერა",
    "kicker": "ONE PATTERN · MANY FORMS",
    "category": "კოლექციები",
    "alt": "MERGE-ის ოქროსფერი მოზაიკის სამოსი, საათი და სათვალე",
    "position": "center 35%"
  },
  {
    "image": "/living-museum/assets/elita-house.png",
    "title": "MERGE ELITA",
    "kicker": "THE BRAND HOUSE",
    "category": "კოლექციები",
    "alt": "MERGE ELITA-ს სამოსი, მოზაიკის ჩანთები და ბრენდის ფუტლარის ვიზუალი",
    "position": "center 30%"
  }
];
