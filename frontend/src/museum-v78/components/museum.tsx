"use client";
import {clientRequestId} from '@/museum-v78/lib/client-request-id';
import {MuseumWorldWorkspace,emptyWorldWorkspace,type WorldWorkspaceMemory} from './museum-world-workspace';
import {requestLift} from '@/museum-v78/lib/world-layout';
import type {WorldAction,WorldTab} from '@/museum-v78/lib/unified-world';
import {emptyMuseumDestination,type MuseumDestination} from '@/museum-v78/lib/house-experience';
import { lazy, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Activity, ArrowLeft, ArrowRight, Baby, Check, Layers3, LockKeyhole, Plus, ShieldCheck, Fingerprint, BookOpen, RefreshCw, Expand, MoveUpRight, Route, CircleDollarSign, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/museum-v78/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/museum-v78/components/ui/select";
import { catalog, nextIndex, type Config } from "@/museum-v78/lib/museum-domain";
import {  type DesignDraft } from "@/museum-v78/lib/draft-contract";
import type { VisualCategory } from "@/museum-v78/lib/museum-visuals";
import {museumSourcePhotos as sourcePhotos,visualPhotos} from '@/museum-v78/lib/museum-photo-library';
import {visualDestination} from '@/museum-v78/lib/visual-routes';
import {VisualJourney} from '@/museum-v78/components/visual-journey';
import {ContextPhotoSequence} from './photo-scenario';
import {storyboardStage,storyboardStudio} from '@/museum-v78/lib/photo-scenario';
import {MaterialReferenceLibrary} from '@/museum-v78/components/material-reference-library';
import {FounderStudio} from '@/museum-v78/components/founder-studio';
import {museumPanelWindow} from "@/museum-v78/lib/luxury-windows";
import { CoreCatalogBrowser } from "@/museum-v78/components/core-context";
import { FilamentPreference, materialPreferenceComplete } from "@/museum-v78/components/filament-preference";
import { ExhibitDossier } from "@/museum-v78/components/exhibit-dossier";
import { loadDesignDrafts, saveDesignDraft } from "@/museum-v78/lib/draft-client";
import { MeasurementMap } from "@/museum-v78/components/measurement-map";
import { displayBodyShape, emptyMeasurementDraft, type FitCategory, type BodyFieldId } from "@/museum-v78/lib/fit-measurements";
import { ENTRANCE_DURATION } from "@/museum-v78/lib/megapolis-entrance";
import { MuseumGate } from "@/museum-v78/components/museum-gate";
import { CompanyMark, CompanyWordmark } from "@/museum-v78/components/company-identity";
import { AscensionExhibits } from './ascension-exhibits';
import { ascensionPresentationImage } from '@/museum-v78/lib/ascension-exhibits';
import { MuseumImageDetail } from "@/museum-v78/components/museum-image-detail";
import { exhibitById } from "@/museum-v78/lib/museum-spatial";
import type { ImageCrop } from "@/museum-v78/lib/image-detail";
import type { VitrineRequest } from "@/museum-v78/lib/museum-vitrine";
import type { CoreExhibitReference } from "@/museum-v78/lib/museum-vitrine";
import { cityStart, type CityPosition } from "@/museum-v78/lib/megapolis-domain";
import { defaultCityCamera, type CameraPreference } from "@/museum-v78/lib/megapolis-motion";
import type { AvatarPresentation } from "@/museum-v78/lib/presentation-avatar";
import { MuseumSceneBoundary } from "@/museum-v78/components/museum-scene-boundary";
import { MuseumHouse } from "@/museum-v78/components/museum-house";
import { MuseumGenerationStatus, MuseumPulse } from "@/museum-v78/components/museum-activity";
import { MuseumPointDossier } from "@/museum-v78/components/museum-point-dossier";
import { MuseumChildren } from "@/museum-v78/components/museum-children";
import { EntryPaymentLaw } from "@/museum-v78/components/entry-payment-law";
import { RegistrationPreparation } from "@/museum-v78/components/registration-preparation";
import { PersonalMergeAI } from "@/museum-v78/components/personal-merge-ai";
import { VipJourney } from "@/museum-v78/components/vip-journey";
import {MyMuseumLibrary} from '@/museum-v78/components/my-museum-library';
import {SystemControlRoom} from '@/museum-v78/components/system-control-room';
import { CommercialReadiness } from "@/museum-v78/components/commercial-readiness";
import { readMuseumBookmark } from "@/museum-v78/lib/museum-sharing";
import { enterMuseum, getMuseumPoint, museumScenes, museumScenePoints, moveMuseumPoint, openMuseumExhibit, approachMuseumPoint, pointForMuseumReference, returnToMuseum, type MuseumView, type MuseumPointId, type MuseumSceneId } from "@/museum-v78/lib/museum-tour";
import { sceneCamera, type SceneCamera } from "@/museum-v78/lib/scene-camera";

const loadSpatialMuseum = () => import("@/museum-v78/components/museum-spatial");
const SpatialMuseum = lazy(() => loadSpatialMuseum().then(value => ({ default: value.SpatialMuseum })));
const GrandAtrium = lazy(() => import('./grand-atrium').then(value => ({default:value.GrandAtrium})));
const Megapolis = lazy(() => import("@/museum-v78/components/megapolis").then(value => ({ default: value.Megapolis })));


const materials: Record<Config["material"], string> = { mixed: "ოქრო + ვერცხლი", silver: "ვერცხლი", gold: "ოქრო" };
const scales: Record<Config["scale"], string> = { fine: "წვრილი · FINE", medium: "საშუალო · MEDIUM" };
type Panel = "none" | "world" | "founder-studio" | "personal-ai" | "registration" | "journey" | "commercial" | "collection" | "system" | "verify" | "governance" | "passport" | "fit" | "photos" | "detail" | "exhibit" | "point" | "pulse" | "vitrine" | "children" | "entry-law";
const evidence = ["ვერსიასთან მიბმული CORE Product ID", "დიზაინი, ზომები და ბრენდის თანხმობა", "მასალის შემადგენლობა და წონა", "მწარმოებელი და შესრულების ვადა", "მოქმედი, დადასტურებული შეთავაზება"];
const workflow = [
  ["დიზაინის მონახაზი", "შენახული კონცეფცია; ჯერ არ არის წარმოების შეკვეთა"],
  ["CORE-ში რეგისტრაცია და მოდელის შენახვა", "იგივე იდენტობა, წყარო და ახალი version_id"],
  ["ოფიციალური CORE შეკვეთის დადასტურება", "ავტორიზებული გენერაციიდან CORE შეკვეთის ავტომატური რეგისტრაცია და უნიკალური Order ID; წინასწარი გადახდა და 1,000 რეგისტრაციის ლოდინი არ მოითხოვება"],
  ["ტექნიკური შემოწმება და გამოთვლა", "უფლებები, მასალა, წონა, მწარმოებელი და დამტკიცებული LIVE snapshot"],
  ["VERIFIED OFFER", "დადასტურებული ფასი, სპეციფიკაცია და ვადა"],
  ["PAY NOW / PAY LATER და დაფარვის დადასტურება", "ოფიციალური შეკვეთა ჯერ გადაუხდელია; დაფარვა მხოლოდ CORE-ის დადასტურებული მტკიცებულებით"],
  ["წარმოების ავტორიზაცია და QC", "მწარმოებლის დადასტურება და ხარისხის მტკიცებულება"],
  ["Product Passport · Brand House", "დადასტურებული პროდუქტი და მისი ისტორია"],
];

function ExhibitSurface({spatial,children,onClose}:{spatial:boolean;children:ReactNode;onClose:()=>void}) {
  return spatial ? <Dialog open onOpenChange={open => { if (!open) onClose(); }}><DialogContent visual="atelier" windowChrome="compact" className="spatial-atelier-overlay" showCloseButton={false} onCloseAutoFocus={event => { event.preventDefault(); document.getElementById("museum-space")?.focus({ preventScroll: true }); }}><DialogTitle className="sr-only">ექსპონატის კონტექსტური სახელოსნო</DialogTitle><DialogDescription className="sr-only">შექმენი მონახაზი ან დახურე ხელსაწყოები მუზეუმის იმავე პოზიციაზე დასაბრუნებლად.</DialogDescription>{children}</DialogContent></Dialog> : <>{children}</>;
}

export default function Museum({ signedIn, sessionScope }: { signedIn: boolean; sessionScope?: string }) {
  const [entered, setEntered] = useState(false), [opening, setOpening] = useState(false), [index, setIndex] = useState(0);
  const [openDoorStatus,setOpenDoorStatus]=useState<'loading'|'ready'|'unavailable'>('loading');
  const [view, setView] = useState<MuseumView>(enterMuseum);
  const [sceneId, setSceneId] = useState<MuseumSceneId>("coin");
  const [worldMode, setWorldMode] = useState<"city" | "museum">("city");
  const [legacyMuseum,setLegacyMuseum]=useState(false),[grandVisit,setGrandVisit]=useState(0);
  const grandMemory=useRef<MuseumDestination>({...emptyMuseumDestination});
  const grandRooms=useRef<Partial<Record<import('@/museum-v78/lib/megapolis-domain').CityHouseId,import('@/museum-v78/lib/house-room').HouseRoomSnapshot>>>({});
  const grandStudios=useRef<Record<string,import('@/museum-v78/lib/museum-studio-memory').MuseumStudioMemory|undefined>>({});
  const worldMemory=useRef<WorldWorkspaceMemory>(emptyWorldWorkspace());
  const worldReturn=useRef(false);
  const managerMemory=useRef<import('@/museum-v78/components/merge-ai-workspace').ManagerWorkspaceMemory|null>(null);
  const grandScope=useRef(sessionScope);
  if(grandScope.current!==sessionScope){grandScope.current=sessionScope;grandMemory.current={...emptyMuseumDestination};grandRooms.current={};grandStudios.current={};worldMemory.current=emptyWorldWorkspace();worldReturn.current=false;managerMemory.current=null;}
  const cityPosition = useRef<CityPosition>({ ...cityStart });
  const cityCameraMemory = useRef<CameraPreference>({...defaultCityCamera});
  const cityAvatarMemory = useRef<AvatarPresentation>('woman');
  const [mode, setMode] = useState<"source" | "custom">("source");
  const [drafts, setDrafts] = useState<DesignDraft[]>([]), [active, setActive] = useState<DesignDraft | null>(null);
  const [parentId, setParentId] = useState<string | null>(null), [config, setConfig] = useState<Config>({ ...catalog[0].config });
  const [panel, setPanel] = useState<Panel>("none"), [notice, setNotice] = useState(""), [detail, setDetail] = useState(false);
  const [grandArrival,setGrandArrival]=useState<'museum'|'labs'>('museum');
  const [brandRequest,setBrandRequest]=useState(0),[managerSection,setManagerSection]=useState('');
  const [cityStatus,setCityStatus]=useState<"loading"|"ready"|"unavailable">("loading");
  const [measurements,setMeasurements]=useState(emptyMeasurementDraft),[fitOpen,setFitOpen]=useState(false),[fitCategory,setFitCategory]=useState<FitCategory>("fashion"),[fitField,setFitField]=useState<BodyFieldId|null>(null);
  function openFit(category:FitCategory="fashion",field:BodyFieldId|null=null){setFitCategory(category);setFitField(field);setFitOpen(true);}
  const [sharedPoint, setSharedPoint] = useState<MuseumPointId | null>(null);
  const [referenceImage, setReferenceImage] = useState("/museum-v78/assets/museum-world.png");
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
    setWorldMode("museum");
    const point = pointForMuseumReference(catalog[n].product_id);
    const house = state.current.view.point_id === point.id ? returnToMuseum(state.current.view) : approachMuseumPoint(point.id, state.current.sceneId);
    setView(openMuseumExhibit(house, catalog[n].product_id));
    setIndex(n); setMode("source"); setActive(null); setParentId(null); setConfig({ ...catalog[n].config, name: "" });
    requestId.current = null; setDetail(false); setNotice("");
  }
  function move(direction: number) { select(nextIndex(state.current.index, direction, catalog.length)); }
  function openWorld(tab:WorldTab='atrium'){worldMemory.current={...worldMemory.current,tab,lift:tab==='gallery'||tab==='house'?requestLift(worldMemory.current.lift,8):tab==='atrium'?requestLift(worldMemory.current.lift,0):worldMemory.current.lift};setPanel('world');}
  function worldAction(action:WorldAction,sceneId?:number){
    if(sceneId&&storyboardStage(sceneId)){openStoryboardStep(sceneId);return;}
    worldReturn.current=true;
    if(action==='atrium'){showGrandMuseum();return;}
    if(action==='gallery'||action==='house'){showBrandMuseum();return;}
    if(action==='zodiac'){openWorld(action);return;}
    if(action==='city'){worldReturn.current=false;returnToSpace();setWorldMode('city');return;}
    if(action==='industries'||action==='design'||action==='generation'){worldReturn.current=false;showGrandMuseum();return;}
    if(action==='fit'){setPanel('none');openFit('fashion');return;}
    if(action==='collection'){setPanel('collection');void load();return;}
    if(action==='materials'||action==='mosaic'){setReferenceImage(action==='mosaic'?'/museum-v78/assets/mosaic-gold.png':'/museum-v78/assets/material-library.png');setPanel('entry-law');return;}
    if(action==='ai'||action==='social'){showManager(action==='social'?'mai-social':'');return;}
    if(action==='orders'){setPanel('commercial');return;}
    if(action==='passport'){setPanel('passport');return;}
    if(action==='entrance'){setReferenceImage(sceneId===3?'/museum-v78/assets/founder-entry-open-approved.png':'/museum-v78/assets/founder-entry-closed.png');setPanel('photos');return;}
    setPanel('vitrine');
  }
  function worldHouse(houseId:import('@/museum-v78/lib/megapolis-domain').CityHouseId){worldReturn.current=false;returnToSpace();grandMemory.current={...emptyMuseumDestination,houseId};setLegacyMuseum(false);setGrandVisit(value=>value+1);setWorldMode('museum');}
  function showBrandMuseum(){worldReturn.current=false;returnToSpace();setWorldMode('city');setBrandRequest(value=>value+1);}
  function showManager(section=''){worldReturn.current=false;setManagerSection(section);setPanel('personal-ai');}
  function showOriginal(image:string){setReferenceImage(image);setPanel('photos');}
  function openStoryboardStep(id:number){
    if(saving||inFlight.current||!entered)return;
    const step=storyboardStage(id);if(!step)return;worldReturn.current=false;
    const destination=storyboardStudio(id);
    if(destination){returnToSpace();grandMemory.current=destination;setLegacyMuseum(false);setGrandVisit(value=>value+1);setWorldMode('museum');return;}
    if(step.target==='fit'){setPanel('none');openFit('fashion');return;}
    if(step.target==='orders'){setPanel('commercial');return;}
    if(step.target==='collection'){setPanel('collection');void load();return;}
    if(step.target==='brand'){showBrandMuseum();return;}
    if(step.target==='ai'||step.target==='social'){showManager(step.target==='social'?'mai-social':'mai-chat');return;}
    if(step.target==='city'){returnToSpace();setWorldMode('city');}
  }
  function showGrandMuseum(){setGrandArrival('museum');returnToSpace();grandMemory.current={...emptyMuseumDestination};setLegacyMuseum(false);setGrandVisit(value=>value+1);setWorldMode("museum");}
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
    setWorldMode("museum");
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
  function openVisualSpace(image:string){
    if(!entered||saving||inFlight.current)return;
    const destination=visualDestination(image);if(!destination)return;
    setReferenceImage(image);
    if(destination.kind==='house'){
      returnToSpace();grandMemory.current={...emptyMuseumDestination,houseId:destination.houseId};setLegacyMuseum(false);setGrandVisit(value=>value+1);setWorldMode('museum');
    }else if(destination.kind==='museum'){showGrandMuseum();if(image==='/museum-v78/assets/founder-atelier-stages-19-24.png')setGrandArrival('labs');}
    else if(destination.kind==='city'){returnToSpace();setWorldMode('city');}
    else if(destination.kind==='ai')showManager();
    else if(destination.kind==='brand')showBrandMuseum();
    else if(destination.kind==='fit'){setPanel('none');openFit('fashion');}
    else if(destination.kind==='collection'){setPanel('collection');void load();}
    else if(destination.kind==='materials')setPanel('entry-law');
    else if(destination.kind==='passport')setPanel('passport');
    else if(destination.kind==='studio')setPanel('founder-studio');
    else setPanel('journey');
    window.scrollTo({top:0,behavior:'auto'});
  }
  function enter() {
    if (entered || opening || timer.current || cityStatus === "loading" || openDoorStatus !== 'ready') return;
    void loadSpatialMuseum().catch(() => {});
    void import("@/museum-v78/components/megapolis").catch(() => {});
    // Closed leaves → actual open reference → push through → same existing city.
    setWorldMode("city"); setSceneId("coin");
    setView(enterMuseum()); setPanel("none"); setOpening(true);
    timer.current = setTimeout(() => { timer.current = null; setEntered(true); setOpening(false); }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : ENTRANCE_DURATION);
  }
  function leave() {
    if (inFlight.current) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setOpening(false); setEntered(false); setView(enterMuseum()); setPanel("none");
  }
  function customize() {
    if (inFlight.current || (mode === "custom" && !active)) return;
    setMode("custom"); setParentId(active?.draft_id ?? null); setActive(null);
    setConfig({ ...(active?.config ?? product.config), name: active ? `${active.name.slice(0,45)} · ახალი` : "" });
    requestId.current = null; setNotice("");
  }
  function placeCoreExhibit(reference: CoreExhibitReference) {
    setVitrineRequest({ reference, serial: Date.now() }); setPanel("none"); setLegacyMuseum(true); setWorldMode("museum"); setSceneId("coin");
    if (view.kind === "exhibit") setView(returnToMuseum(view));
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
    if (!materialPreferenceComplete(config.material_preference)) { setNotice("შეავსე საბაზისო ფილამენტი, ოქროს/ვერცხლის არჩევანი, ინტეგრაციის ფორმა და გამოყენების მიზანი."); return; }
    inFlight.current = true; setSaving(true); setNotice("");
    const snapshot = { source_reference_id: product.product_id, parent_draft_id: parentId, request_id: requestId.current ?? clientRequestId(), config: { ...config } };
    requestId.current = snapshot.request_id;
    try {
      const draft = await saveDesignDraft(snapshot);
      if (!mounted.current) return;
      setActive(draft); setConfig({ ...draft.config });
      setDrafts(items => [draft, ...items.filter(item => item.draft_id !== draft.draft_id)]);
      setNotice("მონახაზი შენახულია შენს პირად კოლექციაში. ხელახლა შესვლისასაც დაგხვდება.");
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

  const titles: Record<Exclude<Panel,"none">, string> = { "world":"MERGE · Unified Living Museum", "founder-studio": "Founder Studio", "personal-ai": "MERGE AI · Personal Brand Manager", "registration": "MERGE ID · Your Profile", "detail": inspection?.title ?? "Exhibit Details", "journey": "Your MERGE Journey", "commercial": "Orders · Payments · Production", "collection": "My Living Collection", "system": "MERGE System Status", "verify": "Product Verification", "governance": "MERGE · Governance", "passport": "Product Passport", "fit": "Fit to Me", "photos": "MERGE · Original Visuals", "exhibit": "Exhibit · Source & History", "point": "Your Showcase", "pulse": "MERGE PULSE · Coin & Museum", "vitrine": "CORE Collection Showcase", "children": "BABE / RUMI · Children’s Collection", "entry-law": "Gold / Silver · Entry & Payment" };
  const descriptions: Record<Exclude<Panel,"none">, string> = { "world":"Grand Atrium, panoramic elevator and one shared private Brand House editor.", "founder-studio": "Founder-supplied architectural concept. Existing tools retain their own authorization.", "personal-ai": "Your existing brand, social preparation and verified connection status.", "registration": "Your existing CORE identity, delivery details and preferences.", "detail": "Explore the original image with zoom and 1:1 detail. A real 3D view requires a model asset.", "journey": "From identity and design to verified production, history and legacy.", "commercial": "Authoritative orders, verified payments and production status remain in MERGE CORE.", "collection": "Your private design briefs and source-linked versions.", "system": "Current service status and connections still required.", "verify": "Technical evidence, approved offers and payment requirements for your selected item.", "governance": "Founder, MERGE AI and implementation responsibilities.", "passport": "Authoritative product identity, materials and history from CORE.", "fit": "Personal measurements and your consent-based CORE Fit Profile.", "photos": "Approved architectural and design references, arranged in journey order. Embedded image labels are concept artwork.", "exhibit": "Source, configuration and verification status of the selected item.", "point": "Your selected showcase and the path to your own version.", "pulse": "Gold and Silver price references, with separate real activity and connection states.", "vitrine": "Existing public CORE collections displayed inside the Museum.", "children": "Your requested children’s categories and their connection status.", "entry-law": "Coin package, material composition, LIVE price basis and deferred-payment rules." };

  return <main className={entered ? "museum-shell" : "entrance-shell"} style={entered?{animation:'none'}:undefined} data-world={worldMode}>
    <header className="topbar">
      <button className="brand" aria-label="MERGE შესასვლელი" disabled={saving} onClick={leave}><CompanyWordmark /></button>
      {entered ? <nav aria-label="მუზეუმის ნავიგაცია"><button disabled={saving} onClick={() => { returnToSpace(); setWorldMode("city"); }}>MEGAPOLIS</button><button disabled={saving} onClick={showGrandMuseum} className={panel === "none" && worldMode === "museum" ? "nav-active" : ""}>GRAND MUSEUM</button><button disabled={saving} onClick={() => setPanel("journey")}><Route size={15}/>MY JOURNEY</button><button disabled={saving} onClick={() => setPanel("commercial")}><CircleDollarSign size={15}/>ORDERS</button><a href="#visual-exhibition" onClick={() => setPanel("none")}>REFERENCES</a><button disabled={saving} onClick={() => { setPanel("collection"); void load(); }}>MY DESIGNS <span className="count">{String(drafts.length).padStart(2,"0")}</span></button><button disabled={saving} onClick={()=>setPanel("personal-ai")}><Sparkles size={15}/>MERGE AI</button><button className="pulse-nav" disabled={saving} onClick={() => setPanel("pulse")}><Activity size={15} />MERGE PULSE</button></nav> : <span className="header-caption">THE LIVING MUSEUM</span>}
      <button className="private-label" disabled={saving} onClick={() => setPanel("system")}><LockKeyhole size={14} /><span>PRIVATE · SYSTEM STATUS</span></button>
    </header>
    <div className={!entered?"city-host city-host-entry":worldMode==="city"&&view.kind==="house"?"city-host":"city-host city-host-hidden"}>
      <MuseumSceneBoundary><Suspense fallback={null}><Megapolis onArchitect={()=>openWorld('house')} brandRequest={brandRequest} onStage={openStoryboardStep} onOriginal={showOriginal} onTownDestination={destination=>{if(saving||!entered)return;returnToSpace();grandMemory.current=destination;setLegacyMuseum(false);setGrandVisit(value=>value+1);setWorldMode("museum");}} onIndustry={houseId=>{grandMemory.current={houseId,category:"",query:"",mode:"browse"};setLegacyMuseum(false);setWorldMode("museum");}} onPersonalAI={()=>setPanel("personal-ai")} onSaved={()=>{setPanel("collection");void load();}} onOrders={()=>setPanel("commercial")} onPassport={()=>setPanel("passport")} entranceState={!entered?(opening?"OPENING":"CLOSED"):"INSIDE"} onSceneStatus={setCityStatus} bodyShape={displayBodyShape(measurements)} presentation={measurements.presentation} onAvatarChoice={value=>setMeasurements(current=>current.presentation===value?current:{...current,presentation:value})} onMeasurements={openFit} cameraMemory={cityCameraMemory} avatarMemory={cityAvatarMemory} position={cityPosition} disabled={saving||panel!=="none"||fitOpen||entered&&(worldMode!=="city"||view.kind!=="house")} signedIn={signedIn} focusOnArrival onMuseum={showGrandMuseum} onPlace={placeCoreExhibit} onCoinRules={()=>setPanel("entry-law")} onIdentity={()=>setPanel("registration")}/></Suspense></MuseumSceneBoundary>
    </div>
    {!entered ? <section className={opening ? "entrance founder-entrance opening" : "entrance founder-entrance"} aria-label="MERGE მუზეუმის შესასვლელი">
      <MuseumGate opening={opening} ready={ready&&cityStatus!=="loading"&&openDoorStatus==='ready'} onEnter={enter} live={cityStatus==="ready"} unavailable={cityStatus==="unavailable"} openImageState={openDoorStatus} onOpenImageState={setOpenDoorStatus}/>
      <div className="entrance-heading"><span className="eyebrow">THE JEWELER OF BRANDS</span><h1>MERGE <i>MEGAPOLIS</i></h1></div>
      <div className="entrance-copy"><div><span className="eyebrow">YOUR BRAND. YOUR SIGNATURE.</span><p>Your world begins at this door.</p></div><button className="button light entrance-button" disabled={opening || !ready || cityStatus==="loading" || openDoorStatus!=='ready'} onClick={enter}>{opening ? "OPENING THE GATES…" : "ENTER THE MEGAPOLIS"}<ArrowRight size={20} /></button></div>
      <div className="entrance-footer"><span>01 — THE ENTRANCE</span><button className="text-link" onClick={() => setPanel("registration")}>CREATE MERGE ID · რეგისტრაცია</button><button className="text-link" onClick={() => setPanel("journey")}><Route size={14}/>VIP კლიენტის გზა</button><button className="text-link" onClick={() => { setReferenceImage(museumScenes[sceneId].image); setPanel("photos"); }}>შენი MERGE სამყარო <MoveUpRight size={14}/></button><button className="text-link" onClick={() => setPanel("entry-law")}>Gold / Silver · შესვლის წესი</button><a className="text-link" href="/transparency"><ShieldCheck size={14} />გამჭვირვალობა</a><span>GOLD · SILVER · LEGACY</span></div>
    </section> : <>
      <VisualJourney disabled={saving||panel!=='none'||fitOpen} onOpen={openVisualSpace}/>
      <div className="gallery-heading" data-museum-view={view.kind}><div><span className="eyebrow">MERGE HOUSE & MUSEUM</span><h1>{view.kind === "house" ? worldMode === "city" ? "MERGE MEGAPOLIS" : "GRAND LIVING MUSEUM" : "SELECTED EXHIBIT"}</h1></div>{view.kind === "exhibit" ? <button className="text-link" disabled={saving} onClick={returnToSpace}><ArrowLeft size={16} />ვიტრინასთან დაბრუნება</button> : (worldMode === "museum" ? <button className="text-link" disabled={saving} onClick={showGrandMuseum}>Grand Museum overview <Expand size={16} /></button> : null)}</div>
      {worldMode==="museum"&&!legacyMuseum&&<MuseumSceneBoundary><Suspense fallback={<p role="status">ატრიუმი იტვირთება…</p>}><GrandAtrium initialView={grandArrival} onStage={openStoryboardStep} onOriginal={showOriginal} key={(sessionScope??String(signedIn))+":"+grandVisit} signedIn={signedIn} memory={grandMemory} roomMemories={grandRooms} studioMemories={grandStudios} onWorld={openWorld} onFit={category=>openFit(category)} blocked={panel!=="none"||saving||fitOpen} onCity={()=>setWorldMode("city")} onLegacy={()=>setLegacyMuseum(true)} onCreate={()=>setPanel("personal-ai")} onPlace={reference=>{setLegacyMuseum(true);placeCoreExhibit(reference);}}/></Suspense></MuseumSceneBoundary>}
      {view.kind === "house" && sharedPoint && <div className="shared-vitrine"><span>გაზიარებული ვიტრინა · {getMuseumPoint(sharedPoint).title}</span><button className="text-link" disabled={saving} onClick={() => { browsePoint(sharedPoint); setSharedPoint(null); }}>ვიტრინასთან მისვლა<ArrowRight size={16} /></button></div>}
      {worldMode === "museum" && legacyMuseum && view.kind === "house" && <div className="museum-destinations"><div role="group" aria-label="მუზეუმის ატვირთული ხედები">{(["coin", "house"] as const).map(id => <button key={id} disabled={saving} aria-pressed={sceneId === id} onClick={() => changeScene(id)}>{museumScenes[id].title}</button>)}</div><button className="text-link" disabled={saving} onClick={() => setPanel("vitrine")}><Layers3 size={16} />კოლექციის ვიტრინა</button><button className="text-link" disabled={saving} onClick={() => setPanel("children")}><Baby size={17} />BABE / RUMI · ბავშვების კუთხე</button></div>}

      {worldMode === "museum" && legacyMuseum && sceneId === "coin" && <MuseumSceneBoundary><Suspense fallback={<div className="museum-scene-pending" role="status"><span className="spatial-loading-ring"/><span className="eyebrow">MERGE ⭐ STARS</span><h2>მუზეუმი იხსნება</h2></div>}><SpatialMuseum vitrineRequest={vitrineRequest} view={view} disabled={saving} blocked={panel !== "none" || view.kind === "exhibit"} onPoint={trackSpatialPoint} onExhibit={choosePointExhibit} onCreate={createPointVersion} onInspect={() => setPanel("point")} onCoreVitrine={() => setPanel("vitrine")} onDetail={id => { const item = exhibitById(id); setInspection({ id, image: item.image, title: item.title, crop: item.crop }); setPanel("detail"); }} onOriginal={image => { setReferenceImage(image); setPanel("photos"); }} /></Suspense></MuseumSceneBoundary>}
      {view.kind === "house" ? legacyMuseum && sceneId === "house" && worldMode === "museum" ? <MuseumHouse view={view} sceneId={sceneId} disabled={saving} onPoint={browsePoint} onCamera={updateCamera} onExhibit={choosePointExhibit} onCreate={createPointVersion} onInspect={() => setPanel("point")} onOriginal={image => { setReferenceImage(image); setPanel("photos"); }} /> : null : <ExhibitSurface spatial={sceneId === "coin"} onClose={returnToSpace}>
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
            <FilamentPreference value={config.material_preference} disabled={saving || !!active} onChange={material_preference=>update({...config,material_preference})}/>
            <p className="fine-note">მასალის ტონი ილუსტრაციაა · SIMULATED. შენახვა ქმნის დიზაინის მონახაზს და ინახავს შენს სასურველ მასალას; ახალი 3D მოდელი ჯერ არ გენერირდება.</p>
            {signedIn ? <button className="button light" onClick={() => void save()} disabled={saving || !!active || !materialPreferenceComplete(config.material_preference)}>{saving ? "ინახება…" : active ? "შენახულია კოლექციაში" : "შევინახო ჩემი მონახაზი"}</button> : <a className="button light" href="/login?return_to=%2F" target="_top">შესვლა შენახვისთვის</a>}
            <MuseumGenerationStatus sourceReference={product.product_id} draftId={active?.draft_id} />
          </div>}
          <div className="verification-block"><button className="verification-link" disabled={saving} onClick={() => setPanel("verify")}><ShieldCheck size={19} /><span>ვერიფიკაცია შეკვეთამდე<small>ფასი და წარმოება ჯერ დაუდასტურებელია</small></span><MoveUpRight size={16} /></button></div>
          <div className="detail-links"><button disabled={saving} onClick={() => setPanel("exhibit")}><Layers3 size={16} />წყარო და ინფორმაცია</button><button disabled={saving} onClick={() => openFit(index===0?"eyewear":"none")}><Fingerprint size={16} />{index === 0 ? "ავატარზე მორგება" : "Fit to Me"}</button><button disabled={saving} onClick={() => setPanel("passport")}><BookOpen size={16} />პასპორტი</button></div>
          {notice && <p role="status" className="notice">{notice}</p>}
          <div className="identity-line"><span>{active ? "მონახაზის ID · EXPERIENCE" : "კონცეფციის Reference ID"}</span><code>{active?.draft_id ?? product.product_id}</code>{active && <span>CORE Product ID ჯერ არ მინიჭებულა.</span>}</div>
        </aside>
      </section>
      </ExhibitSurface>}
      <section id="visual-exhibition" className="visual-exhibition" aria-label="MERGE-ის ვიზუალური კოლექციები">
        <div className="visual-heading"><div><span className="eyebrow">THE MERGE UNIVERSE</span><h2>სამყარო, რომელიც შენია.</h2></div><span className="visual-count">{String(visualPhotos.length).padStart(2,"0")} VISUAL STUDIES</span></div>
        <AscensionExhibits signedIn={signedIn} disabled={saving}/>
        <div className="visual-filters" aria-label="ვიზუალების კატეგორია">{(["ყველა", "კოლექციები", "სამყარო", "მასალები"] as const).map(category => <button key={category} aria-pressed={visualCategory === category} onClick={() => setVisualCategory(category)}>{category}</button>)}</div>
        <div className="visual-grid">{visualPhotos.filter(photo => visualCategory === "ყველა" || photo.category === visualCategory).map(photo => <article key={photo.image} className="visual-exhibit"><button className="visual-preview" disabled={saving} aria-label={`${photo.title} — ორიგინალი ფოტოს გახსნა`} onClick={() => { setReferenceImage(photo.image); setPanel("photos"); }}><div className="visual-image"><img src={ascensionPresentationImage(photo.image)} alt={photo.alt} loading="lazy" style={{ objectPosition: photo.position }} /><span className="visual-expand"><Expand size={17} /></span></div></button><div className="visual-caption"><span>{photo.kicker}</span><h3>{photo.title}</h3><span className="visual-label">კონცეფცია</span>{visualDestination(photo.image)&&<button className="visual-destination" disabled={saving} onClick={()=>openVisualSpace(photo.image)}>{visualDestination(photo.image)!.label}<ArrowRight size={15}/></button>}</div></article>)}</div>
      </section>
      <footer className="museum-footer"><div><CompanyMark decorative /><span>MERGE ⭐ STARS</span></div><span>YOUR BRAND. YOUR CRAFT. YOUR LEGACY.</span><a href="/transparency">გამჭვირვალობა</a><button disabled={saving} onClick={() => setPanel("governance")}>მართვის წესები</button><button disabled={saving} onClick={() => setPanel("system")}>სისტემის სტატუსი</button></footer>
    </>}
    <Dialog open={panel !== "none"} onOpenChange={open => { if (!open) setPanel("none"); }}><DialogContent visual={museumPanelWindow(panel)} windowChrome={panel==='world'?'compact':'full'} className={panel==='world'?'museum-dialog world-dialog':panel === "personal-ai" ? "museum-dialog merge-ai-dialog" : panel === "photos" || panel === "detail" ? "museum-dialog photo-dialog" : "museum-dialog"} showCloseButton={false} onOpenAutoFocus={() => { const element = document.activeElement; if (element instanceof HTMLElement && !element.closest('[data-slot="dialog-content"]')) returnFocus.current = element; }} onCloseAutoFocus={event => { event.preventDefault(); if (returnFocus.current?.isConnected) returnFocus.current.focus(); returnFocus.current = null; }}><button className="dialog-close" aria-label={panel==='world'?'Close unified Museum workspace':panel === "personal-ai" ? "Close MERGE AI and return to the Museum" : "დახურვა"} onClick={() => setPanel("none")}>×</button>
      <DialogTitle className={panel==='world'?'sr-only':undefined}>{panel !== "none" ? titles[panel] : ""}</DialogTitle><DialogDescription className={panel==='world'?'sr-only':undefined}>{panel !== "none" ? descriptions[panel] : ""}</DialogDescription>
      {panel==='world'&&<MuseumWorldWorkspace signedIn={signedIn} key={sessionScope??String(signedIn)} memory={worldMemory} onAction={worldAction} onHouse={worldHouse} onClose={()=>setPanel('none')}/>}
      {panel!=='world'&&panel!=='none'&&worldReturn.current&&<button className="text-link" onClick={()=>openWorld(worldMemory.current.tab)}><ArrowLeft size={16}/>Return to my Brand workspace</button>}
      {panel === "journey" && <><ContextPhotoSequence context="journey" onOriginal={showOriginal}/><VipJourney onEnterMuseum={() => { setPanel("none"); if (!entered) enter(); }} /></>}
      {panel === "commercial" && <CommercialReadiness />}
      {panel === "exhibit" && <ExhibitDossier product={product} draft={active} preview={preview} custom={mode === "custom"} onOriginal={() => { setReferenceImage(product.image); setPanel("photos"); }} onVerification={() => setPanel("verify")} onFit={() => setPanel("fit")} />}
      {panel === "point" && view.kind === "house" && <MuseumPointDossier view={view} sceneId={sceneId} onOriginal={() => { setReferenceImage(museumScenes[sceneId].image); setPanel("photos"); }} />}
      {panel === "pulse" && <MuseumPulse pointId={view.point_id} onCoinRules={() => setPanel("entry-law")} />}
      {panel === "vitrine" && <CoreCatalogBrowser presentation="vitrine" onPlace={placeCoreExhibit} />}
      {panel === "children" && <MuseumChildren />}
      {panel === "registration" && <><button className="button outline" onClick={()=>openFit("fashion")}><Fingerprint size={17}/>ჩემი ზომები — შეკვეთისთვის მომზადება</button><RegistrationPreparation onPayment={() => setPanel("entry-law")} /></>}
      {panel === "entry-law" && <><MaterialReferenceLibrary key={referenceImage} initialImage={referenceImage} onOriginal={image=>{setReferenceImage(image);setPanel('photos');}}/><EntryPaymentLaw /></>}
      {panel === "personal-ai" && <PersonalMergeAI initialSection={managerSection} onStage={openStoryboardStep} onOriginal={showOriginal} key={sessionScope ?? String(signedIn)} memory={managerMemory} signedIn={signedIn} onIdentity={()=>setPanel("registration")} onOrders={()=>setPanel("commercial")}/> }
      {panel==='photos'&&visualDestination(referenceImage)&&<button className="photo-destination-action" disabled={!entered||saving} onClick={()=>openVisualSpace(referenceImage)}>{visualDestination(referenceImage)!.label}<ArrowRight size={17}/></button>}
      {panel === "detail" && inspection && <><MuseumImageDetail key={inspection.id} image={inspection.image} title={inspection.title} crop={inspection.crop} /><button className="text-link" onClick={() => { setReferenceImage(inspection.image); setPanel("photos"); }}><Expand size={16}/>წყაროს სრული ფოტოს ნახვა</button></>}
      {panel === "photos" && <><div className="photo-reader"><button className="photo-arrow" aria-label="წინა ორიგინალი ფოტო" onClick={() => moveReference(-1)}><ArrowLeft size={19} /></button><div aria-live="polite"><strong>{reference?.title}</strong><span>{String(referenceIndex + 1).padStart(2,"0")} / {String(sourcePhotos.length).padStart(2,"0")}</span></div><button className="photo-arrow" aria-label="შემდეგი ორიგინალი ფოტო" onClick={() => moveReference(1)}><ArrowRight size={19} /></button></div><MuseumImageDetail key={referenceImage} image={referenceImage} title={reference?.alt ?? "MERGE-ის ორიგინალი კონცეპტუალური ვიზუალი"} /><div className="photo-navigation">{sourcePhotos.map(photo => <button key={photo.image} aria-pressed={photo.image === referenceImage} className={photo.image === referenceImage ? "chosen" : ""} onClick={() => setReferenceImage(photo.image)}>{photo.title}</button>)}</div></>}
      {panel === "collection" && <><ContextPhotoSequence context="collection" onOriginal={showOriginal}/>
        <MyMuseumLibrary key={sessionScope??String(signedIn)} signedIn={signedIn} onFit={category=>openFit(category)}/><details><summary>Original museum drafts and CORE collections</summary>
        {!signedIn ? <a className="button light" href="/login?return_to=%2F" target="_top">შედი პირად კოლექციაში</a> : loading ? <p role="status">კოლექცია იტვირთება…</p> : loadError ? <div className="empty-collection"><p role="alert">{loadError}</p><button className="button outline" onClick={() => void load()}><RefreshCw size={16} />ხელახლა ცდა</button></div> : drafts.length === 0 ? <div className="empty-collection"><Layers3 size={32} /><p>კოლექცია ჯერ ცარიელია.<br />აირჩიე ნივთი და შეინახე შენი დიზაინი.</p></div> : <div className="version-list">{drafts.map(draft => { const source = catalog.find(item => item.product_id === draft.source_reference_id); return <button key={draft.draft_id} className="version-item" onClick={() => openDraft(draft)}><img src={source?.image} alt="" /><div><strong>{draft.name}</strong><span>CONCEPT · {materials[draft.config.material]}</span><span>{new Date(draft.created_at).toLocaleDateString("ka-GE",{timeZone:"Asia/Tbilisi"})}</span></div><span>გახსნა</span></button>; })}</div>}
        {active && <div className="lineage"><h3>მონახაზის წყარო და ისტორია</h3><dl><div><dt>Root Reference</dt><dd>{active.root_reference_id}</dd></div><div><dt>Source Reference</dt><dd>{active.source_reference_id}</dd></div><div><dt>Parent Draft</dt><dd>{active.parent_draft_id ?? "პირველი მონახაზი"}</dd></div><div><dt>Draft ID</dt><dd>{active.draft_id}</dd></div><div><dt>CORE Product / House</dt><dd>ჯერ არ მინიჭებულა</dd></div></dl></div>}
        <p className="fine-note">მონახაზი ინახება ანგარიშის დაცულ სივრცეში. პროდუქტის რეგისტრაცია, ბრენდის უფლებები და ვერიფიკაცია CORE-ს ეკუთვნის.</p>
        <CoreCatalogBrowser /></details>
      </>}
      {panel === "system" && <SystemControlRoom key={sessionScope??String(signedIn)}/>}
      {panel === 'founder-studio' && <FounderStudio onAi={()=>setPanel('personal-ai')} onDesigns={()=>{setPanel('collection');void load();}} onSystem={()=>setPanel('system')} onOriginal={()=>{setReferenceImage('/museum-v78/assets/founder-office-study.png');setPanel('photos');}}/>}
      {panel === "governance" && <><div className="system-layers"><div><span>FOUNDING 13 · 1 + 12</span><p>1 დამფუძნებელი Architecture Owner + 12 დამოუკიდებელი Founding Brand House Owner. ეს არის დამფუძნებელი სტრუქტურა და არა 13 თანამშრომელი.</p></div><div><span>დამფუძნებელი · გიორგი რევაზიშვილი</span><p>ხედვა, ბიზნეს კანონები, ბრენდი, პროდუქტის წესები, კომერციული პოლიტიკა და საბოლოო დამტკიცება.</p></div><div><span>MERGE AI · სისტემური არქიტექტურა</span><p>არქიტექტურა, მონაცემთა მოდელები, UX/UI, უსაფრთხოება და MASTER CORE-თან შესაბამისობის შემოწმება.</p></div><div><span>დეველოპერები · ოფიციალური იმპლემენტაცია</span><p>დამტკიცებული წესების ზუსტად განხორციელება, ინტეგრაცია, ტესტირება და მოვლა.</p></div></div><p className="notice">კრიტიკული კანონის ცვლილება ძალაში შედის მხოლოდ დამფუძნებლის დამტკიცებით. ცვლილება არ ხდება ჩუმად.</p><div className="connection-note"><ShieldCheck size={21} /><p>BUILD EXACTLY. VERIFY EVERYTHING. PRESERVE THE CORE.</p></div></>}
      {panel === "verify" && <><div className="review-product"><strong>{active?.name ?? product.title}</strong><code>{active?.draft_id ?? product.product_id}</code><span className="status">CONCEPT · ვერიფიკაცია არ არსებობს</span></div><div className="evidence-list">{evidence.map(item => <div key={item}><LockKeyhole size={16} /><span>{item}</span><span>არ არსებობს</span></div>)}</div><p className="notice">შეთავაზების მოთხოვნა ჯერ არ გაგზავნილა. CORE დაუკავშირებელია. ჩეკბოქსი ან მომხმარებლის მოქმედება ვერ შექმნის VERIFIED სტატუსს.</p><h3 className="workflow-title">შეკვეთის დასადასტურებელი გზა</h3><ol className="order-steps">{workflow.map(([title,description],n) => <li key={title}><span>{String(n+1).padStart(2,"0")}</span><div><strong>{title}</strong><small>{description}</small></div></li>)}</ol><button className="button outline" disabled>შეკვეთა ჯერ მიუწვდომელია</button></>}
      {panel === "passport" && <><div className="review-product"><strong>{active?.name ?? product.title}</strong><span className="status">NOT YET IMPLEMENTED</span></div><p>ფიზიკური პროდუქტი, მწარმოებელი, QC/XRF, მფლობელობა და QR ამ მონახაზისთვის არ არის დადასტურებული.</p><p className="notice">პასპორტის ან სერტიფიკატის შექმნა დაბლოკილია მტკიცებულებების მიღებამდე. კონცეპტუალური სურათი არ არის წარმოების ან ხარისხის მტკიცებულება.</p></>}
      {panel === "fit" && <><ContextPhotoSequence context="fit" onOriginal={showOriginal}/><MeasurementMap value={measurements} onChange={setMeasurements} category={fitCategory} onCategory={setFitCategory} signedIn={signedIn}/></>}
    </DialogContent></Dialog>
    {fitOpen&&<Dialog open onOpenChange={setFitOpen}><DialogContent visual="fit" className="museum-dialog fit-map-dialog"><DialogTitle>My Measurements · Faceless Avatar</DialogTitle><DialogDescription>Your measurement preparation and existing CORE Fit Profile connection.</DialogDescription>{worldReturn.current&&<button className="text-link" onClick={()=>{setFitOpen(false);openWorld(worldMemory.current.tab);}}><ArrowLeft size={16}/>Return to my Brand workspace</button>}<ContextPhotoSequence context="fit" onOriginal={showOriginal}/><MeasurementMap value={measurements} onChange={setMeasurements} category={fitCategory} onCategory={setFitCategory} initialField={fitField} signedIn={signedIn}/></DialogContent></Dialog>}
  </main>;
}
