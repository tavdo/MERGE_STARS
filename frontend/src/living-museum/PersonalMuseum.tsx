import { lazy, Suspense, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, Plus, RefreshCw, Save, Send, X } from 'lucide-react'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { coreApi, type DesignProposal } from '@/experience/core.api'
import { catalogItemImageUrl } from '@/features/catalog/api/catalog.api'
import { useAuthAssetUrl } from '@/features/catalog/hooks/useAuthAssetUrl'
import { enterMuseum, approachMuseumPoint, type MuseumPointId } from './lib/museum-tour'
import type { CoreExhibitReference } from './lib/museum-vitrine'
import './museum.css'
import './catalog.css'

const SpatialMuseum = lazy(() => import('./components/museum-spatial').then(module => ({ default: module.SpatialMuseum })))

function ProductImage({ url, title }: { url: string | null; title: string }) {
  const source = useAuthAssetUrl(url)
  const [failed, setFailed] = useState(false)
  return source && !failed ? <img src={source} alt={title} onError={() => setFailed(true)} /> : <span className="museum-image-unavailable">სურათი მიუწვდომელია</span>
}

export default function PersonalMuseum() {
  const userId = useAuthStore(state => state.user?.id)
  return <PersonalMuseumContent key={userId ?? 'guest'} />
}

