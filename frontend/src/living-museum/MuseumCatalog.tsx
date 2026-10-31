import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, Search, Scale, X, RefreshCw, UserRound } from 'lucide-react'
import { api } from '@/lib/axios'
import type { ApiResponse } from '@/shared/types/api.types'
import { type CatalogCollection, type CatalogItem, catalogItemPublicImageUrl } from '@/features/catalog/api/catalog.api'
import { CoreModelViewer } from './components/core-model-viewer'
import { coreApi } from '@/experience/core.api'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { CATALOG_CATEGORIES } from '@/shared/catalogCategories'

export const museumCategories = CATALOG_CATEGORIES
type Exhibit = CatalogItem & { collection: CatalogCollection; lifecycle: string; verification: string }
type Page = { items: Exhibit[]; total: number; page: number; pageSize: number; hasMore: boolean }
type Filters = { q: string; category: string; material: string; page: number }
const browsing = new Map<string, Filters>()
const selections = new Map<string, string>()

function CatalogImage({ item }: { item: CatalogItem }) {
  const url = catalogItemPublicImageUrl(item)
  const [failed, setFailed] = useState(false)
  return url && !failed ? <img src={url} loading="lazy" alt={item.title} onError={() => setFailed(true)} /> : <span className="museum-image-unavailable">სურათი მიუწვდომელია</span>
}

