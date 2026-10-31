"use client";
import { Expand } from "lucide-react";
import { getMuseumScenePoint, museumScenes, type HouseView, type MuseumSceneId } from "@/living-museum/lib/museum-tour";
import { MuseumGenerationStatus, MuseumShare } from "@/living-museum/components/museum-activity";
import { ItemCoinLaw } from "@/living-museum/components/item-coin-law";

export function MuseumPointDossier({ view, sceneId, onOriginal }: { view: HouseView; sceneId: MuseumSceneId; onOriginal: () => void }) {
  const point = getMuseumScenePoint(sceneId, view.point_id), camera = view.camera, scene = museumScenes[sceneId];
  return <div className="museum-point-dossier">
    <div className="point-scene-detail"><img src={scene.image} alt={`${point.title} — ორიგინალი მუზეუმის ფოტოს მოახლოებული დეტალი`} draggable={false} style={{ width: `${camera.zoom * 100}%`, height: `${camera.zoom * 100}%`, left: `${50 - camera.x * camera.zoom}%`, top: `${50 - camera.y * camera.zoom}%` }} /></div>
    <button className="text-link" onClick={onOriginal}><Expand size={15} />ორიგინალი ფოტოს ნახვა</button>
    <span className="eyebrow">{point.caption}</span><h3>{point.title}</h3>
    <p>ატვირთულ მუზეუმში არსებული ვიზუალური ექსპონატი. ეს ფოტო გაზომვადი 3D მოდელი არ არის.</p>
    <dl className="point-source"><div><dt>წყარო</dt><dd>შენ მიერ ატვირთული {scene.title}</dd></div><div><dt>CORE პროდუქტი და უფლებები</dt><dd>დაკავშირების მოლოდინში</dd></div><div><dt>მორგება, წონა და ფასი</dt><dd>{point.id === "watches" ? "საჭიროა საათის ჩანაწერი, მაჯის პროფილი და გაზომვადი გეომეტრია." : "საჭიროა არსებული Fit Profile, პროდუქტის გეომეტრია და დამტკიცებული მასალის მონაცემები."}</dd></div></dl>
    <ItemCoinLaw compact />
    <MuseumGenerationStatus sourceReference={null} />
    <MuseumShare pointId={point.id} />
  </div>;
}
