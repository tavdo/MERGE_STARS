"use client";

import { useCoreRead } from "@/museum-v78/components/core-context";
import { coreReadMessages } from "@/museum-v78/lib/core-read-state";
import type { CityHouseId } from "@/museum-v78/lib/megapolis-domain";
import { ArrowRight, Building2, RefreshCw, ShieldCheck } from "lucide-react";

type BrandHouseProjection = {
  house_id: string;
  title: string;
  owner_name?: string | null;
  status: string;
  catalog_count?: number;
  balances?: { pending?: number; available?: number; reserved?: number; paid?: number; negative_recovery?: number };
  sections?: string[];
};

export function BrandHouseBrowser({ houseId, title }: { houseId: CityHouseId; title: string }) {
  const { data, error, retry } = useCoreRead<BrandHouseProjection>("/api/core/brand-house");
  return <section className="brand-house-browser" aria-label={`${title} owner Brand House browser`} data-house-id={houseId}>
    <header><div><span className="eyebrow">PERSONAL BRAND HOUSE · OWNER BROWSER</span><h3><Building2 size={18}/> {title}</h3></div><span className="brand-house-lock"><ShieldCheck size={15}/> CORE READ</span></header>
    <p className="brand-house-rule">პერსონალური Brand House იხსნება მხოლოდ მას შემდეგ, რაც დამკვეთის პერსონალიზებული ვერსია ავტორიტეტულ CORE-ში წარმატებით შეინახება. აქ არ იქმნება ადგილობრივი House ID, კატალოგი ან შემოსავალი.</p>
    {!data ? <div className="brand-house-blocker" role="status"><strong>{error ? (error === "CORE_DEPENDENCY_REQUIRED" ? "CORE_DEPENDENCY_REQUIRED" : error) : "CORE_READ_PENDING"}</strong><p>{error ? coreReadMessages[error] : "მფლობელის House-ის უფლებები მოწმდება MERGE CORE-ში…"}</p><button className="text-link" onClick={retry}><RefreshCw size={14}/> ხელახლა ცდა</button></div> : <>
      <dl className="brand-house-facts"><div><dt>House ID</dt><dd>{data.house_id}</dd></div><div><dt>სტატუსი</dt><dd>{data.status}</dd></div><div><dt>კატალოგი</dt><dd>{data.catalog_count ?? "—"}</dd></div></dl>
      <nav className="brand-house-sections" aria-label="Brand House sections">{(data.sections ?? ["ARCHITECTURE", "CATALOG", "HISTORY", "ORDERS", "PASSPORT", "ATTRIBUTION LEDGER"]).map(section => <button key={section}><span>{section}</span><ArrowRight size={14}/></button>)}</nav>
      <div className="brand-house-balances"><span className="eyebrow">SETTLED CORE BALANCES ONLY</span>{Object.entries({ PENDING: data.balances?.pending, AVAILABLE: data.balances?.available, RESERVED: data.balances?.reserved, PAID: data.balances?.paid, "NEGATIVE / RECOVERY": data.balances?.negative_recovery }).map(([label, value]) => <div key={label}><span>{label}</span><strong>{typeof value === "number" ? value.toLocaleString("en-US", { style: "currency", currency: "USD" }) : "NOT_SUPPLIED_BY_CORE"}</strong></div>)}</div>
    </>}
    <p className="fine-note">შემოსავალი არ იგულისხმება და არ ყალბდება: მხოლოდ დადასტურებული, settlement-გავლილი CORE ჩანაწერი შეიძლება გამოჩნდეს აქ. თანხები, QR ატრიბუცია, შეკვეთა და Passport MERGE CORE-ის საკუთრებაა.</p>
  </section>;
}
