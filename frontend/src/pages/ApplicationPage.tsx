import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import DashboardLayout from '../components/DashboardLayout'
import FlowStepper from '../components/FlowStepper'
import CustomSelect from '../components/CustomSelect'
import { coinsApi } from '@/features/coins/api/coins.api'
import { useLiveMetalPrices } from '@/features/coins/hooks/useLiveMetalPrice'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { estimateCoinValue, financingPreview, metalForCoinIndex } from '@/shared/utils/coinPricing'

type Step = 1 | 2 | 3 | 4

const FINANCING_KEYS = ['full', 'bank12', 'bank24'] as const

export default function ApplicationPage() {
  const { t } = useTranslation()
  const authUser = useAuthStore((s) => s.user)
  const coinTypes = t('application.coinTypes', { returnObjects: true }) as string[]
  const stepLabels = t('application.steps', { returnObjects: true }) as string[]
  const stepGuide = t('application.guides', { returnObjects: true }) as { title: string; blurb: string }[]
  const financingOptions = [
    t('application.fullPaymentOpt'),
    t('application.bank12'),
    t('application.bank24'),
  ]

  const [step, setStep] = useState<Step>(1)
  const [coinIdx, setCoinIdx] = useState(0)
  const [coinType, setCoinType] = useState(coinTypes[0] ?? '')
  const [quantity, setQuantity] = useState(1)
  const [metalType, setMetalType] = useState('silver')
  const [notes, setNotes] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [personalId, setPersonalId] = useState('')
  const [phoneCode, setPhoneCode] = useState('+995')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [financingIdx, setFinancingIdx] = useState(1)
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [additionalNotes, setAdditionalNotes] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const navigate = useNavigate()

  const metals = useLiveMetalPrices()

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

  const termMonths = financingIdx === 0 ? 0 : financingIdx === 1 ? 12 : 24
  const { downPayment, toFinance, monthly } = financingPreview(coinValue * quantity, termMonths || 12)

  const submitApp = useMutation({
    mutationFn: () =>
      coinsApi.submitApplication({
        coinType,
        quantity,
        metalPurity: 99.9,
        metalType,
        coinValue: coinValue * quantity,
        notes: notes.trim() || undefined,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        personalId: personalId.trim() || undefined,
        phone: phone.trim() ? `${phoneCode} ${phone.trim()}` : undefined,
        contactEmail: email.trim() || undefined,
        financingPreference: FINANCING_KEYS[financingIdx],
        financingTermMonths: termMonths || undefined,
        deliveryAddress: deliveryAddress.trim() || undefined,
        additionalNotes: additionalNotes.trim() || undefined,
      }),
    onSuccess: () => navigate('/status'),
  })

  const idx = step - 1

  const goNext = () => {
    if (step === 2 && (!firstName.trim() || !lastName.trim() || !email.trim())) return
    if (step === 3 && !deliveryAddress.trim()) return
    setStep((s) => Math.min(4, s + 1) as Step)
  }

  const summaryFinancing =
    financingIdx === 0
      ? t('application.fullPaymentOpt')
      : financingIdx === 1
        ? t('application.bankFinancing12')
        : t('application.bankFinancing24', { defaultValue: t('application.bank24') })

  return (
    <DashboardLayout titleKey="application">
      <div className="apply-flow-wrap apply-flow-max space-y-8">
        <header>
          <p className="landing-sans-head mb-2">{t('application.kicker')}</p>
          <h2 className="font-serif-display text-2xl sm:text-3xl tracking-wide text-[#f5f2eb]">
            {stepGuide[idx]?.title}
          </h2>
          <span className="apply-step-pill">{t('application.stepOf', { step })}</span>
          <p className="apply-lead">{stepGuide[idx]?.blurb}</p>
        </header>

        <FlowStepper steps={stepLabels} current={step} />

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10">
          <div className="lg:col-span-8">
            <div className="apply-surface p-8 sm:p-10">
              {step === 1 && (
                <div className="flex flex-col gap-7 sm:gap-8">
                  <h3 className="apply-section-head">{t('application.coinSpec')}</h3>
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
                        setMetalType(metalForCoinIndex(i))
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
                        {t('application.metalPurity')}
                      </label>
                      <select
                        id="apply-metal"
                        className="apply-field"
                        value={metalType}
                        onChange={(e) => setMetalType(e.target.value)}
                      >
                        <option value="silver">{t('application.metals.silver')}</option>
                        <option value="gold">{t('application.metals.gold')}</option>
                        <option value="platinum">{t('application.metals.platinum')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="apply-label" htmlFor="apply-purity">
                        {t('application.fineness')}
                      </label>
                      <input
                        id="apply-purity"
                        className="apply-field apply-field--muted"
                        value="99.9 %"
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
                  <h3 className="apply-section-head">{t('application.yourProfile')}</h3>
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

              {step === 3 && (
                <div className="flex flex-col gap-7 sm:gap-8">
                  <h3 className="apply-section-head">{t('application.optionsAddress')}</h3>
                  <div>
                    <label className="apply-label" htmlFor="apply-fin">
                      {t('application.financingPref')}
                    </label>
                    <select
                      id="apply-fin"
                      className="apply-field"
                      value={financingIdx}
                      onChange={(e) => setFinancingIdx(Number(e.target.value))}
                    >
                      {financingOptions.map((opt, i) => (
                        <option key={opt} value={i}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
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

              {step === 4 && (
                <div className="flex flex-col gap-4">
                  <h3 className="apply-section-head">{t('application.summary')}</h3>
                  {[
                    { label: t('application.summaryCoinType'), value: coinType },
                    { label: t('application.summaryQuantity'), value: `${quantity} KG` },
                    { label: t('application.summaryWeight'), value: t('application.grams', { n: quantity * 1000 }) },
                    { label: t('application.summaryPurity'), value: t('application.puritySilver') },
                    { label: t('application.summaryValue'), value: `$${(coinValue * quantity).toLocaleString()}` },
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
                      <span className="text-[11px] leading-relaxed tracking-wide text-neutral-500">
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
                  {step < 4 ? (
                    <button
                      type="button"
                      onClick={goNext}
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
            <div className="apply-surface-sidebar p-7 sm:p-8 lg:sticky lg:top-6">
              <p className="dash-label mb-6">{t('application.financingPreview')}</p>
              {[
                { label: t('application.coinValue'), value: `$${(coinValue * quantity).toLocaleString()}.00` },
                { label: t('application.downPayment20'), value: `$${downPayment.toFixed(2)}` },
                { label: t('application.amountFinance'), value: `$${toFinance.toFixed(2)}` },
                {
                  label: t('application.financingTerm'),
                  value: termMonths ? t('application.term12', { defaultValue: `${termMonths} months` }) : t('application.fullPaymentOpt'),
                },
                ...(financingIdx > 0
                  ? [{ label: t('application.estMonthly'), value: `$${monthly.toFixed(2)}` }]
                  : []),
              ].map((r) => (
                <div key={r.label} className="preview-row">
                  <span className="preview-muted">{r.label}</span>
                  <span className="preview-value">{r.value}</span>
                </div>
              ))}
              <p className="apply-preview-note">{t('application.previewNote')}</p>

              <Link to="/calculator" className="luxury-btn-glass w-full justify-center mt-6">
                {t('application.openCalculator')}
              </Link>
              <div className="apply-sidebar-links">
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