function PersonalMuseumContent() {
  const user = useAuthStore(state => state.user)
  const signedIn = useAuthStore(state => !!state.accessToken && !!state.user)
  const [page, setPage] = useState(0)
  const [view, setView] = useState(enterMuseum)
  const [parent, setParent] = useState<DesignProposal | null>(null)
  const [material, setMaterial] = useState(''), [initials, setInitials] = useState(''), [notes, setNotes] = useState('')
  const [consentId, setConsentId] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const cache = useQueryClient()
  const query = useQuery({ queryKey: ['personal-museum', user?.id, page], queryFn: ({ signal }) => coreApi.personalMuseum(page, signal), enabled: signedIn, retry: false, staleTime: 0, placeholderData: previous => previous })
  const references = useMemo<CoreExhibitReference[]>(() => (query.data?.products ?? []).filter(item => item.hasModel3d).slice(0, 4).map(item => ({
    itemId: item.id, collectionId: item.collectionId, collectionSlug: item.collection.slug, title: item.title, brandName: null,
    modelURL: `${window.location.origin}/api/catalog/items/${item.id}/model3d/file`, sourceUpdatedAt: item.updatedAt,
  })), [query.data])
  async function refresh() {
    await cache.invalidateQueries({ queryKey: ['personal-museum', user?.id] })
    await cache.invalidateQueries({ queryKey: ['core-designs'] })
    await cache.invalidateQueries({ queryKey: ['museum-own-proposals'] })
  }
  const save = useMutation({ mutationFn: () => {
    if (!parent) throw Error('Choose a source version')
    return coreApi.createDesign({ sourceProductId: parent.sourceProductId, parentProposalId: parent.id, material, initials, notes })
  }, onSuccess: async () => { setParent(null); setPage(0); setNotice('ახალი პირადი ვერსია შენახულია. ორიგინალი უცვლელია.'); await refresh() } })
  const publication = useMutation({ mutationFn: coreApi.requestPublication, onSuccess: async () => { setConsentId(null); setNotice('მოთხოვნა ჩაწერილია. ვერსია პირადია და უფლებრივ შემოწმებას ელოდება.'); await refresh() } })
  function startVersion(version: DesignProposal) { setParent(version); setMaterial(version.preferences.material ?? ''); setInitials(version.preferences.initials ?? ''); setNotes(version.preferences.notes ?? ''); setNotice('') }
  const showRecords = () => document.getElementById('personal-exhibits')?.scrollIntoView({ behavior: 'smooth' })
  const inspectConcept = () => setNotice('ეს მთავარი მუზეუმის კონცეპტუალური ექსპონატია. პირადი ვერსიისთვის აირჩიე CORE ჩანაწერი ქვემოთ.')
  return <div className="living-museum"><main className="personal-museum">
    <header className="personal-museum-header"><Link className="text-link" to="/museum"><ArrowLeft size={17} />მთავარი მუზეუმი</Link><h1>ჩემი ცოცხალი ბრენდული მუზეუმი</h1><span>PERSONAL · {query.data?.identity.masterId || user?.mergeId || 'MERGE ID'}</span><Link to="/dashboard/collections"><Plus size={16} />კატალოგები</Link><Link to="/fit-profile">ჩემი ზომები</Link></header>
    {!signedIn ? <p className="personal-museum-status"><Link to="/login?next=%2Fmy-museum">შედი ანგარიშით</Link></p> : <>
      {query.isPending && <p role="status" className="personal-museum-status">CORE-ის პირადი სივრცე იტვირთება…</p>}
      {query.isError && <div className="personal-museum-status" role="alert">პირადი სივრცე ვერ ჩაიტვირთა. <button onClick={() => void query.refetch()}><RefreshCw size={16} />ხელახლა ცდა</button></div>}
      {query.data && <>
        <Suspense fallback={<p role="status">მუზეუმი იტვირთება…</p>}><SpatialMuseum key={user?.id} view={view} disabled={save.isPending || publication.isPending} blocked={false} vitrineRequest={null} personalReferences={references} onPoint={(point: MuseumPointId) => setView(approachMuseumPoint(point, 'coin'))} onExhibit={inspectConcept} onCreate={inspectConcept} onInspect={inspectConcept} onOriginal={() => setNotice('ორიგინალი ვიზუალები შენარჩუნებულია მთავარ მუზეუმში.')} onDetail={inspectConcept} onCoreVitrine={showRecords} /></Suspense>
        <section id="personal-exhibits" className="personal-exhibits"><h2>ჩემი ექსპონატები <span>{query.data.productCount}</span></h2>
          {!query.data.productCount && <p>შენი კატალოგი ჯერ ცარიელია.</p>}
          <div className="museum-record-grid">{query.data.products.map(item => <article key={item.id}><ProductImage url={catalogItemImageUrl(item)} title={item.title} /><h3>{item.title}</h3><p>{item.collection.title} · {item.collection.visibility}</p><Link to={`/dashboard/collections/${item.collectionId}`}>CORE ჩანაწერი</Link>{item.hasModel3d && <span>3D</span>}</article>)}</div>
          <h2>ჩემი ვერსიები <span>{query.data.versionCount}</span></h2>
          {!query.data.versionCount && <p>შენახული CORE ვერსიები ჯერ არ არის. <Link to="/museum">აირჩიე წყარო მუზეუმში</Link></p>}
          <div className="personal-version-list">{query.data.versions.map(version => <article key={version.id}>
            <h3>{version.preferences.initials || 'ჩემი ვერსია'}</h3><span>PRIVATE · CONCEPT · {version.publicationStatus === 'PENDING_RIGHTS_REVIEW' ? 'უფლებრივი შემოწმება მოთხოვნილია' : 'არ არის გამოქვეყნებული'}</span><p>{version.preferences.notes}</p>
            <details><summary>წყარო და ისტორია</summary><dl><dt>ვერსიის ID</dt><dd>{version.id}</dd><dt>საწყისი პროდუქტი</dt><dd>{version.rootProductId}</dd><dt>მშობელი ვერსია</dt><dd>{version.parentProposalId || 'ორიგინალი'}</dd><dt>წყაროს რევიზია</dt><dd>{version.sourceVersion}</dd></dl></details>
            <div className="museum-record-actions"><button disabled={save.isPending} onClick={() => startVersion(version)}><Plus size={15} />ახალი ვერსია</button><Link to={`/my-designs#design-${version.id}`}>შეფასება</Link><button disabled={publication.isPending || version.publicationStatus === 'PENDING_RIGHTS_REVIEW'} onClick={() => setConsentId(version.id)}><Send size={15} />საჯარო განთავსების მოთხოვნა</button></div>
            {consentId === version.id && <form onSubmit={event => { event.preventDefault(); publication.mutate(version.id) }}><label><input type="checkbox" required />ვადასტურებ საჯარო განთავსების მოთხოვნას. უფლებრივი შემოწმების დასრულებამდე ვერსია პირადი რჩება.</label><button disabled={publication.isPending} type="submit"><Send size={15} />მოთხოვნის გაგზავნა</button><button type="button" disabled={publication.isPending} onClick={() => setConsentId(null)}><X size={15} />გაუქმება</button></form>}
          </article>)}</div>
          {parent && <form className="personal-version-form" onSubmit={event => { event.preventDefault(); save.mutate() }}><h3>ახალი ვერსია</h3><label>მასალა<input maxLength={80} value={material} onChange={event => setMaterial(event.target.value)} /></label><label>ინიციალები<input maxLength={3} value={initials} onChange={event => setInitials(event.target.value)} /></label><label>დიზაინის ჩანაწერი<textarea maxLength={2000} value={notes} onChange={event => setNotes(event.target.value)} /></label><button disabled={save.isPending} type="submit"><Save size={16} />პირად მუზეუმში შენახვა</button><button disabled={save.isPending} type="button" onClick={() => setParent(null)}><X size={16} />გაუქმება</button></form>}
          <nav className="core-pagination" aria-label="პირადი ექსპონატების გვერდები"><span>{query.data.page + 1}</span><button aria-label="წინა გვერდი" disabled={!page || query.isFetching} onClick={() => setPage(value => value - 1)}><ArrowLeft size={17} /></button><button aria-label="შემდეგი გვერდი" disabled={!query.data.hasMore || query.isFetching} onClick={() => setPage(value => value + 1)}><ArrowRight size={17} /></button></nav>
        </section>
      </>}
      {(save.isError || publication.isError) && <p role="alert" className="personal-museum-status">მოთხოვნა ვერ შეინახა. მონაცემები ეკრანზე რჩება.</p>}
      {notice && <p role="status" className="personal-museum-status">{notice}</p>}
    </>}
  </main></div>
}
