import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import DashboardLayout from '../components/DashboardLayout'
import FlowStepper from '../components/FlowStepper'
import CustomSelect from '../components/CustomSelect'
import { coinsApi } from '@/features/coins/api/coins.api'

type Step = 1 | 2 | 3 | 4

export default function ApplicationPage() {
  const { t } = useTranslation()
  const coinTypes = t('application.coinTypes', { returnObjects: true }) as string[]
  const stepLabels = t('application.steps', { returnObjects: true }) as string[]
  const stepGuide = t('application.guides', { returnObjects: true }) as { title: string; blurb: string }[]

  const [step, setStep] = useState<Step>(1)
  const [coinType, setCoinType] = useState(coinTypes[0] ?? '')
  const [quantity, setQuantity] = useState(1)
  const navigate = useNavigate()

  const coinValue = 2450
  const downPayment = coinValue * 0.2
  const toFinance = coinValue - downPayment
  const monthly = (toFinance / 12).toFixed(2)

  const submitApp = useMutation({
    mutationFn: () =>
      coinsApi.submitApplication({
        coinType,
        quantity,
        metalPurity: 999,
        coinValue: coinValue,
      }),
    onSuccess: () => navigate('/status'),
  })

  const idx = step - 1

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
                      value={coinType}
                      onChange={(v) => setCoinType(String(v))}
                      options={coinTypes.map((c) => ({ value: c, label: c }))}
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
                        onChange={(e) => setQuantity(+e.target.value)}
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
                      <select id="apply-metal" className="apply-field">
                        <option>{t('application.metals.silver')}</option>
                        <option>{t('application.metals.gold')}</option>
                        <option>{t('application.metals.platinum')}</option>
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
                      <input id="apply-fn" className="apply-field" placeholder={t('application.placeholderId')} />
                    </div>
                    <div>
                      <label className="apply-label" htmlFor="apply-ln">
                        {t('application.lastName')}
                      </label>
                      <input id="apply-ln" className="apply-field" placeholder={t('application.placeholderId')} />
                    </div>
                  </div>
                  <div>
                    <label className="apply-label" htmlFor="apply-idn">
                      {t('application.personalId')}
                    </label>
                    <input id="apply-idn" className="apply-field" placeholder={t('application.placeholderPassport')} />
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
                      >
                        <option>🇬🇪 +995</option>
                        <option>🇺🇸 +1</option>
                      </select>
                      <input id="apply-phone-after" className="apply-field flex-1" placeholder={t('application.placeholderMobile')} />
                    </div>
                  </div>
                  <div>
                    <label className="apply-label" htmlFor="apply-email">
                      {t('application.email')}
                    </label>
                    <input id="apply-email" className="apply-field" type="email" placeholder={t('application.placeholderEmail')} />
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
                    <select id="apply-fin" className="apply-field">
                      <option>{t('application.fullPaymentOpt')}</option>
                      <option>{t('application.bank12')}</option>
                      <option>{t('application.bank24')}</option>
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
                    { label: t('application.summaryFinancing'), value: t('application.bankFinancing12') },
                  ].map((r) => (
                    <div key={r.label} className="preview-row">
                      <span className="preview-muted">{r.label}</span>
                      <span className="preview-value text-right">{r.value}</span>
                    </div>
                  ))}
                  <div className="pt-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" className="mt-1 w-4 h-4 shrink-0 accent-[#d4af37]" />
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
                      onClick={() => setStep((s) => (s + 1) as Step)}
                      className={`luxury-btn-glass justify-center ${step > 1 ? 'flex-1' : 'w-full sm:flex-1'}`}
                    >
                      {t('application.continueBtn')}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={submitApp.isPending}
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
                { label: t('application.coinValue'), value: `$${coinValue.toLocaleString()}.00` },
                { label: t('application.downPayment20'), value: `$${downPayment.toFixed(2)}` },
                { label: t('application.amountFinance'), value: `$${toFinance.toFixed(2)}` },
                { label: t('application.financingTerm'), value: t('application.term12') },
                { label: t('application.estMonthly'), value: `$${monthly}` },
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
