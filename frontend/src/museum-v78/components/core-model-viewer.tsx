"use client";
import { useEffect, useRef, useState } from "react";
import { RotateCcw, RotateCw, Plus, Minus, Box, Play, Pause, Maximize2 } from "lucide-react";
import { loadCoreGLB } from "@/museum-v78/lib/core-gltf";
import { createMuseumFrameLoop } from "@/museum-v78/lib/museum-frame-loop";
import { CORE_MODEL_TIMEOUT_MS } from "@/museum-v78/lib/core-model-limits";
import type { createCoreModelStage } from "@/museum-v78/lib/core-model-scene";
type Stage = Awaited<ReturnType<typeof createCoreModelStage>>;

export function CoreModelViewer({ url, itemId, preview, title = "CORE ექსპონატი", onPlace }: { url: string; itemId: string; preview?: string | null; title?: string; onPlace?: () => void }) {
  const [requested, setRequested] = useState(false), [attempt, setAttempt] = useState(0), [error, setError] = useState(""), [ready, setReady] = useState(false), [spinning, setSpinning] = useState(false);
  const [progress, setProgress] = useState(0);
  const canvas = useRef<HTMLCanvasElement>(null), stage = useRef<Stage | null>(null), spin = useRef(false), invalidate = useRef(() => {});
  const drag = useRef<{ id: number; x: number; y: number; yaw: number; pitch: number } | null>(null);
  useEffect(() => {
    if (!requested || !canvas.current) return;
    const element = canvas.current, controller = new AbortController(), timeout = setTimeout(() => controller.abort(), CORE_MODEL_TIMEOUT_MS);
    let active = true, last = 0;
    setReady(false); setError(""); setSpinning(false); setProgress(0); spin.current = false;
    const loop = createMuseumFrameLoop(now => {
      if (!active || document.hidden || !stage.current) return false;
      if (spin.current) stage.current.orbit.yaw += Math.min(50, now - (last || now)) * .00035;
      last = now; stage.current.render(); return spin.current;
    }); invalidate.current = loop.invalidate;
    const resize = new ResizeObserver(loop.invalidate); resize.observe(element);
    const visible = () => { last = 0; loop.invalidate(); }; document.addEventListener("visibilitychange", visible);
    const lost = (event: Event) => { event.preventDefault(); setReady(false); setError("3D გრაფიკის კავშირი შეწყდა. ხელახლა გახსენი მოდელი."); spin.current = false; setSpinning(false); }; element.addEventListener("webglcontextlost", lost);
    void (async () => {
      try {
        const [bytes, runtime] = await Promise.all([loadCoreGLB(url, controller.signal, fetch, value => { if (active) setProgress(value); }), import("@/museum-v78/lib/core-model-scene")]);
        if (!active || controller.signal.aborted) return;
        const value = await runtime.createCoreModelStage(element, bytes, controller.signal);
        if (!active || controller.signal.aborted) { value.dispose(); return; }
        stage.current = value; setReady(true); loop.invalidate();
      } catch (failure) {
        if (!active) return;
        const code = failure instanceof Error ? failure.message : "", timedOut = controller.signal.aborted; controller.abort();
        setError(code === "MODEL_DECODER_REQUIRED" ? "შეკუმშულ მოდელს მხარდაჭერილი დეკოდერი სჭირდება. 3D READY ჯერ არ დადასტურებულა." : timedOut ? "3D ფაილის ჩატვირთვის დრო ამოიწურა. ხელახლა სცადე." : "3D ფაილი ვერ ჩაიტვირთა ან მოწყობილობა მის ფორმატს ვერ აჩვენებს. 3D READY არ დადასტურებულა.");
      } finally { clearTimeout(timeout); }
    })();
    return () => { active = false; controller.abort(); clearTimeout(timeout); resize.disconnect(); document.removeEventListener("visibilitychange", visible); element.removeEventListener("webglcontextlost", lost); loop.dispose(); stage.current?.dispose(); stage.current = null; invalidate.current = () => {}; };
  }, [requested, url, attempt]);
  function zoom(delta: number) { if (!stage.current) return; stage.current.orbit.distance = Math.max(2.3, Math.min(9, stage.current.orbit.distance + delta)); invalidate.current(); }
  return <section className="core-real-model" aria-label={`${title} — CORE 3D ვიტრინა`}>
    <div className="model-stage" data-model-state={ready && !error ? "READY" : error ? "UNAVAILABLE" : requested ? "LOADING" : "VIEW_ONLY"}>
      {!ready && preview && <img className="model-preview" src={preview} alt={title} referrerPolicy="no-referrer" loading="lazy" />}
      <canvas ref={canvas} className={ready ? "model-canvas model-ready" : "model-canvas"} aria-label={`${title} — რეალური 360° მოდელი`} onPointerDown={event => {
        if (!ready || !stage.current || event.button !== 0 || !event.isPrimary) return;
        spin.current = false; setSpinning(false); drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, yaw: stage.current.orbit.yaw, pitch: stage.current.orbit.pitch }; event.currentTarget.setPointerCapture(event.pointerId);
      }} onPointerMove={event => { const value = drag.current; if (!value || value.id !== event.pointerId || !stage.current) return; stage.current.orbit.yaw = value.yaw + (event.clientX - value.x) * .008; stage.current.orbit.pitch = Math.max(-1, Math.min(1, value.pitch + (event.clientY - value.y) * .006)); invalidate.current(); }} onPointerUp={event => { drag.current = null; if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }} onPointerCancel={() => { drag.current = null; }} onLostPointerCapture={() => { drag.current = null; }} />
      <span className="model-badge">{ready && !error ? "3D READY · 360°" : requested && !error ? "3D იტვირთება" : "VIEW ONLY"}</span>
      {!requested && <button className="model-open button light" onClick={() => setRequested(true)}><Box size={19} />3D მოდელის დათვალიერება</button>}
      {requested && !ready && !error && <div className="model-loading" role="status"><span className="spatial-loading-ring" /><strong>{progress < 100 ? `მოდელი იტვირთება · ${progress}%` : "ვიტრინა მზადდება"}</strong><progress max={100} value={progress} aria-label="CORE მოდელის ჩატვირთვა"/><small>CORE-ის რეალური გეომეტრია და ტექსტურები</small><button className="text-link" onClick={() => { setRequested(false); setReady(false); setError(""); }}>ჩატვირთვის შეჩერება</button></div>}
      {error && <div className="model-loading model-failure" role="alert"><p>{error}</p><button className="button outline" onClick={() => setAttempt(value => value + 1)}>ხელახლა ცდა</button></div>}
    </div>
    <nav aria-label="რეალური 3D მოდელის მართვა">
      <button disabled={!ready || !!error} aria-label="მოდელის მარცხნივ შემობრუნება" onClick={() => { if (stage.current) stage.current.orbit.yaw -= Math.PI / 8; invalidate.current(); }}><RotateCcw size={18} /></button>
      <button disabled={!ready || !!error} aria-label="მოდელის მარჯვნივ შემობრუნება" onClick={() => { if (stage.current) stage.current.orbit.yaw += Math.PI / 8; invalidate.current(); }}><RotateCw size={18} /></button>
      <button disabled={!ready || !!error} aria-label="დეტალის მოახლოება" onClick={() => zoom(-.35)}><Plus size={18} /></button>
      <button disabled={!ready || !!error} aria-label="მოდელის დაშორება" onClick={() => zoom(.35)}><Minus size={18} /></button>
      <button disabled={!ready || !!error} aria-pressed={spinning} onClick={() => { spin.current = !spin.current; setSpinning(spin.current); invalidate.current(); }}>{spinning ? <Pause size={16} /> : <Play size={16} />}360°</button>
      <button disabled={!ready || !!error} aria-label="მოდელის საწყისი ხედის აღდგენა" onClick={() => { stage.current?.reset(); spin.current = false; setSpinning(false); invalidate.current(); }}><Maximize2 size={16} /></button>
    </nav>
    <p className="model-source">CORE catalog_item · <code>{itemId}</code></p>
    <p className="fine-note">საჩვენებელი მასშტაბი ფიზიკურ ზომას, წონას ან VERIFIED სტატუსს არ ადგენს. წყაროს მოდელი უცვლელია.</p>
    <div className="core-placement-pending"><button className="button outline" disabled={!onPlace} onClick={onPlace}>ჩემს 3D ვიტრინაში განთავსება</button><p className="fine-note">პირადი განლაგება მიუთითებს CORE-ის არსებულ ჩანაწერზე. საჯარო გამოფენას, ახალ პროდუქტის ვერსიას ან კომერციულ უფლებას არ ქმნის.</p></div>
  </section>;
}
