import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '../components/DashboardLayout'
import CustomSelect from '../components/CustomSelect'

const COIN_META = [
  { metalPrice: 0.897, metalKey: 'application.metals.silver' as const },
  { metalPrice: 67.42, metalKey: 'application.metals.gold' as const },
  { metalPrice: 32.15, metalKey: 'application.metals.platinum' as const },
]

const LIVE_PRICES = [
  { nameKey: 'application.metals.silver' as const, price: 0.897, change: '+1.23%' },
  { nameKey: 'application.metals.gold' as const, price: 67.42, change: '+0.85%' },
]

export default function CalculatorPage() {
  const { t } = useTranslation()
  const coinLabels = t('application.coinTypes', { returnObjects: true }) as string[]

  const [coinIdx, setCoinIdx] = useState(0)
  const [weight, setWeight] = useState(1000)
  const [purity, setPurity] = useState(99.9)

  const coin = COIN_META[coinIdx] ?? COIN_META[0]
  const metalValue = (coin.metalPrice * weight * purity) / 100
  const mfgFee = 1200
  const platformFee = 153
  const totalValue = metalValue + mfgFee + platformFee

  const downPayment = totalValue * 0.2
  const toFinance = totalValue - downPayment
  const monthly = (toFinance / 12).toFixed(2)

  return (
    <DashboardLayout titleKey="calculator">
      <div className="apply-flow-wrap apply-flow-max space-y-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="landing-sans-head mb-2">{t('calculator.kicker')}</p>
            <h2 className="font-serif-display text-2xl sm:text-3xl tracking-wide text-[#f5f2eb]">
              {t('calculator.title')}
            </h2>
            <p className="apply-lead mt-2">{t('calculator.lead')}</p>
          </div>
          <div className="calc-live-badge">
            <span className="dash-pulse-dot shrink-0" style={{ background: '#4ade80', boxShadow: 'none' }} />
            {t('calculator.livePrices')}
          </div>
        </header>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10">
          <div className="lg:col-span-4 space-y-6">
            <section className="apply-surface p-7 sm:p-8">
              <p className="dash-label mb-6">{t('calculator.configuration')}</p>

              <div className="space-y-7">
                <div>
                  <label className="apply-label" htmlFor="calc-coin">
                    {t('calculator.coinType')}
                  </label>
                  <CustomSelect
                    id="calc-coin"
                    aria-label={t('calculator.coinType')}
                    value={coinIdx}
                    onChange={(v) => setCoinIdx(Number(v))}
                    options={COIN_META.map((_, i) => ({
                      value: i,
                      label: coinLabels[i] ?? `Coin ${i + 1}`,
                    }))}
                  />
                </div>

                <div>
                  <label className="apply-label">
                    {t('calculator.weightLabel', { weight: weight.toLocaleString() })}
                  </label>
                  <input
                    type="range"
                    className="calc-range w-full"
                    min={100}
                    max={5000}
                    step={100}
                    value={weight}
                    onChange={(e) => setWeight(+e.target.value)}
                  />
                  <div className="flex justify-between mt-2 text-[10px] tracking-wide text-neutral-600">
                    <span>{t('calculator.weightMin')}</span>
                    <span>{t('calculator.weightMax')}</span>
                  </div>
                </div>

                <div>
                  <label className="apply-label">
                    {t('calculator.purityLabel', { purity })}
                  </label>
                  <input
                    type="range"
                    className="calc-range w-full"
                    min={50}
                    max={99.9}
                    step={0.1}
                    value={purity}
                    onChange={(e) => setPurity(+e.target.value)}
                  />
                  <div className="flex justify-between mt-2 text-[10px] tracking-wide text-neutral-600">
                    <span>50%</span>
                    <span>99.9%</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="apply-surface-sidebar p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="dash-label mb-0">{t('calculator.marketFeed')}</p>
                <span className="text-[9px] tracking-[0.14em] uppercase text-emerald-400/80">{t('calculator.live')}</span>
              </div>
              <ul className="space-y-3">
                {LIVE_PRICES.map((p) => (
                  <li key={p.nameKey} className="flex justify-between items-baseline gap-4">
                    <span className="text-[11px] text-neutral-400 tracking-wide">{t(p.nameKey)}</span>
                    <div className="text-right">
                      <p className="text-[11px] font-medium text-[#D4AF37]">
                        {t('calculator.perGram', { price: p.price })}
                      </p>
                      <p className="text-[10px] text-emerald-400/80">{p.change}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <Link to="/price-indicator" className="dash-text-link inline-block mt-5">
                {t('calculator.fullIndicator')}
              </Link>
            </section>
          </div>

          <section className="apply-surface p-8 sm:p-10 lg:col-span-5 flex flex-col">
            <p className="dash-label mb-8 text-center">{t('calculator.calculatedValue')}</p>
            <p className="calc-hero-value text-center">
              ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
            <p className="text-center text-[11px] tracking-wide text-neutral-500 mt-2 mb-10">
              {weight.toLocaleString()} g · {t(coin.metalKey)}
            </p>

            <div className="space-y-0 flex-1">
              {[
                { label: t('calculator.metalValue'), value: `$${metalValue.toFixed(2)}` },
                { label: t('calculator.manufacturing'), value: `$${mfgFee.toLocaleString()}` },
                { label: t('calculator.platformFee'), value: `$${platformFee}` },
              ].map((r) => (
                <div key={r.label} className="preview-row">
                  <span className="preview-muted">{r.label}</span>
                  <span className="preview-value">{r.value}</span>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-center tracking-wide text-neutral-600 mt-8 leading-relaxed">
              {t('calculator.pricingNote')}
            </p>
          </section>

          <section className="apply-surface-sidebar p-7 sm:p-8 lg:col-span-3 flex flex-col lg:sticky lg:top-6">
            <p className="dash-label mb-2">{t('calculator.financingPreview')}</p>
            <p className="text-[10px] text-neutral-600 tracking-wide mb-6">{t('calculator.providedByCrystal')}</p>

            {[
              { label: t('application.coinValue'), value: `$${totalValue.toFixed(2)}` },
              { label: t('application.downPayment20'), value: `$${downPayment.toFixed(2)}` },
              { label: t('application.amountFinance'), value: `$${toFinance.toFixed(2)}` },
              { label: t('calculator.term'), value: t('application.term12') },
              { label: t('application.estMonthly'), value: `$${monthly}` },
            ].map((r) => (
              <div key={r.label} className="preview-row">
                <span className="preview-muted">{r.label}</span>
                <span className="preview-value">{r.value}</span>
              </div>
            ))}

            <p className="apply-preview-note mt-4">{t('calculator.estimateNote')}</p>

            <Link to="/apply" className="luxury-btn-glass w-full justify-center mt-auto pt-6">
              {t('calculator.applyFinancing')}
            </Link>
          </section>
        </div>
      </div>
    </DashboardLayout>
  )
}
