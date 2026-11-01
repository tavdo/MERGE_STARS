import { museumV78Fetch } from '@/museum-v78/transport';
"use client";
import {filterCoreExhibits} from '@/museum-v78/lib/house-experience';
import { CoreModelViewer } from "@/museum-v78/components/core-model-viewer";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ImageIcon, Layers3, RefreshCw, Search } from "lucide-react";
import type { CoreCatalog, CoreCollectionDetail, CoreItem, CorePrices } from "@/museum-v78/lib/core-contract";
import { coreExhibitReference, type CoreExhibitReference } from "@/museum-v78/lib/museum-vitrine";
import { coreReadCode, coreReadMessages, type CoreReadCode } from "@/museum-v78/lib/core-read-state";
import { CoreMaterialIntent } from "@/museum-v78/components/filament-preference";

// Public projections are read on demand. They never become local CORE records,
// a Fit Profile, a verified offer, or authority to create a derivative.
export function useCoreRead<T>(path: string | null, refreshMs = 0) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{ path: string | null; data?: T; error?: CoreReadCode }>({ path: null });
  useEffect(() => {
    if (!path) return;
    const controller = new AbortController(); let active = true;
    const timer = setTimeout(() => controller.abort(), 12000);
    setState({ path });
    void (async () => {
      try {
        const response = await museumV78Fetch(path, { cache: "no-store", signal: controller.signal });
        if (!response.ok) {
          let failure: unknown;
          try { failure = (await response.json() as { error?: unknown }).error; } catch {}
          if (active) setState({ path, error: coreReadCode(failure) });
          return;
        }
        const data = await response.json() as T;
        if (active) setState({ path, data });
      } catch { if (active) setState({ path, error: controller.signal.aborted ? "CORE_TIMEOUT" : "CORE_UNAVAILABLE" }); }
      finally { clearTimeout(timer); }
    })();
    return () => { active = false; clearTimeout(timer); controller.abort(); };
  }, [path, attempt]);
  useEffect(() => {
    if (!path || !Number.isFinite(refreshMs) || refreshMs <= 0) return;
    const refresh = () => { if (!document.hidden) setAttempt(value => value + 1); };
    const timer = window.setInterval(refresh, Math.max(15000, refreshMs));
    document.addEventListener("visibilitychange", refresh);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", refresh); };
  }, [path, refreshMs]);
  return { data: state.path === path ? state.data : undefined, error: state.path === path ? state.error : undefined, retry: () => { setState({ path }); setAttempt(value => value + 1); } };
}
function ReadState({ error, retry }: { error?: CoreReadCode; retry: () => void }) {
  return error ? <div className="core-read-state"><p role="alert">{coreReadMessages[error]}</p><button className="text-link" onClick={retry}><RefreshCw size={15} />ხელახლა ცდა</button></div> : <p role="status" className="core-read-state">CORE-ის მონაცემები იტვირთება…</p>;
}
function localTime(value: string) { return new Date(value).toLocaleString("ka-GE", { timeZone: "Asia/Tbilisi" }); }

