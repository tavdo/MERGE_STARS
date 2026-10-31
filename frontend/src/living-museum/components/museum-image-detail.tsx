"use client";
import { useEffect, useRef, useState } from "react";
import { Minus, Plus, Scan, RotateCcw, Move } from "lucide-react";
import { fullImage, imageDetailLayout, imageDetailTransform, type ImageCrop } from "@/living-museum/lib/image-detail";

/** Original presentation pixels only: pan/zoom never creates a 3D model or physical geometry. */
export function MuseumImageDetail({ image, title, crop = fullImage }: { image: string; title: string; crop?: ImageCrop }) {
  const viewport = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 1, height: 1 }), [natural, setNatural] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1), [pan, setPan] = useState({ x: 0, y: 0 }), [failed, setFailed] = useState(false), [attempt, setAttempt] = useState(0);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ distance: number; zoom: number } | null>(null);
  useEffect(() => {
    const node = viewport.current; if (!node) return;
    const resize = new ResizeObserver(() => { setSize({ width: Math.max(1, node.clientWidth), height: Math.max(1, node.clientHeight) }); setPan({ x: 0, y: 0 }); }); resize.observe(node);
    return () => { resize.disconnect(); pointers.current.clear(); };
  }, []);
  const layout = natural.width && natural.height ? imageDetailLayout(natural.width, natural.height, size.width, size.height, crop) : null;
  const frame = layout ? imageDetailTransform(layout, zoom, pan.x, pan.y, size.width, size.height) : null;
  function magnify(value: number) { if (!layout) return; const bounded = imageDetailTransform(layout, value, pan.x, pan.y, size.width, size.height); setZoom(bounded.zoom); setPan({ x: bounded.x, y: bounded.y }); }
  function reset() { setZoom(1); setPan({ x: 0, y: 0 }); }
  function release(event: React.PointerEvent<HTMLDivElement>) { pointers.current.delete(event.pointerId); pinch.current = null; if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }
  return <section className="museum-image-detail" aria-label={`${title} — ორიგინალის დეტალები`}>
    <div ref={viewport} className="image-detail-viewport" tabIndex={0} aria-label="დეტალის მოახლოება და გადაადგილება. პლუსი და მინუსი ზომას ცვლის, ისრები გადაადგილებს, ნული ხედს აღადგენს."
      onDoubleClick={() => magnify(zoom > 1 ? 1 : 3)}
      onKeyDown={event => { if (!frame) return; if (!["+", "=", "-", "0", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return; event.preventDefault(); event.stopPropagation(); if (event.key === "0") reset(); else if (event.key === "+" || event.key === "=") magnify(zoom * 1.4); else if (event.key === "-") magnify(zoom / 1.4); else setPan({ x: frame.x + (event.key === "ArrowRight" ? -50 : event.key === "ArrowLeft" ? 50 : 0), y: frame.y + (event.key === "ArrowDown" ? -50 : event.key === "ArrowUp" ? 50 : 0) }); }}
      onPointerDown={event => { if (!frame || event.button !== 0) return; event.currentTarget.setPointerCapture(event.pointerId); pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY }); if (pointers.current.size === 2) { const [a, b] = [...pointers.current.values()]; pinch.current = { distance: Math.hypot(a.x - b.x, a.y - b.y), zoom }; } }}
      onPointerMove={event => { const old = pointers.current.get(event.pointerId); if (!old || !frame) return; pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY }); if (pointers.current.size === 2 && pinch.current) { const [a, b] = [...pointers.current.values()]; if (pinch.current.distance > 0) magnify(pinch.current.zoom * Math.hypot(a.x - b.x, a.y - b.y) / pinch.current.distance); } else setPan({ x: frame.x + event.clientX - old.x, y: frame.y + event.clientY - old.y }); }}
      onPointerUp={release} onPointerCancel={release} onLostPointerCapture={event => { pointers.current.delete(event.pointerId); pinch.current = null; }}>
      <div className="image-detail-sheet" style={frame ? { width: frame.width, height: frame.height, transform: `translate(calc(-50% + ${frame.x}px), calc(-50% + ${frame.y}px))`, opacity: failed ? 0 : 1 } : { opacity: 0 }}>
        <img key={attempt} src={image} alt={title} draggable={false} decoding="async" onLoad={event => { setFailed(false); setNatural({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight }); }} onError={() => setFailed(true)} style={{ width: `${100 / (crop[2] - crop[0])}%`, height: `${100 / (crop[3] - crop[1])}%`, left: `${-100 * crop[0] / (crop[2] - crop[0])}%`, top: `${-100 * crop[1] / (crop[3] - crop[1])}%` }} />
      </div>
      {!frame && !failed && <div className="image-detail-loading" role="status"><span className="spatial-loading-ring"/>ორიგინალი იტვირთება</div>}
      {failed && <div className="image-detail-loading" role="alert"><p>ორიგინალი ვერ ჩაიტვირთა.</p><button className="button outline" onClick={() => { setFailed(false); setAttempt(value => value + 1); }}>ხელახლა ცდა</button></div>}
      <span className="image-detail-status">VIEW ONLY · ORIGINAL</span>
    </div>
    <nav className="image-detail-controls" aria-label="ექსპონატის დეტალების მართვა"><button disabled={!frame || failed} aria-label="დეტალის დაშორება" onClick={() => magnify(zoom / 1.4)}><Minus size={18}/></button><output aria-live="polite">{frame && layout ? `${Math.round(frame.zoom / layout.nativeZoom * 100)}%` : "—"}</output><button disabled={!frame || failed} aria-label="დეტალის მოახლოება" onClick={() => magnify(zoom * 1.4)}><Plus size={18}/></button><button disabled={!frame || failed} onClick={() => magnify(layout!.nativeZoom)}><Scan size={17}/>1:1</button><button disabled={!frame || failed} onClick={reset}><RotateCcw size={17}/>სრული ხედი</button></nav>
    <div className="image-detail-caption"><span><Move size={15}/>გადაადგილება შეხებით · მოახლოება ორი თითით</span>{layout && <small>წყაროს დეტალი · {Math.round(layout.naturalWidth)} × {Math.round(layout.naturalHeight)} px</small>}</div>
  </section>;
}
