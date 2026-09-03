import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '@/components/DashboardLayout'
import MeshyAIPanel from '@/components/catalog/MeshyAIPanel'
import Model3DViewer from '@/components/catalog/Model3DViewer'
import CoinCaseAssembly3D, { parseCaseDesign } from '@/components/coin-configurator/CoinCaseAssembly3D'
import { MESHY_STYLE_PROMPTS, modelUrlForSave } from '@/features/catalog/meshy.hooks'
import {
  configuratorApi,
  type ConfiguratorProduct,
} from '@/features/coin-configurator/api/configurator.api'
import { BRAND_CASE_MESHY_STYLE, BRAND_CASE_PROMPT, BRAND_CASE_STYLE_OPTIONS, CONFIGURATOR_PRODUCT_TYPES_FALLBACK } from '@/features/coin-configurator/constants'

type Step = 'case' | 'pick' | 'studio' | 'review'

function sessionQueryKey(
  sessionParam: string,
  initialKg: number,
  sourceBrand: string,
  selectedPackageId: string | null,
) {
  return ['configurator-session', sessionParam || 'active', initialKg, sourceBrand, selectedPackageId] as const
}

export default function CoinConfiguratorPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [searchParams] = useSearchParams()
  const sourceBrand = searchParams.get('source')?.trim() || searchParams.get('brand')?.trim() || ''
  const sourceQr = searchParams.get('qr')?.trim() || searchParams.get('ref')?.trim() || ''
  const initialKg = Number(searchParams.get('kg') || '1') || 1
  const sessionParam = searchParams.get('session')?.trim() || ''

  const [step, setStep] = useState<Step>('case')
  const [activeProductId, setActiveProductId] = useState<string | null>(null)
  const [publishCatalog, setPublishCatalog] = useState(false)

  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const sessionKey = sessionQueryKey(sessionParam, initialKg, sourceBrand, selectedPackageId)

  const {
    data: productTypes = CONFIGURATOR_PRODUCT_TYPES_FALLBACK,
    isLoading: productTypesLoading,
    isError: productTypesError,
  } = useQuery({
    queryKey: ['configurator-product-types'],
    queryFn: () => configuratorApi.productTypes().then((r) => r.data.data),
    placeholderData: CONFIGURATOR_PRODUCT_TYPES_FALLBACK,
    staleTime: 60_000,
  })

  const { data: packageConfigs = [] } = useQuery({
    queryKey: ['configurator-package-configs'],
    queryFn: () => configuratorApi.packageConfigs().then((r) => r.data.data),
    staleTime: 60_000,
  })

  const { data: session, isLoading: sessionLoading, isError: sessionError, refetch: refetchSession } = useQuery({
    queryKey: sessionKey,
    queryFn: async () => {
      if (sessionParam) {
        return configuratorApi.getSession(sessionParam).then((r) => r.data.data)
      }
      const active = await configuratorApi.activeSession().then((r) => r.data.data)
      if (active) return active
      const defaultPkg =
        packageConfigs.find((p) => p.id === selectedPackageId) ??
        packageConfigs.find((p) => p.isDefault) ??
        packageConfigs[0]
      return configuratorApi
        .createSession({
          packageKg: defaultPkg?.packageKg ?? initialKg,
          packageConfigId: defaultPkg?.id,
          sourceBrandHouseId: sourceBrand || undefined,
          sourceQrRef: sourceQr || undefined,
        })
        .then((r) => r.data.data)
    },
    retry: 1,
  })

  useEffect(() => {
    if (session?.status === 'finalized' || session?.status === 'locked') {
      setStep('review')
      return
    }
    const cd = parseCaseDesign(session?.caseLayoutJson)
    if (!cd?.approved) {
      setStep('case')
    } else if (step === 'review') {
      setStep('pick')
    }
  }, [session?.status, session?.id, session?.caseLayoutJson])

  const caseDesign = useMemo(() => parseCaseDesign(session?.caseLayoutJson), [session?.caseLayoutJson])

  const activeProduct = useMemo(
    () => session?.products.find((p) => p.id === activeProductId) ?? null,
    [session?.products, activeProductId],
  )

  const assemblyItems = useMemo(() => {
    const base =
      session?.products
        .filter((p) => ['generated', 'approved', 'cad_review', 'verified'].includes(p.status))
        .map((p) => ({
          id: p.id,
          title: p.title,
          model3dUrl: p.model3dUrl,
        })) ?? []

    if (
      activeProduct?.model3dUrl &&
      !base.some((p) => p.id === activeProduct.id)
    ) {
      return [
        ...base,
        {
          id: activeProduct.id,
          title: activeProduct.title,
          model3dUrl: activeProduct.model3dUrl,
        },
      ]
    }
    return base
  }, [session?.products, activeProduct])

  const saveCaseDesign = useMutation({
    mutationFn: (payload: { prompt: string; previewUrl: string | null; jobId?: string }) => {
      if (!session) throw new Error('No session')
      return configuratorApi
        .saveCaseDesign(session.id, {
          prompt: payload.prompt,
          meshyJobId: payload.jobId,
          model3dUrl: modelUrlForSave(payload.jobId, payload.previewUrl),
        })
        .then((r) => r.data.data)
    },
    onSuccess: (data) => qc.setQueryData(sessionKey, data),
  })

  const approveCaseDesign = useMutation({
    mutationFn: () => {
      if (!session) throw new Error('No session')
      return configuratorApi.approveCaseDesign(session.id).then((r) => r.data.data)
    },
    onSuccess: (data) => {
      qc.setQueryData(sessionKey, data)
      setStep('pick')
    },
  })

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
    onMutate: () => setActionError(null),
    onSuccess: (data, productType) => {
      qc.setQueryData(sessionKey, data)
      const created = [...data.products].reverse().find((p) => p.productType === productType)
      if (created) {
        setActiveProductId(created.id)
        setStep('studio')
      }
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
          ?.message ||
        (err as Error)?.message ||
        'Could not add product'
      setActionError(msg)
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
          model3dUrl: modelUrlForSave(payload.jobId, payload.previewUrl),
          status: 'generated',
        })
        .then((r) => r.data.data)
    },
    onSuccess: (data) => {
      qc.setQueryData(sessionKey, data)
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
      qc.setQueryData(sessionKey, data)
      setActiveProductId(null)
      setStep('pick')
      setPublishCatalog(false)
    },
    onError: (err: Error) => {
      setActionError(err.message || 'Could not approve design')
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

        {sessionLoading ? (
          <p className="coin-config-status">{t('common.loading')}</p>
        ) : sessionError || !session ? (
          <div className="coin-config-status coin-config-status--error">
            <p>{t('configurator.sessionError', { defaultValue: 'Could not start your coin configuration.' })}</p>
            <button type="button" className="gold-btn" onClick={() => refetchSession()}>
              {t('configurator.retry', { defaultValue: 'Try again' })}
            </button>
          </div>
        ) : (
          <>
            <nav className="coin-config-steps" aria-label="Configurator steps">
              {(
                [
                  ['case', t('configurator.stepCase', { defaultValue: '1. Brand case' })],
                  ['pick', t('configurator.stepProducts', { defaultValue: '2. Products' })],
                  ['review', t('configurator.stepReview', { defaultValue: '3. Review' })],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={`coin-config-step-pill${step === key || (key === 'pick' && step === 'studio') ? ' coin-config-step-pill--active' : ''}${key === 'pick' && !caseDesign?.approved ? ' coin-config-step-pill--locked' : ''}`}
                  disabled={key === 'pick' && !caseDesign?.approved}
                  onClick={() => {
                    if (key === 'case') setStep('case')
                    else if (key === 'pick' && caseDesign?.approved) setStep('pick')
                    else if (key === 'review' && approvedProducts.length) setStep('review')
                  }}
                >
                  {label}
                </button>
              ))}
            </nav>

            <div className="coin-config-hero-layout">
            <div className="coin-config-layout">
            <main className="coin-config-main">
              {actionError && (
                <p className="coin-config-action-error" role="alert">
                  {actionError}
                </p>
              )}

              {step === 'case' && (
                <div className="coin-config-case-step">
                  <h2 className="coin-config-section-title">
                    {t('configurator.caseStepTitle', {
                      defaultValue: 'Generate your brand case ({{g}} g)',
                      g: session.caseWeightG,
                    })}
                  </h2>
                  <p className="coin-config-hint">
                    {t('configurator.caseStepHint', {
                      defaultValue:
                        'Step 1: generate only the empty branded case exterior (no products inside). Step 2: your items animate into the empty case in 3D.',
                    })}
                  </p>
                  <MeshyAIPanel
                    defaultStyle={BRAND_CASE_MESHY_STYLE}
                    styles={BRAND_CASE_STYLE_OPTIONS}
                    defaultPrompt={BRAND_CASE_PROMPT}
                    resultUrl={caseDesign?.model3dUrl ?? null}
                    onGenerate={async (res) => {
                      await saveCaseDesign.mutateAsync({
                        prompt: res.prompt,
                        previewUrl: res.previewUrl,
                        jobId: res.jobId,
                      })
                    }}
                  />
                  {caseDesign?.model3dUrl && !caseDesign.approved && (
                    <button
                      type="button"
                      className="luxury-btn-glass mt-4"
                      disabled={approveCaseDesign.isPending}
                      onClick={() => approveCaseDesign.mutate()}
                    >
                      {t('configurator.approveCase', { defaultValue: 'Approve brand case — add products' })}
                    </button>
                  )}
                  {caseDesign?.approved && (
                    <button type="button" className="gold-btn mt-4" onClick={() => setStep('pick')}>
                      {t('configurator.continueProducts', { defaultValue: 'Continue to products →' })}
                    </button>
                  )}
                </div>
              )}

              {step === 'pick' && (
                <>
                  <h2 className="coin-config-section-title">
                    {t('configurator.selectProduct', { defaultValue: 'Select a product to generate' })}
                  </h2>
                  {productTypesLoading && (
                    <p className="coin-config-hint">{t('common.loading')}</p>
                  )}
                  {productTypesError && (
                    <p className="coin-config-hint">
                      {t('configurator.productTypesFallback', {
                        defaultValue: 'Using default product list — tap a product to start.',
                      })}
                    </p>
                  )}
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

              {step === 'studio' && !activeProduct && (
                <div className="coin-config-status">
                  <p>{t('configurator.pickProductAgain', { defaultValue: 'Select a product to continue.' })}</p>
                  <button type="button" className="gold-btn" onClick={() => setStep('pick')}>
                    {t('configurator.back', { defaultValue: 'All products' })}
                  </button>
                </div>
              )}

              {step === 'review' && (
                <div className="coin-config-review">
                  <h2>{t('configurator.reviewTitle', { defaultValue: 'Your coin configuration is ready' })}</h2>
                  <ProductList products={approvedProducts} />
                </div>
              )}
            </main>

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
            </div>

            <div className="coin-config-hero-3d">
              <CoinCaseAssembly3D
                caseModelUrl={caseDesign?.model3dUrl}
                caseWeightG={session.caseWeightG}
                layout={session.caseLayoutJson}
                items={assemblyItems}
                caseApproved={Boolean(caseDesign?.approved)}
                previewMode={
                  step === 'case' || (!caseDesign?.approved && assemblyItems.length === 0)
                    ? 'case-shell'
                    : 'assembly'
                }
                label={t('configurator.preview3dLive', { defaultValue: '3D LIVE PREVIEW' })}
              />
            </div>
            </div>
          </>
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
  const meshyStyle =
    CONFIGURATOR_PRODUCT_TYPES_FALLBACK.find((p) => p.key === product.productType)?.meshyStyle ??
    'Jewelry'
  const stylePrompt = MESHY_STYLE_PROMPTS[meshyStyle] ?? ''

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
          defaultStyle={meshyStyle}
          defaultPrompt={stylePrompt}
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
