import type { SceneCamera } from "./scene-camera";

export type MuseumPointId = "overview" | "art" | "music" | "furniture" | "automotive" | "watches" | "jewelry" | "fashion" | "eyewear" | "case" | "bathroom" | "dining" | "games" | "stationery" | "decor" | "technology" | "motorcycles" | "architecture" | "bags" | "shoes" | "collectibles" | "mosaic";
export type MuseumSceneId = "house" | "coin";
type MuseumPoint = { id: MuseumPointId; title: string; caption: string; x: number; y: number; camera: Readonly<SceneCamera>; source_reference_id: string | null; preview_image?: string };
export type HouseView = { kind: "house"; point_id: MuseumPointId; camera: SceneCamera };
export type MuseumView = HouseView | { kind: "exhibit"; point_id: MuseumPointId; camera: SceneCamera; source_reference_id: string };

export const museumScene = Object.freeze({ image: "/museum-v78/assets/museum-world.png", alt: "შენ მიერ ატვირთული MERGE House & Museum-ის ერთიანი სივრცე" });
export const museumScenes = Object.freeze({
  house: Object.freeze({ ...museumScene, title: "MERGE HOUSE" }),
  coin: Object.freeze({ image: "/museum-v78/assets/approved-mega-museum.png", title: "MERGE COIN", alt: "შენ მიერ ატვირთული ოქროსა და ვერცხლის MERGE COIN მუზეუმის ვიზუალური სივრცე" }),
});

// Camera anchors in ONE uploaded scene, never rooms, CORE entity identifiers,
// physical measurements, partner permissions or product records.
// The two retained concept references remain experience-only.
export const museumPoints: readonly Readonly<MuseumPoint>[] = Object.freeze([
  { id: "overview", title: "საერთო ხედვა", caption: "MERGE HOUSE & MUSEUM", x: 50, y: 50, camera: { x: 50, y: 50, zoom: 1 }, source_reference_id: null },
  { id: "art", title: "ქანდაკება და ხელოვნება", caption: "STATUES & ART", x: 11, y: 27, camera: { x: 21, y: 30, zoom: 2.4 }, source_reference_id: null },
  { id: "music", title: "როიალი და საკრავები", caption: "MUSICAL INSTRUMENTS", x: 26, y: 31, camera: { x: 28, y: 32, zoom: 2.4 }, source_reference_id: null },
  { id: "furniture", title: "ავეჯი", caption: "FURNITURE", x: 23, y: 48, camera: { x: 23, y: 48, zoom: 2.3 }, source_reference_id: null },
  { id: "automotive", title: "ავტომობილი", caption: "AUTOMOTIVE", x: 50, y: 44, camera: { x: 50, y: 47, zoom: 2.4 }, source_reference_id: null },
  { id: "watches", title: "დიდი საჩვენებელი საათი", caption: "WATCHES", x: 81, y: 25, camera: { x: 81, y: 25, zoom: 2.8 }, source_reference_id: null },
  { id: "jewelry", title: "სამკაული", caption: "JEWELRY", x: 92, y: 43, camera: { x: 81, y: 43, zoom: 2.7 }, source_reference_id: null },
  { id: "fashion", title: "მოდა", caption: "FASHION", x: 73, y: 30, camera: { x: 73, y: 32, zoom: 2.6 }, source_reference_id: null },
  { id: "eyewear", title: "მოზაიკის სათვალე", caption: "EYEWEAR · CONCEPT", x: 63, y: 45, camera: { x: 63, y: 45, zoom: 2.6 }, source_reference_id: "MERGE-EYE-001", preview_image: "/museum-v78/assets/eyewear.png" },
  { id: "case", title: "გახსნადი მრგვალი ქეისი", caption: "MERGE COIN · CONCEPT", x: 64, y: 60, camera: { x: 64, y: 60, zoom: 2.5 }, source_reference_id: "MERGE-CASE-001", preview_image: "/museum-v78/assets/coin-case.png" },
  { id: "bathroom", title: "აბაზანა", caption: "SANITARY & BATHROOM", x: 85, y: 54, camera: { x: 77, y: 54, zoom: 2.2 }, source_reference_id: null },
  { id: "dining", title: "სუფრა და ჭურჭელი", caption: "TABLEWARE & DINING", x: 17, y: 65, camera: { x: 21, y: 64, zoom: 2.4 }, source_reference_id: null },
  { id: "games", title: "ჭადრაკი და თამაშები", caption: "GAMES", x: 76, y: 66, camera: { x: 76, y: 66, zoom: 2.3 }, source_reference_id: null },
  { id: "stationery", title: "საკანცელარიო ნიმუში", caption: "STATIONERY & OFFICE", x: 73, y: 85, camera: { x: 73, y: 83, zoom: 3 }, source_reference_id: null },
  { id: "decor", title: "დეკორი", caption: "DECORATIVE OBJECTS", x: 79, y: 81, camera: { x: 79, y: 80, zoom: 2.6 }, source_reference_id: null },
  { id: "technology", title: "ტექნოლოგიის ნიმუში", caption: "SMART HOME", x: 85, y: 85, camera: { x: 83, y: 83, zoom: 3 }, source_reference_id: null },
].map(point => Object.freeze({ ...point, camera: Object.freeze(point.camera) })) as MuseumPoint[]);

