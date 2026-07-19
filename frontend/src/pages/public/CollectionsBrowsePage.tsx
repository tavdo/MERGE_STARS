import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import SiteLayout from '../../components/SiteLayout'
import { catalogApi } from '@/features/catalog/api/catalog.api'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { getApiErrorMessage } from '@/shared/utils/apiError'

export default function CollectionsBrowsePage() {
  const { t } = useTranslation()
  const { slug } = useParams()
  const navigate = useNavigate()
  const token = useAuthStore((s) => s.token)
  const [buyMsg, setBuyMsg] = useState<string | null>(null)
  const [buyError, setBuyError] = useState<string | null>(null)
  const [buyingId, setBuyingId] = useState<string | null>(null)

  const { data: list = [], isLoading: listLoading } = useQuery({
    queryKey: ['catalog-public'],
    queryFn: () => catalogApi.listPublic().then((r) => r.data.data),
    enabled: !slug,
  })

  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ['catalog-public', slug],
    queryFn: () => catalogApi.getPublic(slug!).then((r) => r.data.data),
    enabled: !!slug,
  })

  const buy = useMutation({
    mutationFn: (itemId: string) => catalogApi.placeOrder(itemId),
    onMutate: (itemId) => {
      setBuyingId(itemId)
      setBuyMsg(null)
      setBuyError(null)
    },
    onSuccess: (res) => {
      const o = res.data.data
      const auto = o.coinAutoPay?.paid
        ? t('collections.buyAutoPaid', {
            defaultValue: 'Seller coin order {{id}} was auto-paid from earnings.',
            id: o.coinAutoPay.orderId,
          })
        : ''
      setBuyMsg(
        t('collections.buySuccess', {
          defaultValue: 'Order {{id}} placed. Seller received ${{earnings}} earnings ({{share}}). {{auto}}',
          id: o.id,
          earnings: Number(o.sellerEarnings).toFixed(2),
          share: o.brandShareLabel,
          auto,
        }),
      )
      setBuyingId(null)
    },
    onError: (err) => {
      setBuyError(getApiErrorMessage(err, t('collections.buyFailed', { defaultValue: 'Could not place order' })))
      setBuyingId(null)
    },
  })

  const onBuy = (itemId: string) => {
    if (!token) {
      navigate(`/login?next=/collections/${slug}`)
      return
    }
    buy.mutate(itemId)
  }

  return (
    <SiteLayout>
      <div className="max-w-5xl mx-auto px-6 py-16">
        {!slug ? (
          <>
            <p className="landing-sans-head mb-3">{t('collections.browseKicker', { defaultValue: 'COMMUNITY CATALOG' })}</p>
            <h1 className="landing-section-title mb-4">{t('collections.browseTitle', { defaultValue: 'Public collections' })}</h1>
            <p className="landing-body mb-10 max-w-2xl">
              {t('collections.browseSubtitle', { defaultValue: 'Explore catalogs created by MERGE STARS members.' })}
            </p>
            {listLoading ? (
              <p className="text-neutral-500">Loading…</p>
            ) : list.length === 0 ? (
              <p className="text-neutral-500">{t('collections.browseEmpty', { defaultValue: 'No public collections yet.' })}</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-5">
                {list.map((c) => (
                  <Link
                    key={c.id}
                    to={`/collections/${c.slug}`}
                    className="gold-card p-6 block no-underline hover:border-[#D4AF37]/40 transition-colors"
                  >
                    <h2 className="text-lg font-bold text-white mb-2">{c.title}</h2>
                    <p className="text-sm text-neutral-500 mb-3">{c.ownerName}</p>
                    {c.description && <p className="text-sm text-neutral-400 line-clamp-2 mb-4">{c.description}</p>}
                    <span className="text-xs text-[#D4AF37]">{c.itemCount} items →</span>
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : detailLoading || !detail ? (
          <p className="text-neutral-500">Loading…</p>
        ) : (
          <>
            <Link to="/collections" className="text-sm text-neutral-500 hover:text-[#D4AF37] no-underline">
              ← {t('collections.browseTitle', { defaultValue: 'Public collections' })}
            </Link>
            <h1 className="landing-section-title mt-6 mb-2">{detail.title}</h1>
            <p className="text-sm text-[#D4AF37] mb-2">{detail.ownerName}</p>
            {detail.description && <p className="landing-body mb-6">{detail.description}</p>}
            {buyMsg && <p className="text-sm text-green-400 mb-4">{buyMsg}</p>}
            {buyError && <p className="text-sm text-red-400 mb-4">{buyError}</p>}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {detail.items.map((item) => {
                const forSale = item.priceUsd != null && Number(item.priceUsd) > 0
                return (
                  <article key={item.id} className="gold-card p-4">
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt="" className="w-full h-40 object-cover rounded mb-3" />
                    )}
                    <h3 className="font-bold text-white">{item.title}</h3>
                    {item.metalType && <p className="text-xs text-[#D4AF37] mt-1">{item.metalType}</p>}
                    {forSale && (
                      <p className="text-lg font-bold text-white mt-2">
                        ${Number(item.priceUsd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    )}
                    {item.description && <p className="text-sm text-neutral-500 mt-2">{item.description}</p>}
                    {forSale && (
                      <button
                        type="button"
                        className="gold-btn w-full justify-center mt-4"
                        disabled={buyingId === item.id}
                        onClick={() => onBuy(item.id)}
                      >
                        {buyingId === item.id
                          ? '…'
                          : t('collections.buy', { defaultValue: 'BUY' })}
                      </button>
                    )}
                  </article>
                )
              })}
            </div>
          </>
        )}
      </div>
    </SiteLayout>
  )
}
