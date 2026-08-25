import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '@/components/DashboardLayout'
import MeshyAIPanel from '@/components/catalog/MeshyAIPanel'
import Model3DViewer from '@/components/catalog/Model3DViewer'
import {
  configuratorApi,
  type ConfiguratorProduct,
} from '@/features/coin-configurator/api/configurator.api'

type Step = 'pick' | 'studio' | 'review'

export default function CoinConfiguratorPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [searchParams] = useSearchParams()
  const sourceBrand = searchParams.get('source')?.trim() || searchParams.get('brand')?.trim() || ''
  const sourceQr = searchParams.get('qr')?.trim() || searchParams.get('ref')?.trim() || ''
  const initialKg = Number(searchParams.get('kg') || '1') || 1
  const sessionParam = searchParams.get('session')?.trim() || ''

  const [step, setStep] = useState<Step>('pick')
  const [activeProductId, setActiveProductId] = useState<string | null>(null)
  const [publishCatalog, setPublishCatalog] = useState(false)

  const { data: productTypes = [] } = useQuery({
    queryKey: ['configurator-product-types'],
    queryFn: () => configuratorApi.productTypes().then((r) => r.data.data),
  })

  const { data: packageConfigs = [] } = useQuery({
    queryKey: ['configurator-package-configs'],
    queryFn: () => configuratorApi.packageConfigs().then((r) => r.data.data),
  })

  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null)

  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ['configurator-session', sessionParam || 'active', initialKg, sourceBrand, selectedPackageId],
    queryFn: async () => {
      if (sessionParam) {
        return configuratorApi.getSession(sessionParam).then((r) => r.data.data)
      }
      const active = await configuratorApi.activeSession().then((r) => r.data.data)
      if (active) return active
      const pkg = packageConfigs.find((p) => p.id === selectedPackageId)
      return configuratorApi
        .createSession({
          packageKg: pkg?.packageKg ?? initialKg,
          packageConfigId: pkg?.id,
          sourceBrandHouseId: sourceBrand || undefined,
          sourceQrRef: sourceQr || undefined,
        })
        .then((r) => r.data.data)
    },
    enabled: packageConfigs.length > 0 || !!sessionParam,
  })

  useEffect(() => {
    if (session?.status === 'finalized' || session?.status === 'locked') {
      setStep('review')
    }
  }, [session?.status])

  const activeProduct = useMemo(
    () => session?.products.find((p) => p.id === activeProductId) ?? null,
    [session?.products, activeProductId],
  )

  const approvedProducts = useMemo(
    () =>
      session?.products.filter((p) => ['approved', 'cad_review', 'verified'].includes(p.status)) ??
      [],
    [session?.products],
  )

  const addProduct = useMutation({
    mutationFn: (productType: string) => {
      if (!session) throw new Error('No session')
      return configuratorApi.addProduct(session.id, productType).then((r) => r.data.data)
    },
    onSuccess: (data, productType) => {
      qc.setQueryData(['configurator-session', sessionParam || 'active', initialKg, sourceBrand], data)
      const created = [...data.products].reverse().find((p) => p.productType === productType)
      if (created) {
        setActiveProductId(created.id)
        setStep('studio')
      }
    },
  })

  const saveGeneration = useMutation({
    mutationFn: async (payload: {
      productId: string
      prompt: string
      previewUrl: string | null
      jobId?: string
    }) => {
      if (!session) throw new Error('No session')
      return configuratorApi
        .updateProduct(session.id, payload.productId, {
          prompt: payload.prompt,
          meshyJobId: payload.jobId ?? undefined,
          model3dUrl: payload.previewUrl ?? undefined,
          status: 'generated',
        })
        .then((r) => r.data.data)
    },
    onSuccess: (data) => {
      qc.setQueryData(['configurator-session', sessionParam || 'active', initialKg, sourceBrand], data)
    },
  })

  const approveProduct = useMutation({
    mutationFn: (productId: string) => {
      if (!session) throw new Error('No session')
      return configuratorApi
        .approveProduct(session.id, productId, {
          visibility: publishCatalog ? 'catalog' : 'private',
        })
        .then((r) => r.data.data)
    },
    onSuccess: (data) => {
      qc.setQueryData(['configurator-session', sessionParam || 'active', initialKg, sourceBrand], data)
      setActiveProductId(null)
      setStep('pick')
      setPublishCatalog(false)
    },
  })

  const finalize = useMutation({
    mutationFn: () => {
      if (!session) throw new Error('No session')
      return configuratorApi.finalize(session.id).then((r) => r.data.data)
    },
    onSuccess: (data) => {
      navigate(`/apply?sessionId=${encodeURIComponent(data.id)}&kg=${data.packageKg}`)
    },
  })

  const canFinalize = approvedProducts.length > 0 && session?.status === 'draft'

  return (
    <DashboardLayout>
      <div className="coin-config-page">
        <header className="coin-config-head">
          <div>
            <p className="coin-config-kicker">
              {t('configurator.kicker', { defaultValue: 'SMART COIN CONFIGURATOR' })}
            </p>
            <h1>{t('configurator.title', { defaultValue: 'Fill Your MERGE Coin' })}</h1>
            {sourceBrand ? (
              <p className="coin-config-source">
                {t('configurator.source', { defaultValue: 'Source Brand House' })}: <strong>{sourceBrand}</strong>
              </p>
            ) : null}
            {!sessionParam && session?.status === 'draft' && packageConfigs.length > 0 && (
              <div className="coin-config-kg-picker mt-3">
                <label htmlFor="pkg-select">{t('configurator.package', { defaultValue: 'Package size' })}</label>
                <select
                  id="pkg-select"
                  value={selectedPackageId ?? packageConfigs.find((p) => p.isDefault)?.id ?? packageConfigs[0]?.id ?? ''}
                  onChange={(e) => setSelectedPackageId(e.target.value)}
                  disabled={(session?.products.length ?? 0) > 0}
                >
                  {packageConfigs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label} — {p.productCapacityG} g products / {p.caseWeightG} g case
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </header>

        {sessionLoading || !session ? (
          <p className="text-neutral-500">{t('common.loading')}</p>
        ) : (
          <div className="coin-config-layout">
            <aside className="coin-config-side">
              <div className="coin-config-calculator">
                <h2>{t('configurator.calculator', { defaultValue: 'Coin Calculator' })}</h2>
                <div className="coin-config-calc-row">
                  <span>{t('configurator.capacity', { defaultValue: 'Product capacity' })}</span>
                  <strong>{session.productCapacityG} g</strong>
                </div>
                <div className="coin-config-calc-row">
                  <span>{t('configurator.case', { defaultValue: 'MERGE Coin case' })}</span>
                  <strong>{session.caseWeightG} g</strong>
                </div>
                <div className="coin-config-calc-row coin-config-calc-used">
                  <span>{t('configurator.used', { defaultValue: 'Used' })}</span>
                  <strong>{session.usedWeightG} g</strong>
                </div>
                <div className="coin-config-calc-row coin-config-calc-remaining">
                  <span>{t('configurator.remaining', { defaultValue: 'Remaining' })}</span>
                  <strong>{session.remainingWeightG} g</strong>
                </div>
                <div className="coin-config-calc-bar">
                  <div
                    className="coin-config-calc-fill"
                    style={{
                      width: `${Math.min(100, (session.usedWeightG / session.productCapacityG) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {approvedProducts.length > 0 && (
                <div className="coin-config-approved">
                  <h3>{t('configurator.inCoin', { defaultValue: 'In your coin' })}</h3>
                  <ul>
                    {approvedProducts.map((p) => (
                      <li key={p.id}>
                        <span>{p.title}</span>
                        <em>{p.weightG ?? p.estimatedWeightG} g</em>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {canFinalize && (
                <button
                  type="button"
                  className="luxury-btn-glass w-full justify-center"
                  disabled={finalize.isPending}
                  onClick={() => finalize.mutate()}
                >
                  {t('configurator.finalApprove', { defaultValue: 'Final approval — continue to order' })}
                </button>
              )}

              {session.status !== 'draft' && (
                <Link to={`/apply?sessionId=${session.id}`} className="gold-btn w-full justify-center mt-3">
                  {t('configurator.continueApply', { defaultValue: 'Continue to application' })}
                </Link>
              )}
            </aside>

            <main className="coin-config-main">
              {step === 'pick' && (
                <>
                  <h2 className="coin-config-section-title">
                    {t('configurator.selectProduct', { defaultValue: 'Select a product to generate' })}
                  </h2>
                  <div className="coin-config-product-grid">
                    {productTypes.map((pt) => (
                      <button
                        key={pt.key}
                        type="button"
                        className="coin-config-product-card"
                        disabled={addProduct.isPending || session.status !== 'draft'}
                        onClick={() => addProduct.mutate(pt.key)}
                      >
                        <span className="coin-config-product-label">{pt.label}</span>
                        <span className="coin-config-product-cta">
                          {t('configurator.generateMy', {
                            defaultValue: 'Generate my {{product}}',
                            product: pt.label,
                          })}
                        </span>
                        <em>~{pt.defaultWeightG} g</em>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {step === 'studio' && activeProduct && (
                <ConfiguratorStudio
                  product={activeProduct}
                  publishCatalog={publishCatalog}
                  onPublishChange={setPublishCatalog}
                  onBack={() => {
                    setStep('pick')
                    setActiveProductId(null)
                  }}
                  onGenerated={(res) =>
                    saveGeneration.mutate({
                      productId: activeProduct.id,
                      prompt: res.prompt,
                      previewUrl: res.previewUrl,
                      jobId: res.jobId,
                    })
                  }
                  onApprove={() => approveProduct.mutate(activeProduct.id)}
                  approving={approveProduct.isPending}
                  canApprove={activeProduct.status === 'generated' || !!activeProduct.model3dUrl}
                />
              )}

              {step === 'review' && (
                <div className="coin-config-review">
                  <h2>{t('configurator.reviewTitle', { defaultValue: 'Your coin configuration is ready' })}</h2>
                  <ProductList products={approvedProducts} />
                  {session.caseLayoutJson && (
                    <div className="configurator-apply-layout mt-6">
                      <h4>{t('configurator.autoFitCase', { defaultValue: 'Auto-fit case layout' })}</h4>
                      <pre className="configurator-apply-layout-json">
                        {JSON.stringify(session.caseLayoutJson, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </main>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

function ProductList({ products }: { products: ConfiguratorProduct[] }) {
  return (
    <ul className="coin-config-review-list">
      {products.map((p) => (
        <li key={p.id}>
          <div>
            <strong>{p.title}</strong>
            <span>{p.weightG ?? p.estimatedWeightG} g</span>
          </div>
          {p.model3dUrl && <Model3DViewer modelUrl={p.model3dUrl} className="coin-config-mini-viewer" />}
        </li>
      ))}
    </ul>
  )
}

function ConfiguratorStudio({
  product,
  publishCatalog,
  onPublishChange,
  onBack,
  onGenerated,
  onApprove,
  approving,
  canApprove,
}: {
  product: ConfiguratorProduct
  publishCatalog: boolean
  onPublishChange: (v: boolean) => void
  onBack: () => void
  onGenerated: (res: { prompt: string; previewUrl: string | null; jobId?: string }) => void
  onApprove: () => void
  approving: boolean
  canApprove: boolean
}) {
  const { t } = useTranslation()

  return (
    <div className="coin-config-studio">
      <div className="coin-config-studio-head">
        <button type="button" className="coin-config-back" onClick={onBack}>
          ← {t('configurator.back', { defaultValue: 'All products' })}
        </button>
        <h2>{product.title}</h2>
      </div>

      <div className="coin-config-studio-grid">
        <MeshyAIPanel
          resultUrl={product.model3dUrl}
          onGenerate={async (res) => {
            onGenerated({
              prompt: res.prompt,
              previewUrl: res.previewUrl,
              jobId: res.jobId,
            })
          }}
        />
        <div className="coin-config-studio-preview">
          <p className="dash-label">{t('configurator.preview3d', { defaultValue: '3D preview' })}</p>
          <Model3DViewer modelUrl={product.model3dUrl} />
        </div>
      </div>

      {canApprove && (
        <div className="coin-config-approve-bar">
          <label className="coin-config-publish">
            <input
              type="checkbox"
              checked={publishCatalog}
              onChange={(e) => onPublishChange(e.target.checked)}
            />
            {t('configurator.publishCatalog', { defaultValue: 'Publish to my catalog after approval' })}
          </label>
          <button
            type="button"
            className="luxury-btn-glass"
            disabled={approving}
            onClick={onApprove}
          >
            {t('configurator.approveDesign', { defaultValue: 'Approve design' })}
          </button>
        </div>
      )}
    </div>
  )
}
