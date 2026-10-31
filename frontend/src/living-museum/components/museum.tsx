"use client";
import MergeMasterLogo from "@/components/MergeMasterLogo";
import { uniqueReferencePhotos } from '../lib/unique-reference-photos';
import { founderSequencePhotos } from '../lib/founder-sequence';
import "../canonical-logo.css";
import { lazy, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Activity, ArrowLeft, ArrowRight, Baby, Check, Layers3, LockKeyhole, Plus, ShieldCheck, Fingerprint, BookOpen, RefreshCw, Expand, MoveUpRight, Route, CircleDollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/living-museum/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/living-museum/components/ui/select";
import { catalog, nextIndex, type Config } from "@/living-museum/lib/museum-domain";
import { featureStatuses, type DesignDraft } from "@/living-museum/lib/draft-contract";
import { museumVisuals, type VisualCategory } from "@/living-museum/lib/museum-visuals";
import { CoreCatalogBrowser, CorePriceReference } from "@/living-museum/components/core-context";
import { museumNavigation, categoryForPoint } from '../navigation';
import { ExhibitDossier } from "@/living-museum/components/exhibit-dossier";
import { loadDesignDrafts, saveDesignDraft } from "@/living-museum/lib/draft-client";
import { MuseumGate, MUSEUM_ENTRY_DURATION } from "@/living-museum/components/museum-gate";
import { MuseumImageDetail } from "@/living-museum/components/museum-image-detail";
import { exhibitById } from "@/living-museum/lib/museum-spatial";
import type { ImageCrop } from "@/living-museum/lib/image-detail";
import type { VitrineRequest } from "@/living-museum/lib/museum-vitrine";
import { MuseumSceneBoundary } from "@/living-museum/components/museum-scene-boundary";
import { MuseumHouse } from "@/living-museum/components/museum-house";
import { MuseumGenerationStatus, MuseumPulse } from "@/living-museum/components/museum-activity";
import { MuseumPointDossier } from "@/living-museum/components/museum-point-dossier";
import { MuseumChildren } from "@/living-museum/components/museum-children";
import { EntryPaymentLaw } from "@/living-museum/components/entry-payment-law";
import { RegistrationPreparation } from "@/living-museum/components/registration-preparation";
import { VipJourney } from "@/living-museum/components/vip-journey";
import { CommercialReadiness } from "@/living-museum/components/commercial-readiness";
import { readMuseumBookmark } from "@/living-museum/lib/museum-sharing";
import { enterMuseum, getMuseumPoint, museumScenes, museumScenePoints, moveMuseumPoint, openMuseumExhibit, approachMuseumPoint, pointForMuseumReference, returnToMuseum, type MuseumView, type MuseumPointId, type MuseumSceneId } from "@/living-museum/lib/museum-tour";
import { sceneCamera, type SceneCamera } from "@/living-museum/lib/scene-camera";

const loadSpatialMuseum = () => import("@/living-museum/components/museum-spatial");
const SpatialMuseum = lazy(() => loadSpatialMuseum().then(value => ({ default: value.SpatialMuseum })));

const sourcePhotos = uniqueReferencePhotos([
  { image: "/living-museum/assets/interior-canonical-clean.png", title: "MEGA MUSEUM · დამტკიცებული რეფერენსი", alt: "შენ მიერ მოწოდებული ოქროსა და ვერცხლის MERGE Mega Museum" },
  { image: "/living-museum/assets/entrance-canonical-clean.png", title: "MERGE GATE", alt: "შენს მიერ მოწოდებული MERGE-ის ოქროსა და ვერცხლის კარი" },
  { image: "/living-museum/assets/entrance-canonical-clean.png", title: "AURUM / ARGENTUM", alt: "შენს მიერ მოწოდებული ოქროსა და ვერცხლის დარბაზები" },
  { image: "/living-museum/assets/coin-reference.png", title: "COIN · წყარო", alt: "შენს მიერ მოწოდებული COIN-ის იდენტობის ვიზუალური წყარო" },
  { image: "/living-museum/assets/museum-world.png", title: "MERGE სამყარო", alt: "MERGE House & Museum-ის ვიზუალური კონცეფცია" },
  { image: "/living-museum/assets/museum-coin-world.png", title: "MERGE COIN მუზეუმი", alt: "შენი დამატებული MERGE COIN მუზეუმის ორიგინალი ვიზუალი" },
  { image: "/living-museum/assets/eyewear.png", title: "წითელი სათვალე", alt: "MERGE-ის წითელი მოზაიკის სათვალის ორიგინალი ვიზუალი" },
  { image: "/living-museum/assets/coin-case.png", title: "მრგვალი ფუტლარი", alt: "MERGE-ის გახსნადი მრგვალი ფუტლარი სათვალისთვის" },
  ...museumVisuals,
  ...founderSequencePhotos,
]);

const materials: Record<Config["material"], string> = { mixed: "ოქრო + ვერცხლი", silver: "ვერცხლი", gold: "ოქრო" };
const scales: Record<Config["scale"], string> = { fine: "წვრილი · FINE", medium: "საშუალო · MEDIUM" };
type Panel = "none" | "registration" | "journey" | "commercial" | "collection" | "system" | "verify" | "governance" | "passport" | "fit" | "photos" | "detail" | "exhibit" | "point" | "pulse" | "vitrine" | "children" | "entry-law";
const evidence = ["ვერსიასთან მიბმული CORE Product ID", "დიზაინი, ზომები და ბრენდის თანხმობა", "მასალის შემადგენლობა და წონა", "მწარმოებელი და შესრულების ვადა", "მოქმედი, დადასტურებული შეთავაზება"];
const workflow = [
  ["დიზაინის მონახაზი", "შენახული კონცეფცია; ჯერ არ არის წარმოების შეკვეთა"],
  ["CORE-ში რეგისტრაცია და შემოწმება", "ვერსია, უფლებები, მასალა, წონა და მწარმოებელი"],
  ["VERIFIED OFFER", "დადასტურებული ფასი, სპეციფიკაცია და ვადა"],
  ["შეკვეთა და გადახდის დადასტურება", "მხოლოდ CORE-ისა და გადახდის პარტნიორის მტკიცებულებით"],
  ["წარმოების ავტორიზაცია და QC", "მწარმოებლის დადასტურება და ხარისხის მტკიცებულება"],
  ["Product Passport · Brand House", "დადასტურებული პროდუქტი და მისი ისტორია"],
];

function ExhibitSurface({spatial,children,onClose}:{spatial:boolean;children:ReactNode;onClose:()=>void}) {
  return spatial ? <Dialog open onOpenChange={open => { if (!open) onClose(); }}><DialogContent className="spatial-atelier-overlay" showCloseButton={false} onCloseAutoFocus={event => { event.preventDefault(); document.getElementById("museum-space")?.focus({ preventScroll: true }); }}><DialogTitle className="sr-only">ექსპონატის კონტექსტური სახელოსნო</DialogTitle><DialogDescription className="sr-only">შექმენი მონახაზი ან დახურე ხელსაწყოები მუზეუმის იმავე პოზიციაზე დასაბრუნებლად.</DialogDescription>{children}</DialogContent></Dialog> : <>{children}</>;
}

export default function Museum({ signedIn }: { signedIn: boolean }) {
  const [entered, setEntered] = useState(museumNavigation.entered), [opening, setOpening] = useState(false), [index, setIndex] = useState(0);
  const [arriving, setArriving] = useState(false);
  const [view, setView] = useState<MuseumView>(() => museumNavigation.view ?? enterMuseum());
  const [sceneId, setSceneId] = useState<MuseumSceneId>(museumNavigation.sceneId);
  useEffect(() => { museumNavigation.entered = entered; museumNavigation.view = view.kind === 'exhibit' ? returnToMuseum(view) : view; museumNavigation.sceneId = sceneId; }, [entered, view, sceneId]);
  const [mode, setMode] = useState<"source" | "custom">("source");
  const [drafts, setDrafts] = useState<DesignDraft[]>([]), [active, setActive] = useState<DesignDraft | null>(null);
  const [parentId, setParentId] = useState<string | null>(null), [config, setConfig] = useState<Config>({ ...catalog[0].config });
  const [panel, setPanel] = useState<Panel>(museumNavigation.catalogOpen ? 'vitrine' : 'none'), [notice, setNotice] = useState(""), [detail, setDetail] = useState(false);
  useEffect(() => { museumNavigation.catalogOpen = panel === 'vitrine'; }, [panel]);
  const [sharedPoint, setSharedPoint] = useState<MuseumPointId | null>(null);
  const [referenceImage, setReferenceImage] = useState("/living-museum/assets/museum-world.png");
  const [inspection, setInspection] = useState<{ id: string; image: string; title: string; crop?: ImageCrop } | null>(null);
  const [vitrineRequest, setVitrineRequest] = useState<VitrineRequest | null>(null);
  const [visualCategory, setVisualCategory] = useState<VisualCategory | "ყველა">("ყველა");
  const [ready, setReady] = useState(false), [saving, setSaving] = useState(false), [loading, setLoading] = useState(false), [loadError, setLoadError] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null), touch = useRef<{ x: number; y: number } | null>(null), requestId = useRef<string | null>(null);
  const versionName = useRef<HTMLInputElement | null>(null);
  const loadSequence = useRef(0);
  const suppressTap = useRef(false), returnFocus = useRef<HTMLElement | null>(null);
  const inFlight = useRef(false), mounted = useRef(true);
  const product = catalog[index], preview = mode === "custom" ? config : product.config;
  const referenceIndex = sourcePhotos.findIndex(photo => photo.image === referenceImage);
  const reference = sourcePhotos[referenceIndex];
  const state = useRef({ index, entered, panel, saving, view, sceneId }); state.current = { index, entered, panel, saving, view, sceneId };

  const load = useCallback(async () => {
    if (!signedIn) return;
    const sequence = ++loadSequence.current;
    setLoading(true); setLoadError("");
    try {
      const loaded = await loadDesignDrafts();
      if (mounted.current && sequence === loadSequence.current) setDrafts(items => [...new Map([...items, ...loaded].map(item => [item.draft_id, item])).values()].sort((a,b) => b.created_at.localeCompare(a.created_at)));
    } catch (error) {
      if (mounted.current && sequence === loadSequence.current) setLoadError(error instanceof Error && error.message === "AUTH_REQUIRED" ? "შენახული კოლექციის სანახავად შედი ანგარიშით." : "კოლექცია დროებით მიუწვდომელია. ხელახლა სცადე.");
    } finally { if (mounted.current && sequence === loadSequence.current) setLoading(false); }
  }, [signedIn]);

  function select(n: number) {
    if (inFlight.current) return;
    const point = pointForMuseumReference(catalog[n].product_id);
    const house = state.current.view.point_id === point.id ? returnToMuseum(state.current.view) : approachMuseumPoint(point.id, state.current.sceneId);
    setView(openMuseumExhibit(house, catalog[n].product_id));
    setIndex(n); setMode("source"); setActive(null); setParentId(null); setConfig({ ...catalog[n].config, name: "" });
    requestId.current = null; setDetail(false); setNotice("");
  }
  function move(direction: number) { select(nextIndex(state.current.index, direction, catalog.length)); }
  function browsePoint(pointId: MuseumPointId) {
    if (inFlight.current) return;
    const targetScene = museumScenePoints(state.current.sceneId).some(point => point.id === pointId) ? state.current.sceneId : museumScenePoints("coin").some(point => point.id === pointId) ? "coin" : "house";
    setSceneId(targetScene); setView(approachMuseumPoint(pointId, targetScene)); setPanel("none");
    window.scrollTo({ top: 0, behavior: "auto" });
  }
  function trackSpatialPoint(pointId: MuseumPointId) {
    if (inFlight.current) return;
    setView(approachMuseumPoint(pointId, "coin")); setPanel("none");
  }
  function returnToSpace() {
    if (inFlight.current) return;
    setView(returnToMuseum(state.current.view)); setPanel("none");
    window.scrollTo({ top: 0, behavior: "auto" });
  }
  function updateCamera(camera: SceneCamera) {
    if (inFlight.current) return;
    const bounded = sceneCamera(camera);
    setView(current => current.kind === "house" ? { ...current, camera: bounded } : current);
  }
  function changeScene(next: MuseumSceneId) {
    if (inFlight.current || state.current.view.kind !== "house") return;
    const pointId = museumScenePoints(next).some(point => point.id === state.current.view.point_id) ? state.current.view.point_id : "overview";
    setSceneId(next); setView(approachMuseumPoint(pointId, next)); setPanel("none");
  }
  function choosePointExhibit(reference: string) {
    if (inFlight.current || state.current.view.kind !== "house") return;
    const destination = openMuseumExhibit(state.current.view, reference);
    const n = catalog.findIndex(product => product.product_id === reference);
    if (n < 0) return;
    select(n); setView(destination); window.scrollTo({ top: 0, behavior: "auto" });
  }
  function createPointVersion(reference: string) {
    if (inFlight.current || state.current.view.kind !== "house") return;
    const destination = openMuseumExhibit(state.current.view, reference);
    const n = catalog.findIndex(item => item.product_id === reference);
    if (n < 0) return;
    select(n); setView(destination); setMode("custom");
    setConfig({ ...catalog[n].config, name: "" });
    window.scrollTo({ top: 0, behavior: "auto" });
  }
  function moveReference(direction: number) {
    setReferenceImage(current => sourcePhotos[nextIndex(Math.max(0, sourcePhotos.findIndex(photo => photo.image === current)), direction, sourcePhotos.length)].image);
  }
  function enter() {
    if (entered || opening || timer.current) return;
    void loadSpatialMuseum().catch(() => {});
    setView(enterMuseum()); setPanel("none"); setOpening(true);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    timer.current = setTimeout(() => { timer.current = null; setArriving(!reducedMotion); setEntered(true); setOpening(false); }, reducedMotion ? 0 : MUSEUM_ENTRY_DURATION);
  }
  function leave() {
    if (inFlight.current) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setArriving(false); setOpening(false); setEntered(false); setView(enterMuseum()); setPanel("none");
  }
  function customize() {
    if (inFlight.current || (mode === "custom" && !active)) return;
    setMode("custom"); setParentId(active?.draft_id ?? null); setActive(null);
    setConfig({ ...(active?.config ?? product.config), name: active ? `${active.name.slice(0,45)} · ახალი` : "" });
    requestId.current = null; setNotice("");
  }
  function keep() { select(index); setNotice("წყაროს დიზაინი არჩეულია და შენარჩუნებულია."); }
  function update(next: Config) { if (inFlight.current) return; setConfig(next); setActive(null); requestId.current = null; setNotice(""); }
  function openDraft(draft: DesignDraft) {
    if (inFlight.current) return;
    const n = catalog.findIndex(p => p.product_id === draft.source_reference_id);
    if (n < 0) return;
    setView(openMuseumExhibit(approachMuseumPoint(pointForMuseumReference(draft.source_reference_id).id, state.current.sceneId), draft.source_reference_id));
    setIndex(n); setMode("custom"); setActive(draft); setConfig({ ...draft.config }); setParentId(draft.parent_draft_id);
    requestId.current = null; setDetail(false); setPanel("none"); setNotice("შენახული დიზაინის მონახაზი გაიხსნა.");
  }
  async function save() {
    if (inFlight.current || active || !signedIn) return;
    inFlight.current = true; setSaving(true); setNotice("");
    const snapshot = { source_reference_id: product.product_id, parent_draft_id: parentId, request_id: requestId.current ?? crypto.randomUUID(), config: { ...config } };
    requestId.current = snapshot.request_id;
    try {
      const draft = await saveDesignDraft(snapshot);
      if (!mounted.current) return;
      setActive(draft); setConfig({ ...draft.config });
      setDrafts(items => [draft, ...items.filter(item => item.draft_id !== draft.draft_id)]);
      setNotice("კონცეფციის მონახაზი შენახულია ამ ბრაუზერში. სხვა მოწყობილობაზე ავტომატურად არ გადაიტანება.");
    } catch (error) {
      if (!mounted.current) return;
      const code = error instanceof Error ? error.message : "";
      setNotice(code === "AUTH_REQUIRED" ? "ანგარიშით შესვლა საჭიროა. დიზაინი შენარჩუნებულია ეკრანზე." : code === "COLLECTION_LIMIT_REACHED" ? "კოლექციის 200 მონახაზის ლიმიტი მიღწეულია. ახალი მონახაზი არ შენახულა." : code === "DRAFT_TIMEOUT" ? "შენახვის პასუხი დაგვიანდა. დიზაინი შენარჩუნებულია — ხელახლა ცდა იმავე მოთხოვნას გადაამოწმებს." : "შენახვა ვერ დადასტურდა. დიზაინი ეკრანზე რჩება — ხელახლა სცადე.");
    } finally { inFlight.current = false; if (mounted.current) setSaving(false); }
  }
  useEffect(() => { mounted.current = true; setReady(true); void load(); return () => { mounted.current = false; ++loadSequence.current; if (timer.current) clearTimeout(timer.current); }; }, [load]);
  useEffect(() => {
    const bookmark = () => setSharedPoint(readMuseumBookmark(window.location.hash));
    bookmark(); window.addEventListener("hashchange", bookmark);
    return () => window.removeEventListener("hashchange", bookmark);
  }, []);
  useEffect(() => {
    if (mode === "custom" && view.kind === "exhibit" && !active) versionName.current?.focus({ preventScroll: true });
  }, [mode, view.kind, index, active?.draft_id]);
  useEffect(() => {
    function key(event: KeyboardEvent) {
      if (sceneId === "coin" || !entered || panel !== "none" || saving || event.ctrlKey || event.altKey || event.metaKey) return;
      const target = event.target as HTMLElement;
      if (target?.closest("input,textarea,select,button,[role=combobox],[contenteditable=true]")) return;
      if (["ArrowRight", "ArrowLeft"].includes(event.key)) {
        event.preventDefault(); const direction = event.key === "ArrowRight" ? 1 : -1;
        if (state.current.view.kind === "house") browsePoint(moveMuseumPoint(state.current.view.point_id, direction, state.current.sceneId).point_id);
        else move(direction);
      }
    }
    window.addEventListener("keydown", key); return () => window.removeEventListener("keydown", key);
  }, [entered, panel, saving, sceneId]);
  useEffect(() => {
    if (panel !== "photos") return;
    function key(event: KeyboardEvent) {
      if (event.ctrlKey || event.altKey || event.metaKey || (event.target as HTMLElement)?.closest("input,textarea,select,[role=combobox],[contenteditable=true]")) return;
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); moveReference(event.key === "ArrowRight" ? 1 : -1); }
    }
    window.addEventListener("keydown", key); return () => window.removeEventListener("keydown", key);
  }, [panel]);
  useEffect(() => {
    const context = (document as unknown as { modelContext?: { registerTool: (tool: unknown, options: unknown) => unknown } }).modelContext;
    if (!context?.registerTool) return;
    const life = new AbortController();
    const entries = [
      { name: "read_museum_selection", description: "Read the current Museum view, point, explicit concept selection and actual CORE availability. No verified offer or real order is available.", inputSchema: { type: "object", properties: {}, additionalProperties: false }, annotations: { readOnlyHint: true }, execute: () => ({ view: state.current.view.kind, scene_id: state.current.sceneId, point_id: state.current.view.point_id, camera: { ...state.current.view.camera }, source_reference_id: state.current.view.kind === "exhibit" ? catalog[state.current.index].product_id : null, entered: state.current.entered, core_connected: false, real_order_enabled: false }) },
      { name: "navigate_museum_exhibit", description: "Move between concept exhibits. Does not save drafts or alter CORE.", inputSchema: { type: "object", properties: { direction: { type: "string", enum: ["previous", "next"] } }, required: ["direction"], additionalProperties: false }, annotations: { readOnlyHint: false }, execute: (input: unknown) => {
        const value = input as { direction?: string };
        if (!state.current.entered || state.current.panel !== "none" || state.current.view.kind !== "exhibit" || inFlight.current) throw new Error("Museum exhibit navigation unavailable");
        if (!value || !["previous", "next"].includes(value.direction ?? "")) throw new Error("Invalid direction");
        const n = nextIndex(state.current.index, value.direction === "next" ? 1 : -1, catalog.length);
        select(n); return { source_reference_id: catalog[n].product_id };
      } },
      { name: "navigate_museum_point", description: "Approach the next or previous exhibit point in the same uploaded Museum scene. Does not select a product, save a draft or alter CORE.", inputSchema: { type: "object", properties: { direction: { type: "string", enum: ["previous", "next"] } }, required: ["direction"], additionalProperties: false }, annotations: { readOnlyHint: false }, execute: (input: unknown) => {
        const value = input as { direction?: string };
        if (!state.current.entered || state.current.panel !== "none" || state.current.view.kind !== "house" || inFlight.current) throw new Error("Museum point navigation unavailable");
        if (!value || !["previous", "next"].includes(value.direction ?? "")) throw new Error("Invalid direction");
        const destination = moveMuseumPoint(state.current.view.point_id, value.direction === "next" ? 1 : -1, state.current.sceneId);
        browsePoint(destination.point_id); return destination;
      } },
      { name: "open_museum_exhibit", description: "Explicitly open the available concept at the current exhibit point. Presentation selection does not create a CORE product or authorize fitting.", inputSchema: { type: "object", properties: { source_reference_id: { type: "string", enum: ["MERGE-EYE-001", "MERGE-CASE-001"] } }, required: ["source_reference_id"], additionalProperties: false }, annotations: { readOnlyHint: false }, execute: (input: unknown) => {
        const value = input as { source_reference_id?: string };
        if (!state.current.entered || state.current.panel !== "none" || state.current.view.kind !== "house" || inFlight.current || !value?.source_reference_id) throw new Error("Museum selection unavailable");
        const destination = openMuseumExhibit(state.current.view, value.source_reference_id);
        choosePointExhibit(value.source_reference_id); return destination;
      } },
    ];
    for (const tool of entries) try { Promise.resolve(context.registerTool(tool, { signal: life.signal })).catch(() => {}); } catch {}
    return () => life.abort();
  }, []);

  const titles: Record<Exclude<Panel,"none">, string> = { registration: "MERGE ID · პროფილის მომზადება", detail: inspection?.title ?? "ექსპონატის დეტალები", journey: "VIP კლიენტის გზა", commercial: "შეკვეთა · გადახდა · წარმოება", collection: "ჩემი კოლექცია", system: "პლატფორმის სტატუსი", verify: "ვერიფიკაცია და შეკვეთის გზა", governance: "MERGE · მართვის წესები", passport: "Product Passport", fit: "Fit to Me", photos: "MERGE · ორიგინალი ვიზუალები", exhibit: "ექსპონატის ინფორმაცია", point: "ვიტრინის დეტალი", pulse: "მუზეუმის პულსი", vitrine: "კოლექციის ვიტრინა", children: "BABE / RUMI · ბავშვების კუთხე", "entry-law": "Gold / Silver · შესვლისა და გადახდის წესი" };
  const descriptions: Record<Exclude<Panel,"none">, string> = { registration: "არსებული CORE იდენტობა, მიწოდება და მიზანი — ანგარიშის დუბლირების გარეშე.", detail: "არჩეული ნივთის ორიგინალი — მოახლოება, გადაადგილება და 1:1 ხედი. ეს არის გამოსახულება; 360° რეალურ 3D მოდელს მოითხოვს.", journey: "იდენტობიდან მემკვიდრეობამდე — რეალური მოქმედებები, CORE მტკიცებულებები და დახურული კომერციული კარიბჭეები.", commercial: "ბანკისა და PSP-ისთვის გასაგები კომერციული ჯაჭვი, უფლებამოსილებები და უსაფრთხოების კონტროლები.", collection: "შენი პირადი დიზაინის მონახაზები. თითოეული ახალი ვერსია წყაროსთან კავშირს ინარჩუნებს.", system: "რეალურად მოქმედი ფუნქციები და დასაკავშირებელი სერვისები.", verify: "მხოლოდ კონკრეტული ვერსიის მტკიცებულებები ხსნის რეალურ შეკვეთის გზას.", governance: "დამფუძნებლის, MERGE AI-ისა და ოფიციალური იმპლემენტაციის უფლებამოსილებები.", passport: "დადასტურებული პროდუქტის პასპორტი და მისი ისტორია CORE-ს ეკუთვნის.", fit: "პირადი მორგება მოითხოვს თანხმობით შექმნილ Fit Profile-ს.", photos: "შენს ბიბლიოთეკაში არსებული ვიზუალები. სურათზე წარწერები კონცეფციის ნაწილია; მასალის, ფუნქციის ან სერტიფიკატის დადასტურებას არ წარმოადგენს.", exhibit: "წყარო, დიზაინის პარამეტრები და პროდუქტის დადასტურების მდგომარეობა.", point: "არჩეული ექსპონატის ვიზუალური წყარო და მუზეუმშივე შექმნის გზა.", pulse: "ადამიანები, ნახვები, მოწონებები და ბრენდის აღმოჩენა — CORE-ის აღრიცხვით.", vitrine: "CORE-ის საჯარო კოლექციის ექსპონატები ამავე მუზეუმში.", children: "შენი მითითებული საბავშვო მიმართულებები და მათი დაკავშირების მდგომარეობა.", "entry-law": "რეგისტრაცია, cohort, შეთავაზება, შეკვეთა და გადახდა ცალკე მოვლენებია." };

  return <main className={entered ? "museum-shell" : "entrance-shell"}>
    {arriving && <div className="museum-arrival-veil" aria-hidden="true" onAnimationEnd={() => setArriving(false)}><img src="/living-museum/assets/founder-museum-arrival.png" alt="" /></div>}
    <header className="topbar">
      <button className="brand" aria-label="MERGE შესასვლელი" disabled={saving} onClick={leave}><MergeMasterLogo /></button>
      {entered ? <nav aria-label="მუზეუმის ნავიგაცია"><button disabled={saving} onClick={returnToSpace} className={panel === "none" ? "nav-active" : ""}>მუზეუმი</button><button disabled={saving} onClick={() => setPanel("journey")}><Route size={15}/>VIP გზა</button><button disabled={saving} onClick={() => setPanel("commercial")}><CircleDollarSign size={15}/>შეკვეთა</button><a href="#visual-exhibition" onClick={() => setPanel("none")}>ვიზუალები</a><button disabled={saving} onClick={() => { setPanel("collection"); void load(); }}>ჩემი კოლექცია <span className="count">{String(drafts.length).padStart(2,"0")}</span></button><button className="pulse-nav" disabled={saving} onClick={() => setPanel("pulse")}><Activity size={15} />პულსი</button></nav> : <span className="header-caption">THE LIVING MUSEUM</span>}
      <a className="private-label" href={signedIn ? '/dashboard' : '/login'}><LockKeyhole size={14} /><span>პირადი სივრცე</span></a>
    </header>
    {!entered ? <section className={opening ? "entrance opening" : "entrance"} aria-label="MERGE მუზეუმის შესასვლელი">
      <MuseumGate opening={opening} ready={ready} onEnter={enter} />
      <div className="entrance-heading"><span className="eyebrow">THE JEWELER OF BRANDS</span><h1>Living <i>Museum</i></h1></div>
      <div className="entrance-copy"><div><span className="eyebrow">შენი ბრენდი. შენი ხელწერა.</span><p>შეეხე კარს და შედი მუზეუმში.</p></div><button className="button light entrance-button" disabled={opening || !ready} onClick={enter}>{opening ? "კარი იღება…" : "გახსენი სახლ-მუზეუმი"}<ArrowRight size={20} /></button></div>
      <div className="entrance-footer"><span>01 — THE ENTRANCE</span><button className="text-link" onClick={() => setPanel("registration")}>CREATE MERGE ID · რეგისტრაცია</button><button className="text-link" onClick={() => setPanel("journey")}><Route size={14}/>VIP კლიენტის გზა</button><button className="text-link" onClick={() => { setReferenceImage(museumScenes[sceneId].image); setPanel("photos"); }}>შენი MERGE სამყარო <MoveUpRight size={14}/></button><button className="text-link" onClick={() => setPanel("entry-law")}>Gold / Silver · შესვლის წესი</button><a className="text-link" href="/transparency"><ShieldCheck size={14} />გამჭვირვალობა</a><span>GOLD · SILVER · LEGACY</span></div>
    </section> : <>
      <div className="gallery-heading" data-museum-view={view.kind}><div><span className="eyebrow">MERGE HOUSE & MUSEUM</span><h1>{view.kind === "house" ? "სახლ-მუზეუმი" : "არჩეული ექსპონატი"}</h1></div>{view.kind === "exhibit" ? <button className="text-link" disabled={saving} onClick={returnToSpace}><ArrowLeft size={16} />ვიტრინასთან დაბრუნება</button> : <button className="text-link" disabled={saving} onClick={() => browsePoint("overview")}>საერთო ხედვა <Expand size={16} /></button>}</div>
      {view.kind === "house" && sharedPoint && <div className="shared-vitrine"><span>გაზიარებული ვიტრინა · {getMuseumPoint(sharedPoint).title}</span><button className="text-link" disabled={saving} onClick={() => { browsePoint(sharedPoint); setSharedPoint(null); }}>ვიტრინასთან მისვლა<ArrowRight size={16} /></button></div>}
      {view.kind === "house" && <div className="museum-destinations"><div role="group" aria-label="მუზეუმის ატვირთული ხედები">{(["coin", "house"] as const).map(id => <button key={id} disabled={saving} aria-pressed={sceneId === id} onClick={() => changeScene(id)}>{museumScenes[id].title}</button>)}</div><button className="text-link" disabled={saving} onClick={() => setPanel("vitrine")}><Layers3 size={16} />კოლექციის ვიტრინა</button><button className="text-link" disabled={saving} onClick={() => setPanel("children")}><Baby size={17} />BABE / RUMI · ბავშვების კუთხე</button></div>}
      {sceneId === "coin" && <MuseumSceneBoundary><Suspense fallback={<div className="museum-scene-pending" role="status"><MergeMasterLogo className="canonical-loading-logo" decorative /><span className="eyebrow">MERGE ⭐ STARS</span><h2>მუზეუმი იხსნება</h2></div>}><SpatialMuseum vitrineRequest={vitrineRequest} view={view} disabled={saving} blocked={panel !== "none" || view.kind === "exhibit"} onPoint={trackSpatialPoint} onExhibit={choosePointExhibit} onCreate={createPointVersion} onInspect={() => setPanel("point")} onCoreVitrine={() => setPanel("vitrine")} onDetail={id => { const item = exhibitById(id); setInspection({ id, image: item.image, title: item.title, crop: item.crop }); setPanel("detail"); }} onOriginal={image => { setReferenceImage(image); setPanel("photos"); }} /></Suspense></MuseumSceneBoundary>}
      {view.kind === "house" ? sceneId === "house" ? <MuseumHouse view={view} sceneId={sceneId} disabled={saving} onPoint={browsePoint} onCamera={updateCamera} onExhibit={choosePointExhibit} onCreate={createPointVersion} onInspect={() => setPanel("point")} onOriginal={image => { setReferenceImage(image); setPanel("photos"); }} /> : null : <ExhibitSurface spatial={sceneId === "coin"} onClose={returnToSpace}>
      {sceneId === "coin" && <button className="spatial-atelier-close" disabled={saving} onClick={returnToSpace}><ArrowLeft size={17} />იმავე პოზიციაზე დაბრუნება</button>}
      <section className="exhibit-grid" aria-label="ინტერაქტიული ექსპონატები">
        <div className="exhibit-stage" onTouchStart={event => { if (sceneId === "coin") return; suppressTap.current = false; const control = (event.target as HTMLElement).closest(".stage-tabs,.stage-arrow"); const point = !control && event.touches.length === 1 ? event.touches[0] : null; touch.current = point ? { x: point.clientX, y: point.clientY } : null; }} onTouchCancel={() => { touch.current = null; }} onTouchEnd={event => { const point = event.changedTouches[0]; if (touch.current && point) { const dx = point.clientX - touch.current.x, dy = point.clientY - touch.current.y; if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.3) { suppressTap.current = true; move(dx < 0 ? 1 : -1); } } touch.current = null; }}>
          <div className="stage-top"><span>{product.category}</span><span>{String(index+1).padStart(2,"0")} / {String(catalog.length).padStart(2,"0")}</span></div>
          <button type="button" disabled={saving} className={index === 0 ? "product-image-wrap eyewear-photo exhibit-open" : "product-image-wrap case-photo exhibit-open"} aria-label={`${product.title} — ექსპონატის ინფორმაციის გახსნა`} onClick={event => { if (suppressTap.current && event.detail > 0) { suppressTap.current = false; return; } setPanel("exhibit"); }} onKeyDown={event => { if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); move(event.key === "ArrowRight" ? 1 : -1); } }}><img key={product.product_id} className={detail ? "exhibit-image zoomed" : "exhibit-image"} src={product.image} alt={product.description} style={{ filter: mode === "source" ? "none" : preview.material === "silver" ? "saturate(0.05)" : preview.material === "gold" ? "sepia(0.22) saturate(1.15)" : "none" }} /><span className="stage-shade" /></button>
          <div className="stage-tabs"><button className={!detail ? "chosen" : ""} aria-pressed={!detail} onClick={() => setDetail(false)}>ექსპონატი</button><button className={detail ? "chosen" : ""} aria-pressed={detail} onClick={() => setDetail(true)}>დეტალი</button><button aria-label="ორიგინალი ფოტოს ნახვა" onClick={() => { setReferenceImage(product.image); setPanel("photos"); }}><Expand size={14} />ორიგინალი</button></div>
          <button hidden={sceneId === "coin"} className="stage-arrow prev" aria-label="წინა ნივთი" disabled={saving} onClick={() => move(-1)}><ArrowLeft size={23} /></button><button hidden={sceneId === "coin"} className="stage-arrow next" aria-label="შემდეგი ნივთი" disabled={saving} onClick={() => move(1)}><ArrowRight size={23} /></button>
          <div className="stage-bottom"><span>შენი ბიბლიოთეკიდან · CONCEPT</span><span>{mode === "source" ? "ORIGINAL VISUAL" : `${preview.scale.toUpperCase()} · ${materials[preview.material]}`}</span></div>
        </div>
        <aside className="exhibit-details" aria-live="polite">
          <div className="exhibit-meta"><span className="eyebrow">MERGE COLLECTION</span><span className="status">CONCEPT</span></div>
          <h2>{product.title}</h2><p className="product-subtitle">{product.subtitle}</p>
          <div className="spec-line"><span>{mode === "source" ? "კონცეფციის პალიტრა" : "ჩემი ვერსიის ტონი"}</span><strong>{mode === "source" ? index === 0 ? "წითელი · შავი · მეტალი" : "ვერცხლის ტონი" : materials[preview.material]}</strong></div><div className="spec-line"><span>მოზაიკა</span><strong>{scales[preview.scale]}</strong></div>
          <p className="source-caption">{index === 0 ? "მოზაიკის გამორჩეული ხელწერა. შენი სტილის გაგრძელება." : "სათვალის მრგვალი ფუტლარი — შენი კოლექციის პირადი სივრცე."}</p>
          <div className="choice-buttons"><button className={mode === "source" ? "choice selected" : "choice"} aria-pressed={mode === "source"} disabled={saving} onClick={keep}><Check size={17} /><span>დავტოვო არსებული</span></button><button className={mode === "custom" ? "choice selected" : "choice"} aria-pressed={mode === "custom"} disabled={saving} onClick={customize}><Plus size={17} /><span>{active ? "შევქმნა ახალი ვერსია" : "შევქმნა ჩემი ვერსია"}</span></button></div>
          {mode === "custom" && <div className="customizer">
            <label htmlFor="version-name">ჩემი ვერსიის სახელი</label><input ref={versionName} id="version-name" placeholder="მაგ. MERGE GIORGI" maxLength={60} disabled={saving || !!active} value={config.name} onChange={event => update({ ...config, name: event.target.value })} />
            <div className="select-row"><div><label id="material-label">მასალა</label><Select disabled={saving || !!active} value={config.material} onValueChange={value => update({ ...config, material: value as Config["material"] })}><SelectTrigger aria-labelledby="material-label"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(materials).map(([key,value]) => <SelectItem key={key} value={key}>{value}</SelectItem>)}</SelectContent></Select></div><div><label id="scale-label">მოზაიკის ზომა</label><Select disabled={saving || !!active} value={config.scale} onValueChange={value => update({ ...config, scale: value as Config["scale"] })}><SelectTrigger aria-labelledby="scale-label"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="fine">წვრილი · FINE</SelectItem>{index === 1 && <SelectItem value="medium">საშუალო · MEDIUM</SelectItem>}</SelectContent></Select></div></div>
            <p className="fine-note">მასალის ტონი ილუსტრაციაა · SIMULATED. შენახვა ქმნის დიზაინის მონახაზს; ახალი 3D მოდელი ჯერ არ გენერირდება.</p>
            {signedIn ? <button className="button light" onClick={() => void save()} disabled={saving || !!active}>{saving ? "ინახება…" : active ? "შენახულია ამ ბრაუზერში" : "შევინახო ამ ბრაუზერში"}</button> : <a className="button light" href="/login" target="_top">შესვლა შენახვისთვის</a>}
            <MuseumGenerationStatus sourceReference={product.product_id} draftId={active?.draft_id} />
          </div>}
          <div className="verification-block"><button className="verification-link" disabled={saving} onClick={() => setPanel("verify")}><ShieldCheck size={19} /><span>ვერიფიკაცია შეკვეთამდე<small>ფასი და წარმოება ჯერ დაუდასტურებელია</small></span><MoveUpRight size={16} /></button></div>
          <div className="detail-links"><button disabled={saving} onClick={() => setPanel("exhibit")}><Layers3 size={16} />წყარო და ინფორმაცია</button><button disabled={saving} onClick={() => setPanel("fit")}><Fingerprint size={16} />{index === 0 ? "ავატარზე მორგება" : "Fit to Me"}</button><button disabled={saving} onClick={() => setPanel("passport")}><BookOpen size={16} />პასპორტი</button></div>
          {notice && <p role="status" className="notice">{notice}</p>}
          <div className="identity-line"><span>{active ? "მონახაზის ID · EXPERIENCE" : "კონცეფციის Reference ID"}</span><code>{active?.draft_id ?? product.product_id}</code>{active && <span>CORE Product ID ჯერ არ მინიჭებულა.</span>}</div>
        </aside>
      </section>
      </ExhibitSurface>}
      <section id="visual-exhibition" className="visual-exhibition" aria-label="MERGE-ის ვიზუალური კოლექციები">
        <div className="visual-heading"><div><span className="eyebrow">THE MERGE UNIVERSE</span><h2>სამყარო, რომელიც შენია.</h2></div><span className="visual-count">{String(museumVisuals.length).padStart(2,"0")} VISUAL STUDIES</span></div>
        <div className="visual-filters" aria-label="ვიზუალების კატეგორია">{(["ყველა", "კოლექციები", "სამყარო", "მასალები"] as const).map(category => <button key={category} aria-pressed={visualCategory === category} onClick={() => setVisualCategory(category)}>{category}</button>)}</div>
        <div className="visual-grid">{museumVisuals.filter(photo => visualCategory === "ყველა" || photo.category === visualCategory).map(photo => <button key={photo.image} className="visual-exhibit" aria-label={`${photo.title} — ორიგინალი ფოტოს გახსნა`} onClick={() => { setReferenceImage(photo.image); setPanel("photos"); }}><div className="visual-image"><img src={photo.image} alt={photo.alt} loading="lazy" style={{ objectPosition: photo.position }} /><span className="visual-expand"><Expand size={17} /></span></div><div className="visual-caption"><span>{photo.kicker}</span><h3>{photo.title}</h3><span className="visual-label">კონცეფცია</span></div></button>)}</div>
      </section>
      <footer className="museum-footer"><div><MergeMasterLogo decorative /><span>MERGE ⭐ STARS</span></div><span>YOUR BRAND. YOUR CRAFT. YOUR LEGACY.</span><a href="/transparency">გამჭვირვალობა</a><button disabled={saving} onClick={() => setPanel("governance")}>მართვის წესები</button><button disabled={saving} onClick={() => setPanel("system")}>სისტემის სტატუსი</button></footer>
    </>}
    <Dialog open={panel !== "none"} onOpenChange={open => { if (!open) setPanel("none"); }}><DialogContent className={panel === "photos" || panel === "detail" ? "museum-dialog photo-dialog" : "museum-dialog"} showCloseButton={false} onOpenAutoFocus={() => { const element = document.activeElement; if (element instanceof HTMLElement && !element.closest('[data-slot="dialog-content"]')) returnFocus.current = element; }} onCloseAutoFocus={event => { event.preventDefault(); if (returnFocus.current?.isConnected) returnFocus.current.focus(); returnFocus.current = null; }}><button className="dialog-close" aria-label="დახურვა" onClick={() => setPanel("none")}>×</button>
      <DialogTitle>{panel !== "none" ? titles[panel] : ""}</DialogTitle><DialogDescription>{panel !== "none" ? descriptions[panel] : ""}</DialogDescription>
      {panel === "journey" && <VipJourney onEnterMuseum={() => { setPanel("none"); if (!entered) enter(); }} onCatalog={() => setPanel("vitrine")} onCommercial={() => setPanel("commercial")} />}
      {panel === "commercial" && <><figure className="founder-context-photo"><img src="/living-museum/assets/founder-journey-19-24-oct18.png" alt="სახელოსნოები, შეკვეთა და Brand Room — კონცეფტუალური გზა" /><figcaption>CONCEPT · სურათზე ნაჩვენები თანხები და დადასტურებები არ წარმოადგენს რეალურ შეთავაზებას.</figcaption></figure><CommercialReadiness /></>}
      {panel === "fit" && <figure className="founder-context-photo"><img src="/living-museum/assets/founder-private-studios-oct18.png" alt="Aurum / Argentum პირადი მორგების სახელოსნოები" /><figcaption>CONCEPT · პერსონალური მორგება მოითხოვს შენს თანხმობასა და რეალურ Fit Profile-ს.</figcaption></figure>}
      {panel === "vitrine" && <figure className="founder-context-photo"><img src="/living-museum/assets/founder-collection-fit-oct18.png" alt="Aurum / Argentum კოლექციების არქიტექტურა" /><figcaption>CONCEPT · კოლექციის რეალური ნივთები იტვირთება ქვემოთ არსებული CORE კატალოგიდან.</figcaption></figure>}
      {panel === "exhibit" && <ExhibitDossier product={product} draft={active} preview={preview} custom={mode === "custom"} onOriginal={() => { setReferenceImage(product.image); setPanel("photos"); }} onVerification={() => setPanel("verify")} onFit={() => setPanel("fit")} />}
      {panel === "point" && view.kind === "house" && <MuseumPointDossier view={view} sceneId={sceneId} onOriginal={() => { setReferenceImage(museumScenes[sceneId].image); setPanel("photos"); }} />}
      {panel === "pulse" && <MuseumPulse pointId={view.point_id} />}
      {panel === "vitrine" && <CoreCatalogBrowser category={categoryForPoint(view.point_id)} presentation="vitrine" onPlace={reference => { setVitrineRequest({ reference, serial: Date.now() }); setPanel("none"); if (sceneId !== "coin") setSceneId("coin"); if (view.kind === "exhibit") setView(returnToMuseum(view)); }} />}
      {panel === "children" && <MuseumChildren />}
      {panel === "registration" && <RegistrationPreparation onPayment={() => setPanel("entry-law")} />}
      {panel === "entry-law" && <EntryPaymentLaw />}
      {panel === "detail" && inspection && <><MuseumImageDetail key={inspection.id} image={inspection.image} title={inspection.title} crop={inspection.crop} /><button className="text-link" onClick={() => { setReferenceImage(inspection.image); setPanel("photos"); }}><Expand size={16}/>წყაროს სრული ფოტოს ნახვა</button></>}
      {panel === "photos" && <><div className="photo-reader"><button className="photo-arrow" aria-label="წინა ორიგინალი ფოტო" onClick={() => moveReference(-1)}><ArrowLeft size={19} /></button><div aria-live="polite"><strong>{reference?.title}</strong><span>{String(referenceIndex + 1).padStart(2,"0")} / {String(sourcePhotos.length).padStart(2,"0")}</span></div><button className="photo-arrow" aria-label="შემდეგი ორიგინალი ფოტო" onClick={() => moveReference(1)}><ArrowRight size={19} /></button></div><MuseumImageDetail key={referenceImage} image={referenceImage} title={reference?.alt ?? "MERGE-ის ორიგინალი კონცეპტუალური ვიზუალი"} /><div className="photo-navigation">{sourcePhotos.map(photo => <button key={photo.image} aria-pressed={photo.image === referenceImage} className={photo.image === referenceImage ? "chosen" : ""} onClick={() => setReferenceImage(photo.image)}>{photo.title}</button>)}</div></>}
      {panel === "collection" && <>
        {!signedIn ? <a className="button light" href="/login" target="_top">შედი პირად კოლექციაში</a> : loading ? <p role="status">კოლექცია იტვირთება…</p> : loadError ? <div className="empty-collection"><p role="alert">{loadError}</p><button className="button outline" onClick={() => void load()}><RefreshCw size={16} />ხელახლა ცდა</button></div> : drafts.length === 0 ? <div className="empty-collection"><Layers3 size={32} /><p>კოლექცია ჯერ ცარიელია.<br />აირჩიე ნივთი და შეინახე შენი დიზაინი.</p></div> : <div className="version-list">{drafts.map(draft => { const source = catalog.find(item => item.product_id === draft.source_reference_id); return <button key={draft.draft_id} className="version-item" onClick={() => openDraft(draft)}><img src={source?.image} alt="" /><div><strong>{draft.name}</strong><span>CONCEPT · {materials[draft.config.material]}</span><span>{new Date(draft.created_at).toLocaleDateString("ka-GE",{timeZone:"Asia/Tbilisi"})}</span></div><span>გახსნა</span></button>; })}</div>}
        {active && <div className="lineage"><h3>მონახაზის წყარო და ისტორია</h3><dl><div><dt>Root Reference</dt><dd>{active.root_reference_id}</dd></div><div><dt>Source Reference</dt><dd>{active.source_reference_id}</dd></div><div><dt>Parent Draft</dt><dd>{active.parent_draft_id ?? "პირველი მონახაზი"}</dd></div><div><dt>Draft ID</dt><dd>{active.draft_id}</dd></div><div><dt>CORE Product / House</dt><dd>ჯერ არ მინიჭებულა</dd></div></dl></div>}
        <p className="fine-note">მონახაზი ინახება ანგარიშის დაცულ სივრცეში. პროდუქტის რეგისტრაცია, ბრენდის უფლებები და ვერიფიკაცია CORE-ს ეკუთვნის.</p>
        <CoreCatalogBrowser />
      </>}
      {panel === "system" && <><div className="system-layers"><div><span>01 · SYSTEM OF RECORD</span><h3>MERGE CORE</h3><p>იდენტობა, QR, კატალოგი, Live Price, შეკვეთები, გადახდის სტატუსი და პროდუქტის პასპორტი.</p><strong>CORE არასოდეს გენერირდება თავიდან.</strong></div><div><span>02 · EXPERIENCE LAYER</span><h3>Living Museum</h3><p>ექსპონატები, დიზაინის მონახაზები და პირადი კოლექცია. მონახაზი არ ქმნის ფინანსურ ვალდებულებას.</p></div></div><p className="fine-note">ამ მუზეუმის შესვლა ჯერ MERGE CORE-ის საერთო სესიას არ ქმნის. CORE-ის პირადი პროფილისა და მოქმედებების დაკავშირება დარჩენილია.</p><CorePriceReference /><div className="feature-statuses">{featureStatuses.map(feature => <div key={feature.name}><div><strong>{feature.name}</strong><span className="status">{feature.status}</span></div><p>{feature.detail}</p></div>)}</div></>}
      {panel === "governance" && <><div className="system-layers"><div><span>FOUNDING 13 · 1 + 12</span><p>1 დამფუძნებელი Architecture Owner + 12 დამოუკიდებელი Founding Brand House Owner. ეს არის დამფუძნებელი სტრუქტურა და არა 13 თანამშრომელი.</p></div><div><span>დამფუძნებელი · გიორგი რევაზიშვილი</span><p>ხედვა, ბიზნეს კანონები, ბრენდი, პროდუქტის წესები, კომერციული პოლიტიკა და საბოლოო დამტკიცება.</p></div><div><span>MERGE AI · სისტემური არქიტექტურა</span><p>არქიტექტურა, მონაცემთა მოდელები, UX/UI, უსაფრთხოება და MASTER CORE-თან შესაბამისობის შემოწმება.</p></div><div><span>დეველოპერები · ოფიციალური იმპლემენტაცია</span><p>დამტკიცებული წესების ზუსტად განხორციელება, ინტეგრაცია, ტესტირება და მოვლა.</p></div></div><p className="notice">კრიტიკული კანონის ცვლილება ძალაში შედის მხოლოდ დამფუძნებლის დამტკიცებით. ცვლილება არ ხდება ჩუმად.</p><div className="connection-note"><ShieldCheck size={21} /><p>BUILD EXACTLY. VERIFY EVERYTHING. PRESERVE THE CORE.</p></div></>}
      {panel === "verify" && <><div className="review-product"><strong>{active?.name ?? product.title}</strong><code>{active?.draft_id ?? product.product_id}</code><span className="status">CONCEPT · ვერიფიკაცია არ არსებობს</span></div><div className="evidence-list">{evidence.map(item => <div key={item}><LockKeyhole size={16} /><span>{item}</span><span>არ არსებობს</span></div>)}</div><p className="notice">შეთავაზების მოთხოვნა ჯერ არ გაგზავნილა. CORE დაუკავშირებელია. ჩეკბოქსი ან მომხმარებლის მოქმედება ვერ შექმნის VERIFIED სტატუსს.</p><h3 className="workflow-title">შეკვეთის დასადასტურებელი გზა</h3><ol className="order-steps">{workflow.map(([title,description],n) => <li key={title}><span>{String(n+1).padStart(2,"0")}</span><div><strong>{title}</strong><small>{description}</small></div></li>)}</ol><button className="button outline" disabled>შეკვეთა ჯერ მიუწვდომელია</button></>}
      {panel === "passport" && <><div className="review-product"><strong>{active?.name ?? product.title}</strong><span className="status">NOT YET IMPLEMENTED</span></div><p>ფიზიკური პროდუქტი, მწარმოებელი, QC/XRF, მფლობელობა და QR ამ მონახაზისთვის არ არის დადასტურებული.</p><p className="notice">პასპორტის ან სერტიფიკატის შექმნა დაბლოკილია მტკიცებულებების მიღებამდე. კონცეპტუალური სურათი არ არის წარმოების ან ხარისხის მტკიცებულება.</p></>}
      {panel === "fit" && <><div className="review-product"><strong>{index === 0 ? "სათვალე → ჩემი ავატარი" : "ჩემი Digital Twin / Fit Profile"}</strong><span className="status">CORE პროფილი დაუკავშირებელია</span></div><p>{index === 0 ? "სათვალის მორგება უნდა გამოიყენებდეს შენს არსებულ CORE ავატარს და სახის/თავის Fit Profile-ს. არჩეულია " + product.title + "." : "ჩანთა-ფუტლარის პირადი ვერსია მოითხოვს ფუნქციისა და ზომების განსაზღვრას."}</p><p className="notice">ამ ეტაპზე არსებული CORE პროფილი აქ ვერ იტვირთება და რეალური მორგება არ სრულდება. მეორე პროფილი არ იქმნება და სხეულის მონაცემები არ გროვდება.</p></>}
    </DialogContent></Dialog>
  </main>;
}
