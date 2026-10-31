"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUp, Expand, MapPin, Plus, Minus, RotateCcw, Watch, MoveUpRight } from "lucide-react";
import { getMuseumScenePoint, moveMuseumPoint, museumScenePoints, museumScenes, type HouseView, type MuseumPointId, type MuseumSceneId } from "@/living-museum/lib/museum-tour";
import { panScene, zoomScene, type SceneCamera } from "@/living-museum/lib/scene-camera";
import { MuseumShare } from "@/living-museum/components/museum-activity";

export function MuseumHouse({ view, sceneId, disabled, onPoint, onCamera, onExhibit, onCreate, onInspect, onOriginal }: {
  view: HouseView; sceneId: MuseumSceneId; disabled: boolean; onPoint: (id: MuseumPointId) => void;
  onCamera: (camera: SceneCamera) => void; onExhibit: (reference: string) => void; onCreate: (reference: string) => void; onInspect: () => void; onOriginal: (image: string) => void;
}) {
  const points = museumScenePoints(sceneId), scene = museumScenes[sceneId];
  const point = getMuseumScenePoint(sceneId, view.point_id), camera = view.camera;
  const path = useRef<HTMLElement | null>(null);
  const drag = useRef<{ id: number; pointId: MuseumPointId; x: number; y: number; width: number; height: number; camera: SceneCamera } | null>(null);
  const [dragging, setDragging] = useState(false);
  const previous = moveMuseumPoint(point.id, -1, sceneId), next = moveMuseumPoint(point.id, 1, sceneId);
  useEffect(() => {
    const nav = path.current, active = nav?.querySelector<HTMLElement>("[aria-current=location]");
    if (nav && active) nav.scrollTo({ left: nav.scrollLeft + active.getBoundingClientRect().left - nav.getBoundingClientRect().left - (nav.clientWidth - active.offsetWidth) / 2, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    drag.current = null; setDragging(false);
  }, [point.id, sceneId]);
  const project = (x: number, y: number) => ({ left: 50 + (x - camera.x) * camera.zoom, top: 50 + (y - camera.y) * camera.zoom });
  const visible = (position: { left: number; top: number }) => position.left >= 3 && position.left <= 97 && position.top >= 8 && position.top <= 89;
  return <section id="museum-space" className="museum-house" aria-label="ერთი სახლ-მუზეუმი — ექსპონატიდან ექსპონატამდე" tabIndex={0} onKeyDown={event => {
    if (disabled || event.ctrlKey || event.altKey || event.metaKey || (event.target as HTMLElement).closest("input,textarea,[contenteditable=true]") || !["ArrowLeft", "ArrowRight", "Home", "+", "=", "-"].includes(event.key)) return;
    event.preventDefault(); event.stopPropagation();
    if (event.key === "Home") onPoint("overview");
    else if (["+", "=", "-"].includes(event.key)) onCamera(zoomScene(camera, event.key === "-" ? -.35 : .35));
    else onPoint(event.key === "ArrowRight" ? next.point_id : previous.point_id);
  }}>
    <nav ref={path} className="room-path" aria-label="ექსპონატები იმავე სივრცეში">{points.map(entry => <button key={entry.id} disabled={disabled} aria-current={point.id === entry.id ? "location" : undefined} onClick={() => onPoint(entry.id)}>{entry.id === "overview" && <MapPin size={14} />}{entry.title}</button>)}</nav>
    <div className="house-scene" data-scene-image={scene.image} data-museum-point={point.id} data-dragging={dragging} style={{ touchAction: camera.zoom > 1 ? "none" : "pan-y", cursor: camera.zoom > 1 ? dragging ? "grabbing" : "grab" : undefined }} onPointerDown={event => {
      if (disabled || camera.zoom <= 1 || !event.isPrimary || event.button !== 0 || (event.target as Element).closest("button")) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      drag.current = { id: event.pointerId, pointId: point.id, x: event.clientX, y: event.clientY, width: bounds.width, height: bounds.height, camera };
      setDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    }} onPointerMove={event => { const start = drag.current; if (!start || start.id !== event.pointerId || disabled) return; if (start.pointId !== point.id) { drag.current = null; setDragging(false); return; } onCamera(panScene(start.camera, event.clientX - start.x, event.clientY - start.y, start.width, start.height)); }} onPointerUp={event => { if (drag.current?.id === event.pointerId) { drag.current = null; setDragging(false); if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); } }} onPointerCancel={() => { drag.current = null; setDragging(false); }} onLostPointerCapture={() => { drag.current = null; setDragging(false); }}>
      <img className="house-scene-image" src={scene.image} alt={scene.alt} fetchPriority="high" draggable={false} style={{ width: `${camera.zoom * 100}%`, height: `${camera.zoom * 100}%`, left: `${50 - camera.x * camera.zoom}%`, top: `${50 - camera.y * camera.zoom}%` }} />
      <div className="house-scene-caption"><span>{scene.title} · LIVING MUSEUM</span><button className="text-link" disabled={disabled} onClick={() => onOriginal(scene.image)}><Expand size={14} />ორიგინალი ფოტო</button></div>
      {points.filter(entry => entry.id !== "overview").map(entry => {
        const position = project(entry.x, entry.y);
        if (!visible(position)) return null;
        return <button key={entry.id} className={entry.preview_image ? "room-direction scene-vitrine" : "room-direction"} disabled={disabled} aria-pressed={point.id === entry.id} style={{ left: `${position.left}%`, top: `${position.top}%`, ...(entry.preview_image ? { width: `${Math.min(28, 9 * camera.zoom)}%` } : {}) }} aria-label={`${entry.title} — მიახლოება იმავე მუზეუმში`} onClick={() => onPoint(entry.id)}>
          {entry.preview_image && <span className={entry.id === "eyewear" ? "vitrine-object vitrine-eyewear" : "vitrine-object"}><img src={entry.preview_image} alt="" draggable={false} /><span>CONCEPT</span></span>}
          <span className="direction-disc"><ArrowUp size={25} /></span><span className="direction-title">{entry.title}</span>
        </button>;
      })}
      <button className="stage-arrow prev house-arrow" disabled={disabled} aria-label={`წინა ექსპონატთან — ${getMuseumScenePoint(sceneId, previous.point_id).title}`} onClick={() => onPoint(previous.point_id)}><ArrowLeft size={23} /></button>
      <button className="stage-arrow next house-arrow" disabled={disabled} aria-label={`შემდეგ ექსპონატთან — ${getMuseumScenePoint(sceneId, next.point_id).title}`} onClick={() => onPoint(next.point_id)}><ArrowRight size={23} /></button>
      <div className="scene-controls" aria-label="სივრცის ხედის მართვა"><button aria-label="ხედის დაშორება" disabled={disabled || camera.zoom <= 1} onClick={() => onCamera(zoomScene(camera, -.35))}><Minus size={18} /></button><span>{Math.round(camera.zoom * 100)}%</span><button aria-label="ხედის მოახლოება" disabled={disabled || camera.zoom >= 3} onClick={() => onCamera(zoomScene(camera, .35))}><Plus size={18} /></button><button aria-label="მთელი სახლ-მუზეუმის ხედვა" disabled={disabled} onClick={() => onPoint("overview")}><RotateCcw size={16} /></button></div>
    </div>
    {sceneId === "coin" && <p className="scene-reference-note">ატვირთული კონცეფციის ფოტო · ფოტოში ჩასმული პროფილი, მაჩვენებლები და სერტიფიკატები მოქმედ ჩანაწერებს არ წარმოადგენს.</p>}
    <div className="room-description" aria-live="polite"><div key={point.id}><span className="eyebrow">{point.caption}</span><h2>{point.id === "overview" ? "ერთი სივრცე. შენი აღმოჩენები." : point.title}</h2><p>{point.id === "overview" ? "აირჩიე ნიშნული ან ისარი — მიუახლოვდი ექსპონატს ამავე სახლ-მუზეუმში." : "წყაროს ნიმუში · გასაყიდი ფასი არ ენიჭება."}</p></div><span className="room-keys">← → <span>ექსპონატებთან მოძრაობა</span></span></div>
    {point.source_reference_id ? <div className="point-actions"><button className="button outline" disabled={disabled} onClick={() => onExhibit(point.source_reference_id!)}>ექსპონატის გახსნა<MoveUpRight size={17} /></button><button className="button light" disabled={disabled} onClick={() => onCreate(point.source_reference_id!)}><Plus size={17} />ჩემი ვერსიის შექმნა</button><MuseumShare pointId={point.id} disabled={disabled} /></div> : point.id !== "overview" && <><div className="point-actions"><button className="button outline" disabled={disabled} onClick={onInspect}>დეტალი და შექმნის გზა<MoveUpRight size={17} /></button><MuseumShare pointId={point.id} disabled={disabled} /></div><div className="room-model-pending">{point.id === "watches" && <Watch size={28} />}<div><h3>{point.id === "watches" ? "საათი → ჩემი ავატარის მაჯა" : "ექსპონატის წყაროს კავშირი მოლოდინშია"}</h3><p>{point.id === "watches" ? "დიდი საათის ფოტოს ათვალიერებ. მაჯაზე მორგება, წონა და ფასი საჭიროებს CORE საათის ჩანაწერს, გაზომვად გეომეტრიასა და შენს არსებულ Fit Profile-ს." : "ამ ნიმუშს სურათზე ათვალიერებ. მორგება, ახალი ვერსია და კომერციული გზა გაიხსნება CORE წყაროსა და უფლებების დადასტურების შემდეგ."}</p></div></div></>}
  </section>;
}
