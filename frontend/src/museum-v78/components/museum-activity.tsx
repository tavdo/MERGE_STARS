import { museumV78Fetch } from '@/museum-v78/transport';
"use client";
import { useEffect, useId, useRef, useState } from "react";
import { Activity, Eye, Heart, Link2, RefreshCw, Users, Wand2 } from "lucide-react";
import { getMuseumPoint, type MuseumPointId } from "@/museum-v78/lib/museum-tour";
import { museumBookmarkUrl } from "@/museum-v78/lib/museum-sharing";
import { museumBoundaryState, type MuseumBoundaryCapability, type MuseumBoundaryState } from "@/museum-v78/lib/museum-boundary";
import { CoinPulsePanel } from "@/museum-v78/components/coin-pulse-panel";

function useMuseumBoundary(capability: MuseumBoundaryCapability) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<MuseumBoundaryState>("loading");
  useEffect(() => {
    const controller = new AbortController(); let active = true;
    const timer = setTimeout(() => controller.abort(), 12000);
    setState("loading");
    void (async () => {
      try {
        const response = await museumV78Fetch(`/api/core/${capability}`, { cache: "no-store", signal: controller.signal });
        let body: unknown;
        if (Number(response.headers.get("content-length") ?? 0) <= 32768) {
          const reader = response.body?.getReader();
          if (reader) {
            let size = 0; const chunks: Uint8Array[] = [];
            try {
              while (true) {
                const part = await reader.read(); if (part.done) break;
                size += part.value.byteLength;
                if (size > 32768) { await reader.cancel(); throw new Error("Response too large"); }
                chunks.push(part.value);
              }
              const bytes = new Uint8Array(size); let offset = 0;
              for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
              body = JSON.parse(new TextDecoder().decode(bytes));
            } finally { reader.releaseLock(); }
          }
        } else await response.body?.cancel();
        if (active) setState(museumBoundaryState(capability, response.status, body));
      } catch { if (active) setState("error"); }
      finally { clearTimeout(timer); }
    })();
    return () => { active = false; clearTimeout(timer); controller.abort(); };
  }, [capability, attempt]);
  return { state, retry: () => setAttempt(value => value + 1) };
}

function BoundaryRead({ state, retry }: { state: MuseumBoundaryState; retry: () => void }) {
  const text = state === "loading" ? "მოქმედი კავშირი მოწმდება…" : state === "unavailable" ? "CORE-ის მოქმედი კავშირი ჯერ მიუწვდომელია." : state === "session-required" ? "საჭიროა MERGE-ის მოქმედი სესიის დაკავშირება." : state === "permission-denied" ? "CORE-მა ამ მოქმედებაზე წვდომა არ დაუშვა." : state === "invalid" ? "მოქმედი CORE პასუხის კონტრაქტი დასადასტურებელია." : "კავშირის შემოწმება ვერ დასრულდა.";
  return <div className="museum-boundary-read"><p role="status">{text}</p><button className="text-link" disabled={state === "loading"} onClick={retry}><RefreshCw size={14} />კავშირის შემოწმება</button></div>;
}

export function MuseumGenerationStatus({ sourceReference, draftId }: { sourceReference: string | null; draftId?: string | null }) {
  const { state, retry } = useMuseumBoundary("generate");
  return <section className="museum-generation" aria-label="მუზეუმის ერთადერთი 3D შექმნის გზა">
    <div className="generation-heading"><Wand2 size={19} /><div><span className="eyebrow">MUSEUM · CREATE MY VERSION</span><h3>Meshy AI · 3D გენერაცია</h3></div></div>
    <p>არჩეული ექსპონატი → შენი ვერსია → CORE გენერაცია → Meshy AI → კოლექცია და Brand House.</p>
    <ol className="creation-path"><li data-ready={!!sourceReference}>წყაროს ნახვა</li><li data-ready={!!draftId}>ჩემი მონახაზი</li><li>CORE ვერსია და უფლებები</li><li>Meshy-ის 3D შედეგი</li></ol>
    <button className="button outline" disabled title="საჭიროა CORE პროდუქტი, ვერსია, უფლებები და მოქმედი გენერაციის კონტრაქტი"><Wand2 size={16} />3D გენერაცია Meshy AI-ით</button>
    <BoundaryRead state={state} retry={retry} />
    <p className="fine-note">ახალი 3D ფაილი ჯერ არ შექმნილა. წყაროს პროდუქტი უცვლელი რჩება; მზა შედეგისა და ისტორიის რეგისტრაცია CORE-ს ეკუთვნის.</p>
  </section>;
}