function CoreRecordPicker({ records, onSelect, modelFilter = false }: { records: { id: string; title: string; category?: string; brandName?: string | null; hasModel3d?: boolean }[]; onSelect: (id: string) => void; modelFilter?: boolean }) {
  const [query, setQuery] = useState(""), [modelsOnly, setModelsOnly] = useState(false), [page, setPage] = useState(0);
  const matches = records.filter(record => (!modelsOnly || record.hasModel3d) && `${record.title} ${record.brandName ?? ""} ${record.category ?? ""} ${record.id}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  const pages = Math.max(1, Math.ceil(matches.length / 24)), current = Math.min(page, pages - 1);
  return <div className="core-picker">
    <label className="core-search"><Search size={17} /><input type="search" value={query} placeholder="მოძებნე სახელით ან ID-ით" aria-label="CORE ჩანაწერებში ძებნა" onChange={event => { setQuery(event.target.value); setPage(0); }} /></label>
    {modelFilter && <label className="core-model-filter"><input type="checkbox" checked={modelsOnly} onChange={event => { setModelsOnly(event.target.checked); setPage(0); }} />მხოლოდ 3D ფაილის მქონე ჩანაწერები</label>}
    <div className="core-record-list">{matches.slice(current * 24, (current + 1) * 24).map(record => <button key={record.id} onClick={() => onSelect(record.id)}><span><strong>{record.title}</strong><small>{record.category ?? (record.hasModel3d ? "3D ფაილი მოწოდებულია · დათვალიერება" : record.id)}</small></span><ArrowRight size={16} /></button>)}</div>
    {!matches.length && <p role="status" className="fine-note">შესაბამისი ჩანაწერი ვერ მოიძებნა.</p>}
    <nav className="core-pagination" aria-label="CORE ჩანაწერების გვერდები"><span>{matches.length} ჩანაწერი · {current + 1}/{pages}</span><button className="spatial-icon" disabled={current === 0} aria-label="ჩანაწერების წინა გვერდი" onClick={() => setPage(current - 1)}><ArrowLeft size={16} /></button><button className="spatial-icon" disabled={current + 1 >= pages} aria-label="ჩანაწერების შემდეგი გვერდი" onClick={() => setPage(current + 1)}><ArrowRight size={16} /></button></nav>
  </div>;
}

function CoreSource({ item, detail, includeMaterialIntent = true }: { item: CoreItem; detail: CoreCollectionDetail; includeMaterialIntent?: boolean }) {
  return <div className="core-source">
    <span className="eyebrow">MERGE CORE · წყარო</span><h3>{item.title}</h3>
    {item.description && <p>{item.description}</p>}
    <dl className="core-source-fields">
      <div><dt>ჩანაწერი</dt><dd>catalog_item · <code>{item.source.entity_id}</code></dd></div>
      <div><dt>კოლექცია</dt><dd>{detail.collection.title}<br /><code>{item.source.collection_id}</code></dd></div>
      <div><dt>Brand Line</dt><dd>{detail.collection.brandLineId ?? "არ არის მოწოდებული"}{detail.collection.brandName && <> · {detail.collection.brandName}</>}</dd></div>
      <div><dt>MERGE ID</dt><dd>{detail.collection.mergeId ?? "არ არის მოწოდებული"}</dd></div>
      <div><dt>სისტემა</dt><dd>mergestars.com · MERGE CORE</dd></div>
      <div><dt>წყაროს რევიზია</dt><dd>არ არის მოწოდებული</dd></div>
      <div><dt>ბოლო განახლება</dt><dd>{localTime(item.source.source_updated_at)}</dd></div>
      <div><dt>სტატუსი CORE-ში</dt><dd>{item.status}</dd></div>
      <div><dt>უფლებები / ისტორია</dt><dd>ჯერ მიუწვდომელია</dd></div>
      <div><dt>QR / პასპორტი</dt><dd>ჯერ მიუწვდომელია</dd></div>
    </dl>
    <p className="fine-note">ჩანაწერის სტატუსი ვერიფიკაციას ან ახალი ვერსიის შექმნის უფლებას არ ადასტურებს. მორგება, ახალი ვერსია და შეკვეთა უფლებებისა და CORE-ის მტკიცებულებების მიღებამდე მიუწვდომელია.</p>
    {includeMaterialIntent && <CoreMaterialIntent key={item.id} itemId={item.id}/>}
  </div>;
}

function CoreCollectionVitrine({ data, back, refresh, onPlace }: { data: CoreCollectionDetail; back: () => void; refresh: () => void; onPlace?: (reference: CoreExhibitReference) => void }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sourceOpen, setSourceOpen] = useState(false), [failedImage, setFailedImage] = useState<string | null>(null);
  const index = Math.max(0, data.items.findIndex(item => item.id === selectedId)), item = data.items[index];
  function move(direction: number) { if (!data.items.length) return; setSelectedId(data.items[(index + direction + data.items.length) % data.items.length].id); setSourceOpen(false); }
  return <div className="core-vitrine">
    <div className="core-vitrine-heading"><button className="text-link" onClick={back}><ArrowLeft size={15} />კოლექციების არჩევა</button><button className="text-link" onClick={refresh}><RefreshCw size={15} />განახლება</button></div>
    <span className="eyebrow">{data.collection.brandName ?? "MERGE CORE"}</span><h3>{data.collection.title}</h3>
    {!!data.items.length && <details className="core-exhibit-picker"><summary>ექსპონატის არჩევა · {data.items.length} ჩანაწერი</summary><CoreRecordPicker records={data.items} modelFilter onSelect={id => { setSelectedId(id); setSourceOpen(false); }} /></details>}
    {!item ? <p className="fine-note">CORE-ის ამ საჯარო კოლექციაში ექსპონატები ჯერ არ არის.</p> : <>
      <div className="core-vitrine-stage">
        {item.model_url ? <CoreModelViewer key={item.id} url={item.model_url} itemId={item.id} title={item.title} preview={item.image_url} onPlace={onPlace ? () => onPlace(coreExhibitReference(item, data)) : undefined} /> : item.image_url && failedImage !== item.id ? <img key={item.id} src={item.image_url} alt={item.title} referrerPolicy="no-referrer" loading="lazy" onError={() => setFailedImage(item.id)} /> : <div className="vitrine-image-pending"><ImageIcon size={42} /><p>{item.image_url ? "CORE-ის სურათი ვერ ჩაიტვირთა" : "CORE-ს ამ ჩანაწერის სურათი არ მოუწოდებია"}</p></div>}
        <button className="stage-arrow prev" disabled={data.items.length < 2} aria-label="წინა CORE ექსპონატი" onClick={() => move(-1)}><ArrowLeft size={22} /></button><button className="stage-arrow next" disabled={data.items.length < 2} aria-label="შემდეგი CORE ექსპონატი" onClick={() => move(1)}><ArrowRight size={22} /></button>
        <span className="core-vitrine-position">{index + 1} / {data.items.length}</span>
      </div>
      <div className="core-vitrine-caption"><h3>{item.title}</h3><button className="text-link" aria-expanded={sourceOpen} onClick={() => setSourceOpen(value => !value)}><Layers3 size={16} />წყარო და ისტორიის მდგომარეობა</button></div>
      <p className="fine-note">CORE catalog_item · {item.id}. Product ID, ვერსიის უფლებები და წარმოების მონაცემები ჯერ დასაკავშირებელია.</p>
      <CoreMaterialIntent key={item.id} itemId={item.id}/>
      {sourceOpen && <CoreSource item={item} detail={data} includeMaterialIntent={false} />}
    </>}
    <p className="fine-note">ვიტრინა კითხულობს CORE-ის საჯარო კოლექციას. ახალი ვერსია აქ გამოჩნდება CORE-ში რეგისტრაციისა და საჯარო ხილვადობის დადასტურების შემდეგ. Meshy-ის მზა მოდელიც აქ გამოჩნდება, როცა მისი 3D ფაილი CORE-ის ამ საჯარო კოლექციაში ხელმისაწვდომია. პირად ვიტრინაში განთავსება წყაროს არ ცვლის.</p>
  </div>;
}

function CoreCollectionView({ slug, back, presentation, onPlace, itemQuery = "" }: { slug: string; back: () => void; presentation: "list" | "vitrine"; onPlace?: (reference: CoreExhibitReference) => void; itemQuery?: string }) {
  const { data: raw, error, retry } = useCoreRead<CoreCollectionDetail>(`/api/core/collection?slug=${encodeURIComponent(slug)}`);
  const data = raw ? {...raw, items: filterCoreExhibits(raw.items, itemQuery)} : undefined;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = data?.items.find(item => item.id === selectedId);
  if (presentation === "vitrine") return data ? <CoreCollectionVitrine data={data} back={back} refresh={retry} onPlace={onPlace} /> : <><button className="text-link" onClick={back}><ArrowLeft size={15} />კოლექციების არჩევა</button><ReadState error={error} retry={retry} /></>;
  return <>
    <button className="text-link" onClick={selected ? () => setSelectedId(null) : back}><ArrowLeft size={15} />{selected ? "კოლექციის ექსპონატები" : "CORE-ის კოლექციები"}</button>
    {!data ? <ReadState error={error} retry={retry} /> : selected ? <CoreSource item={selected} detail={data} /> : <>
      <h3>{data.collection.title}</h3>
      {data.items.length === 0 ? <p className="fine-note">ამ კოლექციაში საჯარო ექსპონატები ჯერ არ არის.</p> : <CoreRecordPicker records={data.items} modelFilter onSelect={setSelectedId} />}
      <p className="fine-note">წყარო: MERGE CORE · პასუხი მიღებულია {localTime(data.retrieved_at)}.</p>
    </>}
  </>;
}

export type CoreCatalogRead = { data?: CoreCatalog; error?: CoreReadCode; retry: () => void };
export function CoreCatalogBrowser({ presentation = "list", onPlace, collectionSlugs, initialSlug, itemQuery = "", catalogRead }: { presentation?: "list" | "vitrine"; onPlace?: (reference: CoreExhibitReference) => void; collectionSlugs?: readonly string[]; initialSlug?: string; itemQuery?: string; catalogRead?: CoreCatalogRead } = {}) {
  const [slug, setSlug] = useState<string | null>(initialSlug ?? null);
  // A House supplies the same read used for its brand and collection filters.
  // Keep its retry and results together instead of issuing a competing request.
  const ownRead = useCoreRead<CoreCatalog>(catalogRead || slug ? null : "/api/core/catalog");
  const { data, error, retry } = catalogRead ?? ownRead;
  const records = data?.collections.filter(collection => !collectionSlugs || collectionSlugs.includes(collection.slug));
  return <section className="core-context" aria-label="MERGE CORE-ის საჯარო კოლექციები">
    <span className="eyebrow">MERGE CORE</span><h3>საჯარო კოლექციები</h3>
    {slug ? <CoreCollectionView key={slug} slug={slug} presentation={presentation} itemQuery={itemQuery} onPlace={onPlace} back={() => setSlug(null)} /> : !data ? <ReadState error={error} retry={retry} /> : <>
      {!records?.length ? <p className="fine-note">ამ მიმართულებაში საჯარო CORE კოლექციები ჯერ არ არის.</p> : <CoreRecordPicker records={records} onSelect={id => { const record = records.find(value => value.id === id); if (record) setSlug(record.slug); }} />}
      <p className="fine-note">ჩანაწერები პირდაპირ CORE-დან იკითხება. არსებული კონცეპტუალური ვიზუალების ამ ჩანაწერებთან კავშირი ჯერ დასადასტურებელია.</p>
    </>}
  </section>;
}

const metalNames = { silver: "ვერცხლი", gold: "ოქრო", palladium: "პალადიუმი" };
export type CorePriceRead = { data?: CorePrices; error?: CoreReadCode; retry: () => void };
export function CorePriceReference() {
  const { data, error, retry } = useCoreRead<CorePrices>("/api/core/prices");
  return <section className="core-context" aria-label="CORE-ის მეტალის ფასების ცნობარი">
    <span className="eyebrow">MERGE CORE · METALS</span><h3>მეტალის ფასების ცნობარი</h3>
    {!data ? <ReadState error={error} retry={retry} /> : <>
      <dl className="core-source-fields">{data.prices.map(price => <div key={price.metal}><dt>{metalNames[price.metal]}</dt><dd>{price.pricePerKgUsd.toLocaleString("ka-GE", { maximumFractionDigits: 2 })} USD / კგ</dd></div>)}</dl>
      <p className="fine-note">CORE-ის პასუხის დრო: {localTime(data.response_at)}. თავდაპირველი კოტირების დრო და მოქმედების ვადა ჯერ არ არის დადასტურებული. ეს მონაცემები პროდუქტის გამოთვლილ ფასს ან VERIFIED OFFER-ს არ ქმნის.</p>
      <button className="text-link" onClick={retry}><RefreshCw size={15} />განახლება</button>
    </>}
  </section>;
}
