import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery } from '@tanstack/react-query'
import DashboardLayout from '../components/DashboardLayout'
import FlowStepper from '../components/FlowStepper'
import CustomSelect from '../components/CustomSelect'
import ConfiguratorApplySummaryPanel from '../components/application/ConfiguratorApplySummaryPanel'
import { coinsApi } from '@/features/coins/api/coins.api'
import { configuratorApi } from '@/features/coin-configurator/api/configurator.api'
import { catalogApi } from '@/features/catalog/api/catalog.api'
import { useLiveMetalPrices } from '@/features/coins/hooks/useLiveMetalPrice'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { estimateCoinValue, metalForCoinIndex } from '@/shared/utils/coinPricing'
import { DEFAULT_FINENESS_PER_MILLE, formatMetalFineness } from '@/shared/utils/metalPurity'
import coinRender from '@/assets/merge_coin_3d_render.png'

type Step = 1 | 2 | 3 | 4 | 5

const TOTAL_STEPS = 5
const FINANCING_KEYS = ['full'] as const

export default function ApplicationPage() {
  const { t, i18n } = useTranslation()
  const [searchParams] = useSearchParams()
  const catalogItemId = searchParams.get('catalogItemId')?.trim() || ''
  const configuratorSessionId = searchParams.get('sessionId')?.trim() || ''
  const kgParam = searchParams.get('kg')
  const authUser = useAuthStore((s) => s.user)
  const coinTypes = t('application.coinTypes', { returnObjects: true }) as string[]
  const stepLabels = t('application.steps', { returnObjects: true }) as string[]
  const stepGuide = t('application.guides', { returnObjects: true }) as { title: string; blurb: string }[]
  const [step, setStep] = useState<Step>(1)
  const [coinIdx, setCoinIdx] = useState(0)
  const [coinType, setCoinType] = useState(coinTypes[0] ?? '')
  const [quantity, setQuantity] = useState(1)
  const metalType = metalForCoinIndex(coinIdx)
  const [notes, setNotes] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [personalId, setPersonalId] = useState('')
  const [phoneCode, setPhoneCode] = useState('+995')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [additionalNotes, setAdditionalNotes] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const navigate = useNavigate()

  const metals = useLiveMetalPrices()

  const { data: catalogDesign } = useQuery({
    queryKey: ['catalog-design-for-apply', catalogItemId],
    queryFn: async () => {
      // Resolve design title from public collections
      const list = await catalogApi.listPublic().then((r) => r.data.data)
      for (const c of list) {
        const detail = await catalogApi.getPublic(c.slug).then((r) => r.data.data)
        const item = detail.items.find((i) => i.id === catalogItemId)
        if (item) {
          return {
            item,
            collectionTitle: detail.title,
            ownerName: detail.ownerName,
            brandLineId: detail.brandLineId ?? null,
          }
        }
      }
      return null
    },
    enabled: !!catalogItemId,
  })

  useEffect(() => {
    if (kgParam) {
      const kg = Math.max(1, Number(kgParam) || 1)
      setQuantity(kg)
    }
  }, [kgParam])

  const { data: configuratorSession } = useQuery({
    queryKey: ['configurator-session-apply', configuratorSessionId],
    queryFn: () => configuratorApi.getSession(configuratorSessionId).then((r) => r.data.data),
    enabled: !!configuratorSessionId,
  })

  useEffect(() => {
    if (!authUser) return
    setFirstName((v) => v || authUser.firstName)
    setLastName((v) => v || authUser.lastName)
    setEmail((v) => v || authUser.email)
  }, [authUser])

  const coinValue = useMemo(
    () => estimateCoinValue(coinIdx, quantity, metals),
    [coinIdx, quantity, metals],
  )

  const designNotes = useMemo(() => notes.trim() || undefined, [notes])

  const designSummary = useMemo(() => {
    if (configuratorSession) {
      const count = configuratorSession.products.filter((p) =>
        ['approved', 'cad_review', 'verified'].includes(p.status),
      ).length
      return t('application.configuratorLinked', {
        count,
        used: configuratorSession.usedWeightG,
        capacity: configuratorSession.productCapacityG,
      })
    }
    if (catalogDesign?.item.title) return catalogDesign.item.title
    return '—'
  }, [configuratorSession, catalogDesign, t])

  const submitApp = useMutation({
    mutationFn: () =>
      coinsApi.submitApplication({
        coinType,
        quantity,
        metalPurity: 999.9,
        metalType,
        coinValue: coinValue * quantity,
        notes: designNotes,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        personalId: personalId.trim() || undefined,
        phone: phone.trim() ? `${phoneCode} ${phone.trim()}` : undefined,
        contactEmail: email.trim() || undefined,
        financingPreference: FINANCING_KEYS[0],
        deliveryAddress: deliveryAddress.trim() || undefined,
        additionalNotes: additionalNotes.trim() || undefined,
        catalogItemId: catalogItemId || undefined,
        configuratorSessionId: configuratorSessionId || undefined,
      }),
    onSuccess: () => navigate('/status'),
  })

  const idx = step - 1

  const goNext = () => {
    if (step === 2 && !canContinue) return
    if (step === 3 && (!firstName.trim() || !lastName.trim() || !email.trim())) return
    if (step === 4 && !deliveryAddress.trim()) return
    setStep((s) => Math.min(TOTAL_STEPS, s + 1) as Step)
  }

  const canContinue = step !== 2 || !!configuratorSessionId || !!catalogItemId

  const summaryFinancing = t('application.fullPaymentOpt')

  return (
    <DashboardLayout titleKey="application">
      <div className="apply-flow-wrap apply-flow-max space-y-8">
        <header className="apply-header">
          <div className="apply-header-row">
            <h2 className="apply-header-title">{stepGuide[idx]?.title}</h2>
            <span className="apply-step-pill">{t('application.stepOf', { step })}</span>
          </div>
          {step === 2 && stepGuide[idx]?.blurb && (
            <p className="apply-lead">{stepGuide[idx].blurb}</p>
          )}
          {configuratorSession && (
            <p className="apply-catalog-note">
              {t('application.configuratorLinked', {
                defaultValue:
                  'Smart Coin configuration attached: {{count}} approved product(s), {{used}} g used of {{capacity}} g capacity.',
                count: configuratorSession.products.filter((p) =>
                  ['approved', 'cad_review', 'verified'].includes(p.status),
                ).length,
                used: configuratorSession.usedWeightG,
                capacity: configuratorSession.productCapacityG,
              })}
            </p>
          )}
        </header>

        <FlowStepper steps={stepLabels} current={step} />

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10">
          <div className="lg:col-span-8">
            <div className="apply-surface ld-glass p-8 sm:p-10">
              {step === 1 && (
                <div className="flex flex-col gap-7 sm:gap-8">
                  <div>
                    <label className="apply-label" htmlFor="apply-coin-type">
                      {t('application.selectCoin')}
                    </label>
                    <CustomSelect
                      id="apply-coin-type"
                      aria-label={t('application.selectCoin')}
                      value={coinIdx}
                      onChange={(v) => {
                        const i = Number(v)
                        setCoinIdx(i)
                        setCoinType(coinTypes[i] ?? '')
                      }}
                      options={coinTypes.map((c, i) => ({ value: i, label: c }))}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                    <div>
                      <label className="apply-label" htmlFor="apply-qty">
                        {t('application.quantity')}
                      </label>
                      <input
                        id="apply-qty"
                        className="apply-field"
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, +e.target.value || 1))}
                        min={1}
                      />
                    </div>
                    <div>
                      <label className="apply-label" htmlFor="apply-weight">
                        {t('application.coinWeight')}
                      </label>
                      <input
                        id="apply-weight"
                        className="apply-field apply-field--muted"
                        value={t('application.grams', { n: quantity * 1000 })}
                        readOnly
                        aria-readonly="true"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                    <div>
                      <label className="apply-label" htmlFor="apply-metal">
                        {t('application.metalType')}
                      </label>
                      <input
                        id="apply-metal"
                        className="apply-field apply-field--muted"
                        value={t(`application.metals.${metalType as 'silver' | 'gold'}`)}
                        readOnly
                        aria-readonly="true"
                      />
                    </div>
                    <div>
                      <label className="apply-label" htmlFor="apply-purity">
                        {t('application.fineness')}
                      </label>
                      <input
                        id="apply-purity"
                        className="apply-field apply-field--muted"
                        value={formatMetalFineness(DEFAULT_FINENESS_PER_MILLE, i18n.language)}
                        readOnly
                        aria-readonly="true"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="apply-label" htmlFor="apply-notes">
                      {t('application.specialRequest')}
                    </label>
                    <textarea
                      id="apply-notes"
                      className="apply-field resize-none"
                      rows={4}
                      placeholder={t('application.notesPlaceholder')}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-col gap-7 sm:gap-8">
                  {catalogItemId ? (
                    <div className="rounded border border-[#c9a84c]/30 bg-[#c9a84c]/08 p-5 space-y-2">
                      <p className="text-sm font-bold text-[#c9a84c]">
                        {t('application.catalogDesignSelected', { defaultValue: 'Catalog design selected' })}
                      </p>
                      <p className="text-white font-semibold">
                        {catalogDesign?.item.title ?? '…'}
                      </p>
                      {catalogDesign?.ownerName && (
                        catalogDesign.brandLineId ? (
                          <Link
                            to={`/b/${encodeURIComponent(catalogDesign.brandLineId)}`}
                            className="text-sm text-[#c9a84c] hover:underline no-underline"
                          >
                            {catalogDesign.ownerName}
                          </Link>
                        ) : (
                          <p className="text-sm text-neutral-400">{catalogDesign.ownerName}</p>
                        )
                      )}
                      <p className="text-xs text-neutral-500">
                        {t('application.catalogDesignRoyaltyNote', {
                          defaultValue: 'When you pay for this coin order, the design author receives 50% of the paid amount in their earnings wallet.',
                        })}
                      </p>
                    </div>
                  ) : configuratorSession ? (
                    <ConfiguratorApplySummaryPanel session={configuratorSession} />
                  ) : (
                    <div className="rounded border border-[#c9a84c]/25 bg-black/40 p-6 space-y-4">
                      <p className="text-white font-semibold">
                        {t('application.fillCoinPrompt', {
                          defaultValue: 'Design your custom MERGE Coin products with AI',
                        })}
                      </p>
                      <p className="text-sm text-neutral-400">
                        {t('application.fillCoinHint', {
                          defaultValue:
                            'Select products, upload references, generate 3D models, and fill your coin before applying.',
                        })}
                      </p>
                      <Link to="/fill-coin" className="gold-btn inline-flex no-underline">
                        {t('configurator.fillCoinCta', { defaultValue: 'Fill your MERGE Coin' })}
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="flex flex-col gap-7 sm:gap-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                    <div>
                      <label className="apply-label" htmlFor="apply-fn">
                        {t('application.firstName')}
                      </label>
                      <input
                        id="apply-fn"
                        className="apply-field"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="apply-label" htmlFor="apply-ln">
                        {t('application.lastName')}
                      </label>
                      <input
                        id="apply-ln"
                        className="apply-field"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="apply-label" htmlFor="apply-idn">
                      {t('application.personalId')}
                    </label>
                    <input
                      id="apply-idn"
                      className="apply-field"
                      placeholder={t('application.placeholderPassport')}
                      value={personalId}
                      onChange={(e) => setPersonalId(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="apply-label" htmlFor="apply-phone-after">
                      {t('application.phone')}
                    </label>
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                      <select
                        className="apply-field shrink-0 w-full sm:w-[8.75rem]"
                        id="apply-cc"
                        aria-label="Country code"
                        value={phoneCode}
                        onChange={(e) => setPhoneCode(e.target.value)}
                      >
                        <option value="+995">🇬🇪 +995</option>
                        <option value="+1">🇺🇸 +1</option>
                      </select>
                      <input
                        id="apply-phone-after"
                        className="apply-field flex-1"
                        placeholder={t('application.placeholderMobile')}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="apply-label" htmlFor="apply-email">
                      {t('application.email')}
                    </label>
                    <input
                      id="apply-email"
                      className="apply-field"
                      type="email"
                      placeholder={t('application.placeholderEmail')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="flex flex-col gap-7 sm:gap-8">
                  <div>
                    <label className="apply-label" htmlFor="apply-address">
                      {t('application.deliveryAddress')}
                    </label>
                    <textarea
                      id="apply-address"
                      className="apply-field resize-none"
                      rows={4}
                      placeholder={t('application.addressPlaceholder')}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="apply-label" htmlFor="apply-misc">
                      {t('application.additionalNotes')}
                    </label>
                    <textarea
                      id="apply-misc"
                      className="apply-field resize-none"
                      rows={3}
                      placeholder={t('application.notesFulfilment')}
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="flex flex-col gap-4">
                  {[
                    { label: t('application.summaryCoinType'), value: coinType },
                    { label: t('application.summaryQuantity'), value: `${quantity} KG` },
                    { label: t('application.summaryWeight'), value: t('application.grams', { n: quantity * 1000 }) },
                    { label: t('application.summaryPurity'), value: `${formatMetalFineness(DEFAULT_FINENESS_PER_MILLE, i18n.language)} ${t(`application.metals.${metalType}`)}` },
                    { label: t('application.summaryValue'), value: `$${(coinValue * quantity).toLocaleString()}` },
                    {
                      label: t('application.summaryAiDesign'),
                      value: designSummary,
                    },
                    { label: t('application.summaryFinancing'), value: summaryFinancing },
                    { label: t('application.deliveryAddress'), value: deliveryAddress || '—' },
                  ].map((r) => (
                    <div key={r.label} className="preview-row">
                      <span className="preview-muted">{r.label}</span>
                      <span className="preview-value text-right">{r.value}</span>
                    </div>
                  ))}
                  <div className="pt-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="mt-1 w-4 h-4 shrink-0 accent-[#d4af37]"
                        checked={confirmed}
                        onChange={(e) => setConfirmed(e.target.checked)}
                      />
                      <span className="text-sm leading-relaxed tracking-wide text-neutral-300">
                        {t('application.confirmAccurate')}{' '}
                        <Link to="/terms" className="text-[#D4AF37] hover:underline underline-offset-2">
                          {t('auth.termsLink')}
                        </Link>
                        .
                      </span>
                    </label>
                  </div>
                </div>
              )}

              <div className="apply-actions-divider">
                <div className="application-actions flex flex-col-reverse sm:flex-row gap-3">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={() => setStep((s) => (s - 1) as Step)}
                      className="luxury-btn-ghost flex-1 justify-center"
                    >
                      {t('application.backBtn')}
                    </button>
                  )}
                  {step < TOTAL_STEPS ? (
                    <button
                      type="button"
                      onClick={goNext}
                      disabled={!canContinue}
                      className={`luxury-btn-glass justify-center ${step > 1 ? 'flex-1' : 'w-full sm:flex-1'}`}
                    >
                      {t('application.continueBtn')}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={submitApp.isPending || !confirmed}
                      onClick={() => submitApp.mutate()}
                      className={`luxury-btn-glass justify-center ${step > 1 ? 'flex-1' : 'w-full sm:flex-1'}`}
                    >
                      {submitApp.isPending ? '…' : t('application.submitBtn')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <aside className="lg:col-span-4">
            <div className="apply-surface-sidebar ld-glass p-7 sm:p-8 lg:sticky lg:top-6">
              <img
                src={coinRender}
                alt=""
                className="apply-coin-thumb"
                width={160}
                height={160}
              />
              <p className="dash-label mb-5">{t('application.orderPreview', { defaultValue: 'Order preview' })}</p>
              {[
                { label: t('application.coinValue'), value: `$${(coinValue * quantity).toLocaleString()}.00` },
                { label: t('application.summaryFinancing'), value: summaryFinancing },
              ].map((r) => (
                <div key={r.label} className="preview-row">
                  <span className="preview-muted">{r.label}</span>
                  <span className="preview-value">{r.value}</span>
                </div>
              ))}
              <p className="apply-preview-note">{t('application.previewNote')}</p>

              <div className="apply-sidebar-links mt-6">
                <Link to="/price-indicator">{t('application.viewIndicator')}</Link>
                <Link to="/faq">{t('application.howPricing')}</Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  )
}