// A second owner-supplied view inside the same Museum. Anchors describe this
// photograph, never a product, partner, patent, weight or permission record.
export const museumCoinPoints: readonly Readonly<MuseumPoint>[] = Object.freeze([
  { id: "overview", title: "საერთო ხედვა", caption: "MERGE COIN · LIVING MUSEUM", x: 50, y: 50, camera: { x: 50, y: 50, zoom: 1 }, source_reference_id: null },
  { id: "art", title: "ხელოვნება", caption: "ART & CULTURE", x: 14, y: 55, camera: { x: 21, y: 51, zoom: 2.5 }, source_reference_id: null },
  { id: "music", title: "მუსიკა და საკრავები", caption: "MUSIC", x: 23, y: 53, camera: { x: 26, y: 52, zoom: 2.6 }, source_reference_id: null },
  { id: "furniture", title: "ავეჯი", caption: "FURNITURE", x: 34, y: 54, camera: { x: 35, y: 52, zoom: 2.5 }, source_reference_id: null },
  { id: "fashion", title: "მოდა", caption: "FASHION", x: 49, y: 51, camera: { x: 49, y: 50, zoom: 2.5 }, source_reference_id: null },
  { id: "automotive", title: "ავტომობილი", caption: "AUTOMOTIVE", x: 63, y: 54, camera: { x: 63, y: 53, zoom: 2.7 }, source_reference_id: null },
  { id: "motorcycles", title: "მოტოციკლები", caption: "MOTORCYCLES", x: 73, y: 54, camera: { x: 73, y: 54, zoom: 2.8 }, source_reference_id: null },
  { id: "architecture", title: "არქიტექტურა", caption: "ARCHITECTURE", x: 82, y: 53, camera: { x: 81, y: 52, zoom: 2.8 }, source_reference_id: null },
  { id: "jewelry", title: "სამკაული", caption: "JEWELRY", x: 12, y: 67, camera: { x: 20, y: 64, zoom: 2.6 }, source_reference_id: null },
  { id: "watches", title: "საჩვენებელი საათი", caption: "WATCHES", x: 19, y: 66, camera: { x: 21, y: 64, zoom: 2.8 }, source_reference_id: null },
  { id: "eyewear", title: "მოზაიკის სათვალე", caption: "EYEWEAR · CONCEPT", x: 27, y: 67, camera: { x: 27, y: 65, zoom: 2.7 }, source_reference_id: "MERGE-EYE-001", preview_image: "/museum-v78/assets/eyewear.png" },
  { id: "bags", title: "ჩანთები", caption: "BAGS", x: 34, y: 67, camera: { x: 34, y: 65, zoom: 2.7 }, source_reference_id: null },
  { id: "case", title: "გახსნადი მრგვალი ქეისი", caption: "MERGE COIN · CONCEPT", x: 50, y: 37, camera: { x: 50, y: 37, zoom: 2.5 }, source_reference_id: "MERGE-CASE-001", preview_image: "/museum-v78/assets/coin-case.png" },
  { id: "shoes", title: "ფეხსაცმელი", caption: "SHOES", x: 54, y: 67, camera: { x: 54, y: 65, zoom: 2.7 }, source_reference_id: null },
  { id: "stationery", title: "კანცელარია", caption: "STATIONERY", x: 62, y: 67, camera: { x: 62, y: 65, zoom: 2.8 }, source_reference_id: null },
  { id: "technology", title: "ტექნოლოგია", caption: "TECHNOLOGY", x: 69, y: 67, camera: { x: 69, y: 65, zoom: 2.8 }, source_reference_id: null },
  { id: "collectibles", title: "საკოლექციო ნივთები", caption: "COLLECTIBLES", x: 75, y: 66, camera: { x: 75, y: 64, zoom: 2.8 }, source_reference_id: null },
  { id: "decor", title: "ინტერიერი და დეკორი", caption: "INTERIOR", x: 81, y: 67, camera: { x: 80, y: 65, zoom: 2.8 }, source_reference_id: null },
  { id: "mosaic", title: "მოზაიკა", caption: "MERGE MOSAIC", x: 87, y: 66, camera: { x: 81, y: 64, zoom: 2.8 }, source_reference_id: null },
].map(point => Object.freeze({ ...point, camera: Object.freeze(point.camera) })) as MuseumPoint[]);