export function MuseumShare({ pointId, disabled = false }: { pointId: MuseumPointId; disabled?: boolean }) {
  const shareId = useId();
  const [url, setUrl] = useState(""); const [copied, setCopied] = useState(false);
  const sequence = useRef(0);
  useEffect(() => { ++sequence.current; setUrl(""); setCopied(false); return () => { ++sequence.current; }; }, [pointId]);
  async function copy() {
    const request = ++sequence.current;
    const next = museumBookmarkUrl(window.location.origin, window.location.pathname, pointId);
    setUrl(next); setCopied(false);
    try { await navigator.clipboard.writeText(next); if (request === sequence.current) setCopied(true); } catch { /* Manual copy remains available. */ }
  }
  return <div className="museum-share"><button className="text-link" disabled={disabled} onClick={() => void copy()}><Link2 size={16} />ვიტრინის გაზიარება</button>{url && <div><label htmlFor={shareId}>{copied ? "ბმული დაკოპირებულია" : "დააკოპირე ვიტრინის ბმული"}</label><input id={shareId} readOnly value={url} onFocus={event => event.currentTarget.select()} /><p>ბმული საიტის მოქმედ წვდომას ექვემდებარება.</p></div>}</div>;
}

export function MuseumPulse({ pointId,onCoinRules }: { pointId: MuseumPointId;onCoinRules?:()=>void }) {
  const { state, retry } = useMuseumBoundary("pulse");
  const point = getMuseumPoint(pointId);
  return <div className="museum-pulse">
    <CoinPulsePanel onRules={onCoinRules}/>
    <h3>MUSEUM ACTIVITY</h3>
    <div className="pulse-context"><Activity size={19} /><span>{point.id === "overview" ? "მთელი სახლ-მუზეუმი" : point.title}</span></div>
    <div className="pulse-metrics"><div><Users size={21} /><h3>ახლა მუზეუმში</h3><strong>დაკავშირების მოლოდინში</strong><p>აქტიური ადამიანების რაოდენობა</p></div><div><Eye size={21} /><h3>ნახვები</h3><strong>დაკავშირების მოლოდინში</strong><p>ექსპონატის დადასტურებული ნახვები</p></div><div><Heart size={21} /><h3>მოწონებები</h3><strong>დაკავშირების მოლოდინში</strong><p>ანგარიშთან მიბმული მოწონებები</p></div></div>
    <BoundaryRead state={state} retry={retry} />
    <p className="fine-note">საიტზე მყოფი ადამიანები, ნახვები და მოწონებები სხვადასხვა მაჩვენებელია. ეს მონაცემები ჯერ არ იტვირთება; ნული ან გამოგონილი აქტივობა არ არის ნაჩვენები.</p>
    <button className="button outline" disabled title="მოწონება საჭიროებს მოქმედ CORE იდენტობას, ექსპონატის ID-სა და მოწონებების API-ს"><Heart size={16} />ექსპონატის მოწონება</button>
    <div className="pulse-promotion"><h3>ბრენდის აღმოჩენა</h3><p>ვიტრინის ბმული შეგიძლია გააზიარო. ბრენდის ნახვები, ინტერესი და მისი ავტორისთვის ხელმისაწვდომი ანგარიშგება არსებული CORE-ის ჩანაწერებს უნდა დაეყრდნოს.</p><MuseumShare pointId={pointId} /></div>
  </div>;
}