export default function MuseumCatalog({ brand = '', category: initialCategory = '' }: { brand?: string; category?: string }) {
  const key = `${brand}:${initialCategory}`
  const [filters, setFilters] = useState<Filters>(() => browsing.get(key) ?? { q: '', category: initialCategory, material: '', page: 0 })
  const [search, setSearch] = useState(filters.q)
  const [selected, setSelected] = useState<Exhibit | null>(null)
  const [compared, setCompared] = useState<Exhibit[]>([])
  const [comparing, setComparing] = useState(false)
  const user = useAuthStore(state => state.user)
  const signedIn = useAuthStore(state => !!state.accessToken && !!state.user)
  const designs = useQuery({ queryKey: ['museum-own-proposals', user?.id], queryFn: coreApi.designs, enabled: signedIn, retry: false })
  useEffect(() => { browsing.set(key, filters) }, [key, filters])
  useEffect(() => { if (filters.q === search) return; const timer = setTimeout(() => { selections.delete(key); setSelected(null); setFilters(value => ({ ...value, q: search, page: 0 })) }, 300); return () => clearTimeout(timer) }, [search, key, filters.q])
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['museum-catalog', brand, filters],
    queryFn: ({ signal }) => api.get<ApiResponse<Page>>('/catalog/public/museum', { params: { ...filters, brand }, signal }).then(response => response.data.data),
    retry: false,
  })
  useEffect(() => { const id = selections.get(key); if (id && data) setSelected(data.items.find(item => item.id === id) ?? null) }, [key, data])
  function select(item: Exhibit | null) { if (item) selections.set(key, item.id); else selections.delete(key); setSelected(item) }
  const change = (name: 'category' | 'material', value: string) => { select(null); setFilters(previous => ({ ...previous, [name]: value, page: 0 })) }
  function toggle(item: Exhibit) { setCompared(rows => rows.some(row => row.id === item.id) ? rows.filter(row => row.id !== item.id) : rows.length < 3 ? [...rows, item] : rows) }
  function actions(item: Exhibit) {
    const author = item.collection.brandLineId || item.collection.mergeId
    return <div className="museum-record-actions">
      <Link to={`/object/${encodeURIComponent(item.collection.slug)}/${item.id}`}>CORE · წყარო / ჩემი ვერსია</Link>
      {author && <Link to={`/b/${encodeURIComponent(author)}`}><UserRound size={15} />{item.collection.brandName || item.collection.ownerName || 'Brand Room'}</Link>}
      <button aria-pressed={compared.some(row => row.id === item.id)} disabled={compared.length === 3 && !compared.some(row => row.id === item.id)} onClick={() => toggle(item)}><Scale size={15} />შედარება</button>
    </div>
  }
  return <section className="museum-catalog" aria-label={brand ? 'Brand Room-ის ექსპონატები' : 'ყველა ბრენდის ექსპონატები'}>
    <div className="museum-catalog-filters">
      <label><Search size={16} /><input type="search" aria-label="ნივთი, ბრენდი ან ავტორი" placeholder="ნივთი, ბრენდი ან ავტორი" value={search} onChange={event => setSearch(event.target.value)} /></label>
      <select aria-label="კატეგორია" value={filters.category} onChange={event => change('category', event.target.value)}><option value="">ყველა კატეგორია</option>{museumCategories.map(category => <option key={category} value={category}>{category}</option>)}</select>
      <select aria-label="მასალა" value={filters.material} onChange={event => change('material', event.target.value)}><option value="">ყველა მასალა</option>{['silver', 'gold', 'composite'].map(material => <option key={material}>{material}</option>)}</select>
      <button title="განახლება" aria-label="განახლება" onClick={() => void refetch()}><RefreshCw size={17} /></button>
      <button title="ექსპონატების შედარება" aria-label={`ექსპონატების შედარება · ${compared.length}`} disabled={compared.length < 2} onClick={() => { setComparing(value => !value); setSelected(null) }}><Scale size={17} />{compared.length}/3</button>
    </div>
    {isPending && <p role="status">იტვირთება…</p>}
    {isError && <p role="alert">CORE ვერ ჩაიტვირთა. ხელახლა სცადე.</p>}
    {comparing ? <div className="museum-compare">{compared.map(item => <article key={item.id}><h3>{item.title}</h3><CatalogImage item={item} /><button title="შედარებიდან მოხსნა" aria-label={`${item.title} შედარებიდან მოხსნა`} onClick={() => toggle(item)}><X size={16} /></button><dl><dt>ავტორი</dt><dd>{item.collection.brandName || item.collection.ownerName || '—'}</dd><dt>კატეგორია</dt><dd>{item.collection.category}</dd><dt>მასალა</dt><dd>{item.metalType || '—'}</dd><dt>სტატუსი</dt><dd>{item.lifecycle}</dd><dt>წყარო / რევიზია</dt><dd>{item.id}<br />{item.updatedAt}</dd><dt>ზომა / წონა / VERIFIED ფასი</dt><dd>მიუწვდომელია</dd></dl>{actions(item)}</article>)}</div> : selected ? <article className="museum-record-detail">
      <button className="text-link" onClick={() => select(null)}><ArrowLeft size={16} />ექსპონატები</button><h3>{selected.title}</h3>
      {selected.hasModel3d ? <CoreModelViewer url={`${window.location.origin}/api/catalog/public/items/${selected.id}/model3d`} itemId={selected.id} title={selected.title} preview={catalogItemPublicImageUrl(selected)} /> : <CatalogImage key={selected.id} item={selected} />}
      <p>{selected.description}</p>{actions(selected)}<dl><dt>წყარო</dt><dd>{selected.id}</dd><dt>რევიზიის დრო</dt><dd>{selected.updatedAt}</dd><dt>სტატუსი</dt><dd>CONCEPT · VERIFIED შეთავაზება მიუწვდომელია</dd></dl>
    </article> : <>
      <div className="museum-record-grid">{data?.items.map(item => <article key={item.id}>
        <button className="museum-record-open" onClick={() => select(item)}><CatalogImage item={item} /><strong>{item.title}</strong><small>{item.collection.brandName || item.collection.ownerName} · {item.collection.category}</small></button>{actions(item)}
      </article>)}</div>
      {data?.total === 0 && <p role="status">საჯარო ექსპონატები ჯერ არ არის.</p>}
      {data && <nav className="core-pagination" aria-label="ექსპონატების გვერდები"><span>{data.total} · {filters.page + 1}</span><button aria-label="წინა გვერდი" disabled={!filters.page} onClick={() => setFilters(value => ({ ...value, page: value.page - 1 }))}><ArrowLeft size={17} /></button><button aria-label="შემდეგი გვერდი" disabled={!data.hasMore} onClick={() => setFilters(value => ({ ...value, page: value.page + 1 }))}><ArrowRight size={17} /></button></nav>}
    </>}
    {signedIn && (!brand || brand === user?.mergeId || designs.data?.some(design => design.brandLineId === brand)) && <details><summary>ჩემი CORE მონახაზები · პირადი</summary>
      {designs.isPending && <p role="status">იტვირთება…</p>}{designs.isError && <p role="alert">პირადი მონახაზები ვერ ჩაიტვირთა.</p>}
      {designs.data?.length === 0 && <p>მონახაზები ჯერ არ არის.</p>}
      {designs.data?.filter(design => !brand || design.brandLineId === brand || brand === user?.mergeId).map(design => <article key={design.id}><h3>{design.preferences.initials || 'ჩემი ვერსია'}</h3><p>CONCEPT · {design.verificationStatus}</p><p>{design.preferences.notes}</p><dl><dt>წყარო</dt><dd>{design.sourceProductId}</dd><dt>ვერსია</dt><dd>{design.versionId}</dd><dt>წყაროს რევიზია</dt><dd>{design.sourceVersion}</dd></dl><Link to={`/my-designs#design-${design.id}`}>ისტორია / შეფასება</Link></article>)}
    </details>}
  </section>
}
