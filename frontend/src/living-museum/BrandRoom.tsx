import { useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, UserRound } from 'lucide-react'
import { brandApi } from '@/features/brand/api/brand.api'
import MuseumCatalog from './MuseumCatalog'
import './museum.css'
import './catalog.css'

export default function BrandRoom() {
  const { brandLineId = '' } = useParams()
  const tracked = useRef('')
  const { data: brand, isPending, isError } = useQuery({ queryKey: ['brand-public', brandLineId], queryFn: () => brandApi.getPublic(brandLineId).then(response => response.data.data), enabled: !!brandLineId })
  useEffect(() => { if (brandLineId && tracked.current !== brandLineId) { tracked.current = brandLineId; void brandApi.trackPublicView(brandLineId).catch(() => {}) } }, [brandLineId])
  return <div className="living-museum"><main className="museum-brand-room">
    <Link className="text-link" to="/museum"><ArrowLeft size={17} />მუზეუმში დაბრუნება</Link>
    {isPending ? <p role="status">იტვირთება…</p> : isError || !brand ? <p role="alert">Brand Room ვერ ჩაიტვირთა.</p> : <>
      <header>{brand.logoUrl && <img src={brand.logoUrl} alt="" />}<div><span className="eyebrow">BRAND ROOM</span><h1>{brand.name || brand.ownerName}</h1><p>{brand.description}</p><Link to={`/u/${encodeURIComponent(brand.mergeId)}`}><UserRound size={16} />{brand.ownerName || brand.mergeId}</Link></div></header>
      <MuseumCatalog brand={brandLineId} />
    </>}
  </main></div>
}