export function museumScenePoints(sceneId: MuseumSceneId) {
  if (sceneId === "house") return museumPoints;
  if (sceneId === "coin") return museumCoinPoints;
  throw new Error("Unknown Museum scene");
}
export function getMuseumScenePoint(sceneId: MuseumSceneId, id: string): Readonly<MuseumPoint> {
  const point = museumScenePoints(sceneId).find(point => point.id === id);
  if (!point) throw new Error("Point is not in this Museum view");
  return point;
}

export function getMuseumPoint(id: string): Readonly<MuseumPoint> {
  const point = museumPoints.find(point => point.id === id) ?? museumCoinPoints.find(point => point.id === id);
  if (!point) throw new Error("Unknown Museum point");
  return point;
}
export function approachMuseumPoint(id: MuseumPointId, sceneId: MuseumSceneId = "house"): HouseView {
  const point = getMuseumScenePoint(sceneId, id);
  return { kind: "house", point_id: point.id, camera: { ...point.camera } };
}
export function enterMuseum(): HouseView { return approachMuseumPoint("overview"); }
export function moveMuseumPoint(id: MuseumPointId, direction: number, sceneId: MuseumSceneId = "house"): HouseView {
  if (direction !== -1 && direction !== 1) throw new Error("Invalid navigation direction");
  getMuseumScenePoint(sceneId, id);
  const points = museumScenePoints(sceneId), index = points.findIndex(point => point.id === id);
  return approachMuseumPoint(points[(index + direction + points.length) % points.length].id, sceneId);
}
export function pointForMuseumReference(reference: string): Readonly<MuseumPoint> {
  const point = museumPoints.find(point => point.source_reference_id === reference);
  if (!point) throw new Error("Unknown Museum concept reference");
  return point;
}
export function openMuseumExhibit(view: HouseView, reference: string): MuseumView {
  if (getMuseumPoint(view.point_id).source_reference_id !== reference) throw new Error("Exhibit is not available at this point");
  return { kind: "exhibit", point_id: view.point_id, camera: { ...view.camera }, source_reference_id: reference };
}
export function returnToMuseum(view: MuseumView): HouseView {
  getMuseumPoint(view.point_id);
  return { kind: "house", point_id: view.point_id, camera: { ...view.camera } };
}
