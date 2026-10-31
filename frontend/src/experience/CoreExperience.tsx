import { lazy, Suspense, useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  catalogApi,
  catalogItemPublicImageUrl,
  catalogItemPublicModelUrl,
} from "@/features/catalog/api/catalog.api";
import { brandApi } from "@/features/brand/api/brand.api";
import { ordersApi } from "@/features/orders/api/orders.api";
import { notificationsApi } from "@/features/notifications/api/notifications.api";
import { metalsApi } from "@/features/coins/api/metals.api";
import { coreApi, type Measurements } from "./core.api";
import type { Language } from "./content";
import QrCodeImage from "@/components/QrCodeImage";

const copy = (language: Language) => (ka: string, en: string) =>
  language === "ka" ? ka : en;
const MuseumModelViewer = lazy(() => import('@/components/MuseumModelViewer'));
function LiveMaterialQuote({ language }: { language: Language }) {
  const t = copy(language),
    [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const query = useQuery({
    queryKey: ["core-material-quotes"],
    queryFn: () => metalsApi.getLive().then((r) => r.data.data),
    refetchInterval: 30000,
    retry: false,
  });
  const prices = (query.data || []).filter(
    (p) =>
      p.source &&
      Date.parse(p.validUntil) > now &&
      Number.isFinite(p.pricePerKgUsd) &&
      p.pricePerKgUsd > 0,
  );
  return (
    <details>
      <summary>
        {t("მასალის მიმდინარე კურსი", "Current material quote")}
      </summary>
      {!prices.length ? (
        <p>
          {t("მიმდინარე კურსი მიუწვდომელია.", "Current quote unavailable.")}
        </p>
      ) : (
        prices.map((p) => (
          <div key={p.metal}>
            <p>
              {p.metal} · USD {p.pricePerKgUsd.toFixed(2)} / kg
            </p>
            <small>
              {p.source} · {p.sourceTimestamp}
            </small>
          </div>
        ))
      )}
      <p>
        {t(
          "ეს მასალის კურსია. პროდუქტის ფასი და საწარმოო წონა ჯერ გამოსათვლელია.",
          "This is a material quote. Product price and manufacturing weight remain unavailable.",
        )}
      </p>
    </details>
  );
}
function SignIn({ language }: { language: Language }) {
  const t = copy(language);
  const location = useLocation();
  return (
    <div className="cx-notice">
      <p>
        {t(
          "პირადი სივრცისთვის შედი შენს ანგარიშში.",
          "Sign in to open your private world.",
        )}
      </p>
      <Link
        className="mx-button"
        to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`}
      >
        {t("შესვლა / რეგისტრაცია", "Sign in / register")} ↗
      </Link>
    </div>
  );
}
function QueryState({
  loading,
  error,
  language,
}: {
  loading: boolean;
  error: boolean;
  language: Language;
}) {
  const t = copy(language);
  return loading ? (
    <p role="status">{t("იტვირთება…", "Loading…")}</p>
  ) : error ? (
    <p role="alert" className="cx-notice">
      {t(
        "მონაცემები ვერ ჩაიტვირთა. სცადე ხელახლა ან მოგვიანებით.",
        "Data could not load. Retry or check back later.",
      )}
    </p>
  ) : null;
}
export function CoreGallery({ language }: { language: Language }) {
  const t = copy(language);
  const query = useQuery({
    queryKey: ["museum-core-collections"],
    queryFn: () => catalogApi.listPublic().then((r) => r.data.data),
    retry: false,
  });
  return (
    <section className="cx-gallery">
      <span className="lx-eyebrow">LIVING MUSEUM / BRAND COLLECTIONS</span>
      <h2>{t("Brand House-ების კოლექციები", "Brand House collections")}</h2>
      <QueryState
        language={language}
        loading={query.isLoading}
        error={query.isError}
      />
      {query.isError && (
        <button
          className="mx-button mx-secondary"
          onClick={() => query.refetch()}
        >
          {t("ხელახლა ცდა", "Retry")}
        </button>
      )}
      {query.data?.length === 0 && (
        <p>
          {t(
            "საჯარო კოლექცია ჯერ არ გამოქვეყნებულა. ქვემოთ ვიზუალური კონცეფციებია.",
            "No public collections have been published yet. Visual concepts follow below.",
          )}
        </p>
      )}
      <div className="cx-rooms">
        {query.data?.map((room) => (
          <Link
            to={`/museum?hall=${encodeURIComponent(room.slug)}`}
            key={room.id}
          >
            <span>{room.brandName || room.ownerName}</span>
            <h3>{room.title}</h3>
            <p>{room.description}</p>
            <span>{t("შედი კოლექციაში", "Enter collection")} ↗</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
export function CoreSaved({ language }: { language: Language }) {
  const t = copy(language),
    token = useAuthStore((s) => s.accessToken);
  const query = useQuery({
    queryKey: ["core-saved", token],
    queryFn: coreApi.saved,
    enabled: !!token,
    retry: false,
  });
  return (
    <div className="mx-page">
      <h1>{t("ჩემი შენახული ნივთები", "My saved objects")}</h1>
      {!token ? (
        <SignIn language={language} />
      ) : (
        <>
          <QueryState
            language={language}
            loading={query.isLoading}
            error={query.isError}
          />
          {query.data?.length === 0 && (
            <p>{t("შენახული ნივთი ჯერ არ არის.", "No saved objects yet.")}</p>
          )}
          <div className="cx-rooms">
            {query.data?.map((item) => (
              <Link
                key={item.id}
                to={
                  item.visibility === "PRIVATE"
                    ? `/dashboard/collections/${item.collectionId}`
                    : `/object/${encodeURIComponent(item.collectionSlug)}/${item.id}`
                }
              >
                <h2>{item.title}</h2>
                <span>
                  {t("წყარო-პროდუქტის ნახვა", "View source product")} ↗
                </span>
              </Link>
            ))}
          </div>
        </>
      )}
      <Link to="/museum">{t("მუზეუმი", "Museum")} ↗</Link>
    </div>
  );
}
export function CoreHouses({ language }: { language: Language }) {
  const t = copy(language);
  const query = useQuery({
    queryKey: ["public-core-houses"],
    queryFn: () => brandApi.listPublic().then((r) => r.data.data),
    retry: false,
  });
  return (
    <section className="mx-page">
      <span className="lx-eyebrow">BRAND HOUSES / PEOPLE & COLLECTIONS</span>
      <h1>
        {t(
          "საკუთარი სივრცე. საერთო სამყარო.",
          "Personal houses. A shared world.",
        )}
      </h1>
      <Link className="mx-button" to="/my-world">
        {t("ჩემი Brand House", "My Brand House")} ↗
      </Link>
      <QueryState
        language={language}
        loading={query.isLoading}
        error={query.isError}
      />
      {query.data?.length === 0 && (
        <p>
          {t(
            "საჯარო Brand House ჯერ არ არის გამოქვეყნებული.",
            "No public Brand House has been published yet.",
          )}
        </p>
      )}
      <div className="cx-rooms">
        {query.data?.map((house) => (
          <Link
            key={house.mergeId}
            to={
              house.brandLineId
                ? `/b/${encodeURIComponent(house.brandLineId)}`
                : `/u/${encodeURIComponent(house.mergeId)}`
            }
          >
            <span>{house.ownerName}</span>
            <h2>{house.name}</h2>
            <p>{house.description}</p>
            <span>{t("აღმოაჩინე სახლი", "Discover the house")} ↗</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
export function CorePassport({ language }: { language: Language }) {
  const t = copy(language),
    [params] = useSearchParams(),
    id = params.get("product"),
    slug = params.get("slug");
  const query = useQuery({
    queryKey: ["core-truth", id],
    queryFn: () => coreApi.product(id!),
    enabled: !!id,
    retry: false,
  });
  const source =
    slug && id
      ? `${window.location.origin}/object/${encodeURIComponent(slug)}/${encodeURIComponent(id)}`
      : null;
  return (
    <div className="mx-page">
      <span className="lx-eyebrow">PRODUCT RECORD / PASSPORT</span>
      <h1>{t("ნივთის ისტორია", "Object history")}</h1>
      <QueryState
        language={language}
        loading={query.isLoading}
        error={query.isError}
      />
      <div className="cx-notice">
        <p>
          {t(
            "დადასტურებული პროდუქტის პასპორტი ჯერ მიუწვდომელია. QC, მწარმოებელი და საწარმოო სერტიფიკაცია არ არის მოწოდებული.",
            "Verified product passport unavailable. QC, manufacturer and production certification have not been supplied.",
          )}
        </p>
        {query.data && (
          <>
            <p>Product: {id}</p>
            <p>Version: {query.data.sourceVersion}</p>
            <p>CONCEPT · {t("პასპორტი არ შექმნილა", "Passport not created")}</p>
            {source && (
              <>
                <QrCodeImage
                  value={source}
                  alt={t("წყარო-პროდუქტის ბმულის QR", "Source product link QR")}
                />
                <p>
                  {t(
                    "QR ხსნის წყარო-პროდუქტს; წარმოებასა და გადახდას არ ადასტურებს.",
                    "QR opens the source product; it does not confirm production or payment.",
                  )}
                </p>
                <Link
                  to={`/object/${encodeURIComponent(slug!)}/${encodeURIComponent(id!)}`}
                >
                  {t("წყარო-პროდუქტთან დაბრუნება", "Return to source product")}{" "}
                  ↗
                </Link>
              </>
            )}
          </>
        )}
      </div>
      <Link to="/track">{t("ჩემი შეკვეთები", "My orders")} ↗</Link>
    </div>
  );
}
export function CoreCollection({ language }: { language: Language }) {
  const t = copy(language),
    { slug = "" } = useParams();
  const query = useQuery({
    queryKey: ["core-collection", slug],
    queryFn: () => catalogApi.getPublic(slug).then((r) => r.data.data),
    retry: false,
  });
  return (
    <div className="mx-page">
      <Link to="/museum">← {t("მუზეუმი", "Museum")}</Link>
      <h1>{query.data?.title || t("კოლექცია", "Collection")}</h1>
      <QueryState
        language={language}
        loading={query.isLoading}
        error={query.isError}
      />
      <div className="cx-rooms">
        {query.data?.items
          .filter((i) => i.status === "ACTIVE")
          .map((item) => (
            <Link
              key={item.id}
              to={`/object/${encodeURIComponent(slug)}/${item.id}`}
            >
              <span>CONCEPT</span>
              {catalogItemPublicImageUrl(item) && (
                <img
                  src={catalogItemPublicImageUrl(item)!}
                  alt={item.title}
                  loading="lazy"
                />
              )}
              <h2>{item.title}</h2>
              <span>{t("ნივთის ნახვა", "View object")} ↗</span>
            </Link>
          ))}
      </div>
      {query.data?.items.length === 0 && (
        <p>
          {t(
            "ამ კოლექციაში ნივთი ჯერ არ არის.",
            "No objects in this collection yet.",
          )}
        </p>
      )}
    </div>
  );
}
export function CoreObject({ language, museumSlug, museumId }: { language: Language; museumSlug?: string; museumId?: string }) {
  const t = copy(language),
    route = useParams(),
    slug = museumSlug ?? route.slug ?? "",
    id = museumId ?? route.id ?? "",
    token = useAuthStore((s) => s.accessToken),
    qc = useQueryClient();
  const [material, setMaterial] = useState(""),
    [initials, setInitials] = useState(""),
    [notes, setNotes] = useState(""),
    [notice, setNotice] = useState("");
  const [showFit, setShowFit] = useState(false);
  const [showPassport, setShowPassport] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showModel, setShowModel] = useState(false);
  const [savedVersion, setSavedVersion] = useState<string | null>(null);
  const collection = useQuery({
    queryKey: ["core-collection", slug],
    queryFn: () => catalogApi.getPublic(slug).then((r) => r.data.data),
    retry: false,
  });
  const truth = useQuery({
    queryKey: ["core-truth", id],
    queryFn: () => coreApi.product(id),
    retry: false,
  });
  const interaction = useQuery({
    queryKey: ["core-interaction", id, token],
    queryFn: () => coreApi.interaction(id),
    enabled: !!token,
    retry: false,
  });
  const fit = useQuery({
    queryKey: ["core-fit", token],
    queryFn: coreApi.fit,
    enabled: !!token,
    retry: false,
  });
  const action = useMutation({
    mutationFn: ({
      kind,
      active,
    }: {
      kind: "LIKE" | "SAVE";
      active: boolean;
    }) => coreApi.interact(id, kind, active),
    onSuccess: (data) => {
      qc.setQueryData(["core-interaction", id, token], data);
      qc.invalidateQueries({ queryKey: ["core-truth", id] });
    },
  });
  const create = useMutation({
    mutationFn: () =>
      coreApi.createDesign({ sourceProductId: id, material, initials, notes }),
    onSuccess: (saved) => {
      setSavedVersion(saved.id);
      requestReview.reset();
      setNotice(
        t(
          "მონახაზი შენს ანგარიშში შენახულია. წყარო არ შეცვლილა.",
          "Draft saved to your account. Source preserved.",
        ),
      );
      qc.invalidateQueries({ queryKey: ["core-designs"] });
      qc.invalidateQueries({ queryKey: ["personal-museum"] });
      qc.invalidateQueries({ queryKey: ["museum-own-proposals"] });
    },
  });
  const requestReview = useMutation({ mutationFn: () => coreApi.verify(savedVersion!), onSuccess: () => { setNotice(t("ვერსია გადაგზავნილია შემოწმებისთვის. ეს დამტკიცება არ არის.", "Version submitted for review. This is not approval.")); qc.invalidateQueries({queryKey:["core-designs"]}); } });
  const items =
      collection.data?.items.filter((i) => i.status === "ACTIVE") || [],
    item = items.find((i) => i.id === id),
    index = items.findIndex((i) => i.id === id);
  return (
    <div className="mx-page cx-object">
      <Link to={`/museum?hall=${encodeURIComponent(slug)}`}>
        ← {collection.data?.title || t("კოლექცია", "Collection")}
      </Link>
      <QueryState
        language={language}
        loading={collection.isLoading || truth.isLoading}
        error={collection.isError || truth.isError}
      />
      {collection.data && !item && (
        <p role="alert">{t("ნივთი მიუწვდომელია.", "Object unavailable.")}</p>
      )}
      {item && (
        <>
          <div className="cx-object-nav">
            {index > 0 ? (
              <Link
                to={`/museum?hall=${encodeURIComponent(slug)}&object=${items[index - 1].id}`}
              >
                ← {t("წინა", "Previous")}
              </Link>
            ) : (
              <span />
            )}
            <span>CONCEPT</span>
            {index < items.length - 1 ? (
              <Link
                to={`/museum?hall=${encodeURIComponent(slug)}&object=${items[index + 1].id}`}
              >
                {t("შემდეგი", "Next")} →
              </Link>
            ) : (
              <span />
            )}
          </div>
          <div className="cx-object-layout">
            <div className="cx-object-image">
              {showModel && catalogItemPublicModelUrl(item) ? <Suspense fallback={<p role="status">{t("3D იტვირთება…", "Loading 3D…")}</p>}><MuseumModelViewer key={id} url={catalogItemPublicModelUrl(item)!} unavailable={t("3D მოდელი ვერ ჩაიტვირთა. წყაროს ფაილი კვლავ ხელმისაწვდომია ქვემოთ.", "3D model could not load. Source file remains linked below.")} /></Suspense> : catalogItemPublicImageUrl(item) ? (
                <img src={catalogItemPublicImageUrl(item)!} alt={item.title} />
              ) : (
                <p>
                  {t("გამოსახულება არ არის მოწოდებული.", "No image supplied.")}
                </p>
              )}
              {catalogItemPublicModelUrl(item) && (
                <>
                {['glb','gltf'].includes(item.model3dFormat?.toLowerCase() || '') && <button className="mx-button mx-secondary" onClick={() => setShowModel(v => !v)}>{showModel ? t("გამოსახულება", "Image") : t("3D დათვალიერება", "Explore 3D")}</button>}
                <a
                  href={catalogItemPublicModelUrl(item)!}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("3D ფაილის ნახვა", "View 3D file")} ↗
                </a>
                </>
              )}
            </div>
            <div>
              <h1>{item.title}</h1>
              <p>{item.description}</p>
              <div className="cx-actions">
                <button type="button" aria-expanded={showFit} onClick={() => setShowFit(v => !v)}>
                  {t("მოირგე ჩემზე", "Fit to me")}
                </button>
                {token ? (
                  <>
                    <button
                      disabled={action.isPending || !interaction.data}
                      onClick={() =>
                        action.mutate({
                          kind: "LIKE",
                          active: !interaction.data?.liked,
                        })
                      }
                    >
                      {interaction.data?.liked ? "♥" : "♡"}{" "}
                      {t("მომწონს", "Like")} {truth.data?.likes ?? "—"}
                    </button>
                    <button
                      disabled={action.isPending || !interaction.data}
                      onClick={() =>
                        action.mutate({
                          kind: "SAVE",
                          active: !interaction.data?.saved,
                        })
                      }
                    >
                      {interaction.data?.saved
                        ? t("შენახულია", "Saved")
                        : t("შენახვა", "Save")}
                    </button>
                  </>
                ) : (
                  <Link
                    to={`/login?next=${encodeURIComponent(`/object/${slug}/${id}`)}`}
                  >
                    {t("შესვლა Like / Save-სთვის", "Sign in to like / save")}
                  </Link>
                )}
                <button type="button" aria-expanded={showPassport} onClick={() => setShowPassport(v => !v)}>
                  QR / Passport
                </button>
                <button type="button" aria-expanded={showHistory} onClick={() => setShowHistory(v => !v)}>{t("წყარო / ისტორია", "Source / history")}</button>
                <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(`${window.location.origin}/museum?hall=${encodeURIComponent(slug)}&object=${id}`); setNotice(t("ობიექტის ბმული დაკოპირებულია.", "Object link copied.")); } catch { setNotice(t("ბმულის კოპირება ვერ მოხერხდა.", "Could not copy link.")); } }}>{t("გაზიარება", "Share")}</button>
              </div>
              {showFit && <section className="mo-panel"><h2>FIT TO ME</h2>{fit.isLoading ? <p>{t("იტვირთება…", "Loading…")}</p> : fit.data ? <><p>{t("ხელით შეყვანილი ზომების პროფილი. ამ ობიექტისთვის მორგების დამტკიცებული გეომეტრიული წესი ჯერ მიუწვდომელია; წყარო არ შეცვლილა.", "Manual measurements profile. An approved geometry fit rule for this object is unavailable; source preserved.")}</p><dl>{Object.entries(fit.data.measurements).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value} cm</dd></div>)}</dl><p>MANUAL_UNVERIFIED · {fit.data.updatedAt}</p></> : <p>{t("ზომების პროფილი მიუწვდომელია.", "Fit profile unavailable.")}</p>}<Link to={`/fit-profile?product=${id}&slug=${encodeURIComponent(slug)}`}>{t("ზომების პროფილის რედაქტირება", "Edit measurements profile")} ↗</Link></section>}
              {showPassport && <section className="mo-panel"><h2>QR / Passport</h2><p>{t("პასპორტი ჯერ არ გაცემულა. ეს QR წყარო-ობიექტის ბმულია და წარმოებას ან QC-ს არ ადასტურებს.", "Passport not yet issued. This QR links to the source object and does not confirm production or QC.")}</p><QrCodeImage value={`${window.location.origin}/museum?hall=${encodeURIComponent(slug)}&object=${id}`} alt={t("მუზეუმის ობიექტის ბმულის QR", "Museum object link QR")} /></section>}
              {showHistory && <section className="mo-panel"><h2>{t("წყაროს ჩანაწერი", "Source record")}</h2><dl><div><dt>Product ID</dt><dd>{id}</dd></div><div><dt>Version</dt><dd>{truth.data?.sourceVersion || "—"}</dd></div><div><dt>{t("კოლექცია", "Collection")}</dt><dd>{collection.data?.title}</dd></div><div><dt>{t("შემქმნელი", "Creator")}</dt><dd>{collection.data?.ownerName || "—"}</dd></div><div><dt>Brand House</dt><dd>{collection.data?.brandName || "—"}</dd></div><div><dt>Brand Line</dt><dd>{collection.data?.brandLineId || "—"}</dd></div><div><dt>{t("მასალის ჩანაწერი", "Material record")}</dt><dd>{item.metalType || "—"}</dd></div><div><dt>{t("შექმნილია", "Created")}</dt><dd>{item.createdAt}</dd></div></dl><p>{t("ეს წყაროს მიმდინარე ჩანაწერია. სრული revision ისტორია და უფლებების მტკიცებულება ჯერ მიუწვდომელია.", "This is the current source record. Full revision history and rights evidence are unavailable.")}</p></section>}
              {(action.isError || interaction.isError) && (
                <p role="alert">
                  {t(
                    "მოქმედება ვერ შესრულდა.",
                    "Action unavailable. Retry later.",
                  )}
                </p>
              )}
              <div className="cx-notice">
                <p>
                  {fit.data
                    ? t(
                        "ხელით შეყვანილი ზომები ხელმისაწვდომია; მორგება გადამოწმებული არ არის.",
                        "Manual measurements available; fit is unverified.",
                      )
                    : t(
                        "მორგების მონაცემები მიუწვდომელია.",
                        "Fit data unavailable.",
                      )}
                </p>
                <LiveMaterialQuote language={language} />
                <div className="lx-result">
                  <div>
                    <span>{t("წონა", "Weight")}</span>
                    <strong>—</strong>
                  </div>
                  <div>
                    <span>{t("პროდუქტის ფასი", "Product price")}</span>
                    <strong>—</strong>
                  </div>
                </div>
                <p>
                  {t(
                    "გამოთვლა და შეკვეთა საჭიროებს გეომეტრიას, მასალასა და დამტკიცებულ შეთავაზებას.",
                    "Calculation and ordering require geometry, materials and a verified offer.",
                  )}
                </p>
                <button disabled>
                  {t(
                    "შეკვეთა — დამტკიცება საჭიროა",
                    "Order — verification required",
                  )}
                </button>
              </div>
              {token ? (
                <form
                  className="mx-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    create.mutate();
                  }}
                >
                  <h2>{t("შექმენი ჩემი ვერსია", "Create my version")}</h2>
                  <p>
                    {t(
                      "ინახება დიზაინის სურვილები; პროდუქტის შეცვლის უფლებები და წარმოება ჯერ დასადასტურებელია.",
                      "Save design preferences; personalization rights and production require approval.",
                    )}
                  </p>
                  <label>
                    {t("მასალის სურვილი", "Material preference")}
                    <input
                      value={material}
                      maxLength={80}
                      onChange={(e) => setMaterial(e.target.value)}
                    />
                  </label>
                  <label>
                    {t("ინიციალები", "Initials")}
                    <input
                      value={initials}
                      maxLength={3}
                      onChange={(e) => setInitials(e.target.value)}
                    />
                  </label>
                  <label>
                    {t(
                      "მოზაიკა / სტილი / ზომების მოთხოვნა",
                      "Mosaic / style / dimension request",
                    )}
                    <textarea
                      value={notes}
                      maxLength={2000}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </label>
                  <button
                    className="mx-button"
                    disabled={create.isPending || truth.isError}
                  >
                    {t("შეინახე მონახაზი", "Save draft")}
                  </button>
                  <p role="status">{notice}</p>
                  {savedVersion && <div className="mo-panel"><p>Version ID: {savedVersion}</p><button type="button" className="mx-button mx-secondary" disabled={requestReview.isPending || requestReview.isSuccess} onClick={() => requestReview.mutate()}>{requestReview.isSuccess ? t("შემოწმება მოთხოვნილია", "Review requested") : t("მოითხოვე შემოწმება", "Request verification")}</button>{requestReview.isError && <p role="alert">{t("შემოწმების მოთხოვნა ვერ გაიგზავნა.", "Review request failed.")}</p>}</div>}
                  {create.isError && (
                    <p role="alert">
                      {t("მონახაზი ვერ შეინახა.", "Draft could not be saved.")}
                    </p>
                  )}
                  <Link to="/my-designs">
                    {t("ჩემი დიზაინები", "My designs")} ↗
                  </Link>
                </form>
              ) : (
                <SignIn language={language} />
              )}
              <details>
                <summary>
                  {t("გამოთვლის დეტალები", "Calculation details")}
                </summary>
                <p>
                  {t(
                    "გამოთვლა მიუწვდომელია. ცოცხალი მასალის კურსი პროდუქტის ფასს არ წარმოადგენს.",
                    "Calculation unavailable. A live material quote is not a product price.",
                  )}
                </p>
                <p>Product: {id}</p>
                <p>Version: {truth.data?.sourceVersion || "—"}</p>
                <p>CONCEPT → ESTIMATED → VERIFIED</p>
              </details>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const labels: [keyof Measurements, string, string][] = [
  ["height", "სიმაღლე", "Height"],
  ["shoulders", "მხრები", "Shoulders"],
  ["chest", "მკერდი", "Chest"],
  ["waist", "წელი", "Waist"],
  ["hips", "თეძო", "Hips"],
  ["neck", "კისერი", "Neck"],
  ["wrist", "მაჯა", "Wrist"],
  ["finger", "თითის გარშემოწერილობა", "Finger circumference"],
  ["foot", "ტერფის სიგრძე", "Foot length"],
  ["head", "თავის გარშემოწერილობა", "Head circumference"],
];
export function CoreFit({ language }: { language: Language }) {
  const t = copy(language),
    token = useAuthStore((s) => s.accessToken),
    qc = useQueryClient(),
    [params] = useSearchParams();
  const [values, setValues] = useState<Record<string, string>>({}),
    [consent, setConsent] = useState(false);
  const query = useQuery({
    queryKey: ["core-fit", token],
    queryFn: coreApi.fit,
    enabled: !!token,
    retry: false,
  });
  const save = useMutation({
    mutationFn: () => {
      const measurements: Measurements = {};
      for (const [key] of labels) {
        const value =
          values[key] ?? query.data?.measurements[key]?.toString() ?? "";
        if (value !== "") measurements[key] = Number(value);
      }
      return coreApi.saveFit(measurements);
    },
    onSuccess: (data) => {
      qc.setQueryData(["core-fit", token], data);
      setValues({});
      setConsent(false);
    },
  });
  const remove = useMutation({
    mutationFn: coreApi.removeFit,
    onSuccess: () => {
      qc.setQueryData(["core-fit", token], null);
      setValues({});
      setConsent(false);
    },
  });
  return (
    <div className="mx-page">
      <span className="lx-eyebrow">MY DIGITAL TWIN / FIT PROFILE</span>
      <h1>{t("ფორმა იწყება შენით.", "Form begins with you.")}</h1>
      <div className="cx-object-layout">
        <figure className="lx-couture-twins">
          <img
            src="/museum/mosaic-couture-mannequins-reference.png"
            alt={t(
              "მოზაიკის კუტიურის ქალი და მამაკაცი მანეკენები",
              "Female and male mosaic couture mannequins",
            )}
          />
          <figcaption>{t("ვიზუალური კონცეფცია", "Visual concept")}</figcaption>
        </figure>
        <div>
          {!token ? (
            <SignIn language={language} />
          ) : (
            <>
              <QueryState
                language={language}
                loading={query.isLoading}
                error={query.isError}
              />
              <p>
                {t(
                  "შეიყვანე მხოლოდ ცნობილი ზომები სანტიმეტრებში. წყარო: ხელით შეყვანილი, გადაუმოწმებელი. სკანირება ჯერ მიუწვდომელია.",
                  "Enter known measurements in centimetres. Source: manual, unverified. Scanning is unavailable.",
                )}
              </p>
              <form
                className="mx-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  save.mutate();
                }}
              >
                <div className="cx-measurements">
                  {labels.map(([key, ka, en]) => (
                    <label key={key}>
                      {t(ka, en)} / cm
                      <input
                        type="number"
                        step="0.1"
                        min={key === "height" ? 50 : 1}
                        max={
                          key === "height"
                            ? 250
                            : key === "finger"
                              ? 15
                              : key === "wrist" || key === "foot"
                                ? 60
                                : key === "neck" || key === "head"
                                  ? 100
                                  : key === "chest" ||
                                      key === "waist" ||
                                      key === "hips"
                                    ? 300
                                    : 250
                        }
                        value={
                          values[key] ?? query.data?.measurements[key] ?? ""
                        }
                        onChange={(e) =>
                          setValues({ ...values, [key]: e.target.value })
                        }
                      />
                    </label>
                  ))}
                </div>
                <label className="mx-checkbox">
                  <input
                    type="checkbox"
                    required
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                  />
                  {t(
                    "ვეთანხმები ამ ზომების ჩემს ანგარიშში შენახვას მორგების მონახაზისთვის.",
                    "I consent to storing these measurements in my account for fit drafts.",
                  )}
                </label>
                <button
                  className="mx-button"
                  disabled={!consent || save.isPending || query.isError}
                >
                  {t("შეინახე ზომები", "Save measurements")}
                </button>
              </form>
              <button
                className="mx-button mx-secondary"
                disabled={!query.data || remove.isPending}
                onClick={() => remove.mutate()}
              >
                {t("წაშალე პროფილის ზომები", "Delete profile measurements")}
              </button>
              {(save.isSuccess || remove.isSuccess) && (
                <p role="status">
                  {t(
                    "ანგარიშის ზომები განახლებულია.",
                    "Account measurements updated.",
                  )}
                </p>
              )}
              {(save.isError || remove.isError) && (
                <p role="alert">
                  {t(
                    "მოქმედება ვერ შესრულდა.",
                    "Action could not be completed.",
                  )}
                </p>
              )}
              {query.data && (
                <p>
                  MANUAL_UNVERIFIED ·{" "}
                  {new Date(query.data.updatedAt).toLocaleDateString()}
                </p>
              )}
            </>
          )}
          <p>
            {t(
              "სახე → სათვალე · მაჯა → საათი · თითი → ბეჭედი · ტერფი → ფეხსაცმელი · სხეული → სამოსი",
              "Face → eyewear · wrist → watch · finger → ring · foot → shoes · body → fashion",
            )}
          </p>
          <Link
            to={
              params.get("product") && params.get("slug")
                ? `/object/${encodeURIComponent(params.get("slug")!)}/${encodeURIComponent(params.get("product")!)}`
                : "/museum"
            }
          >
            {params.get("product") && params.get("slug")
              ? t("დაუბრუნდი შენს ნივთს", "Return to your object")
              : t("მუზეუმში დაბრუნება", "Back to museum")}{" "}
            ↗
          </Link>
        </div>
      </div>
    </div>
  );
}

export function CoreDesigns({ language }: { language: Language }) {
  const t = copy(language),
    token = useAuthStore((s) => s.accessToken),
    qc = useQueryClient();
  const query = useQuery({
    queryKey: ["core-designs", token],
    queryFn: coreApi.designs,
    enabled: !!token,
    retry: false,
  });
  const verify = useMutation({
    mutationFn: coreApi.verify,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["core-designs"] }),
  });
  return (
    <div className="mx-page">
      <span className="lx-eyebrow">MY DESIGNS / VERSION HISTORY</span>
      <h1>
        {t("შენი დიზაინები. შენი ხელწერა.", "Your designs. Your signature.")}
      </h1>
      {!token ? (
        <SignIn language={language} />
      ) : (
        <>
          <QueryState
            language={language}
            loading={query.isLoading}
            error={query.isError}
          />
          {query.data?.length === 0 && (
            <p>
              {t(
                "დიზაინის მონახაზი ჯერ არ შეგინახავს. აირჩიე პროდუქტი კოლექციაში.",
                "No saved design drafts. Choose an object in a collection.",
              )}
            </p>
          )}
          {query.data?.map((d) => (
            <article className="cx-notice" key={d.id} id={`design-${d.id}`}>
              <span>CONCEPT · {d.verificationStatus}</span>
              <h2>
                {d.preferences.initials || t("ჩემი ვერსია", "My version")}
              </h2>
              <p>{d.preferences.notes}</p>
              <p>{d.preferences.material}</p>
              <p>
                {t(
                  "მონახაზი; წარმოების უფლება და შეთავაზება ჯერ არ არის დამტკიცებული.",
                  "Design proposal; production rights and offer are not approved.",
                )}
              </p>
              <details>
                <summary>{t("ვერსიის ისტორია", "Version lineage")}</summary>
                <p>Source: {d.sourceProductId}</p>
                <p>Source version: {d.sourceVersion}</p>
                <p>Draft version: {d.versionId}</p>
                <p>Brand Line: {d.brandLineId || "—"}</p>
                <p>{new Date(d.createdAt).toLocaleString()}</p>
              </details>
              <button
                className="mx-button"
                disabled={
                  verify.isPending || d.verificationStatus === "REQUESTED"
                }
                onClick={() => verify.mutate(d.id)}
              >
                {d.verificationStatus === "REQUESTED"
                  ? t("შეფასება მოთხოვნილია", "Review requested")
                  : t("მოითხოვე შეფასება", "Request review")}
              </button>
              <button disabled>
                {t(
                  "შეკვეთა — დამტკიცება საჭიროა",
                  "Order — verification required",
                )}
              </button>
            </article>
          ))}
          {verify.isError && (
            <p role="alert">
              {t("მოთხოვნა ვერ შეინახა.", "Request could not be recorded.")}
            </p>
          )}
        </>
      )}
      <Link to="/museum">{t("შედი მუზეუმში", "Enter museum")} ↗</Link>
    </div>
  );
}
export function CoreWorld({
  language,
  mode = "world",
}: {
  language: Language;
  mode?: "world" | "pulse" | "notifications" | "track" | "chat";
}) {
  const t = copy(language),
    token = useAuthStore((s) => s.accessToken),
    qc = useQueryClient(),
    [params] = useSearchParams();
  const house = useQuery({
    queryKey: ["world-house", token],
    queryFn: () => brandApi.getMine().then((r) => r.data.data),
    enabled: !!token && mode === "world",
    retry: false,
  });
  const pulse = useQuery({
    queryKey: ["world-pulse", token],
    queryFn: coreApi.pulse,
    enabled: !!token && mode === "pulse",
    retry: false,
  });
  const orders = useQuery({
    queryKey: ["world-orders", token],
    queryFn: () => ordersApi.list().then((r) => r.data.data),
    enabled: !!token && mode === "track",
    retry: false,
  });
  const notices = useQuery({
    queryKey: ["notifications", token],
    queryFn: () => notificationsApi.list(50).then((r) => r.data.data),
    enabled: !!token && mode === "notifications",
    retry: false,
  });
  const read = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
  const title =
    mode === "pulse"
      ? "Brand House Pulse"
      : mode === "notifications"
        ? t("შეტყობინებების ცენტრი", "Notification center")
        : mode === "track"
          ? t("შეკვეთების გზა", "Order journey")
          : mode === "chat"
            ? "MERGE Chat"
            : t("ჩემი Brand House", "My Brand House");
  return (
    <div className="mx-page">
      <Link to="/my-world">← {t("ჩემი სამყარო", "My world")}</Link>
      <h1>{title}</h1>
      {!token ? (
        <SignIn language={language} />
      ) : (
        <>
          <QueryState
            language={language}
            loading={
              house.isLoading ||
              pulse.isLoading ||
              orders.isLoading ||
              notices.isLoading
            }
            error={
              house.isError ||
              pulse.isError ||
              orders.isError ||
              notices.isError
            }
          />
          {mode === "world" && (
            <>
              <p>{house.data?.name}</p>
              <div className="cx-rooms">
                {[
                  ["/fit-profile", "ჩემი ზომები", "My Digital Twin"],
                  ["/dashboard/brand", "ჩემი Brand Line", "My Brand Line"],
                  [
                    "/dashboard/collections",
                    "ჩემი კოლექცია და პროდუქტები",
                    "My collection & products",
                  ],
                  [
                    "/my-designs",
                    "ჩემი დიზაინები და ისტორია",
                    "My designs & history",
                  ],
                  ["/dashboard/qr", "ჩემი QR", "My QR"],
                  ["/pulse", "ჩემი აქტივობა", "My activity"],
                  ["/chat", "ჩემი საუბრები", "My conversations"],
                  ["/my-saved", "შენახული ნივთები", "Saved objects"],
                  ["/track", "ჩემი შეკვეთები", "My orders"],
                  ["/passport", "ჩემი პასპორტები", "My passports"],
                  ["/notifications", "შეტყობინებები", "Notifications"],
                ].map(([to, ka, en]) => (
                  <Link to={to} key={to}>
                    <h3>{t(ka, en)} ↗</h3>
                  </Link>
                ))}
              </div>
              <Link className="mx-button" to="/museum">
                {t("შედი ცოცხალ მუზეუმში", "Enter Living Museum")} ↗
              </Link>
            </>
          )}
          {mode === "pulse" && pulse.data && (
            <>
              <p>
                DISCOVERY → INTEREST → CREATION → VERIFICATION → ORDER →
                PRODUCTION
              </p>
              <div className="cx-rooms">
                {Object.entries(pulse.data).map(([key, value]) => (
                  <article key={key}>
                    <span>{key}</span>
                    <h2>{value ?? "—"}</h2>
                    {value === null && (
                      <small>
                        {t("მონაცემი მიუწვდომელია", "Data unavailable")}
                      </small>
                    )}
                  </article>
                ))}
              </div>
              <p>
                {t(
                  "ვიზიტი და მოწონება გაყიდვას არ ნიშნავს. წარმოებისა და პასპორტის მონაცემები ჯერ მიუწვდომელია.",
                  "A view or like is not a sale. Production and passport data are unavailable.",
                )}
              </p>
            </>
          )}
          {mode === "track" && (
            <>
              {orders.data?.length === 0 && (
                <p>{t("შეკვეთა ჯერ არ არის.", "No orders yet.")}</p>
              )}
              {orders.data?.map((o) => (
                <article className="cx-notice" key={o.id} id={`order-${o.id}`}>
                  <h2>{o.id}</h2>
                  <p>
                    {o.status} · {o.deliveryStatus}
                  </p>
                  <p>
                    {o.trackingCode ||
                      t("ტრეკინგი მიუწვდომელია", "Tracking unavailable")}
                  </p>
                  <p>
                    {t(
                      "QC და პროდუქტის პასპორტი მიუწვდომელია. გადახდის სტატუსი სერვერის ჩანაწერიდან მოდის.",
                      "QC and product passport unavailable. Payment status comes from the server record.",
                    )}
                  </p>
                </article>
              ))}
            </>
          )}
          {mode === "notifications" && (
            <>
              {notices.data?.length === 0 && (
                <p>{t("შეტყობინება ჯერ არ არის.", "No notifications yet.")}</p>
              )}
              {notices.data?.map((n) => (
                <article
                  className="cx-notice"
                  key={n.id}
                  id={`notification-${n.id}`}
                >
                  <h2>{n.title}</h2>
                  <p>{n.body}</p>
                  <time>{new Date(n.createdAt).toLocaleString()}</time>
                  {!n.read && (
                    <button
                      disabled={read.isPending}
                      onClick={() => read.mutate(n.id)}
                    >
                      {t("წაკითხულია", "Mark read")}
                    </button>
                  )}
                  <Link
                    to={
                      typeof n.meta?.path === "string" &&
                      /^\/my-designs#design-[a-f0-9-]+$/i.test(n.meta.path)
                        ? n.meta.path
                        : `/notifications#notification-${n.id}`
                    }
                  >
                    {t("ჩანაწერის ნახვა", "View record")} ↗
                  </Link>
                </article>
              ))}
              {read.isError && (
                <p role="alert">
                  {t("განახლება ვერ შესრულდა.", "Update failed.")}
                </p>
              )}
            </>
          )}
          {mode === "chat" && (
            <div className="cx-notice">
              <p>
                {t(
                  "პირადი და პარტნიორთა ჩატი ჯერ მიუწვდომელია. პროდუქტის კონტექსტი შენარჩუნებულია; წერილი ავტომატურად არ გაგზავნილა.",
                  "Participant chat is unavailable. Product context is retained; no message has been sent.",
                )}
              </p>
              <p>Product: {params.get("product") || "—"}</p>
              <p>Version: {params.get("version") || "—"}</p>
              <Link to="/contact">
                {t("MERGE-სთან დაკავშირება", "Contact MERGE")} ↗
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
