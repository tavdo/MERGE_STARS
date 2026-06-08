import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { metalsApi } from '@/features/coins/api/metals.api'

export default function PriceIndicatorPage() {
  const { t } = useTranslation()
  const { data: metals } = useQuery({
    queryKey: ['metals-live'],
    queryFn: () => metalsApi.getLive().then((r) => r.data.data),
    refetchInterval: 60_000,
  })

  const silver = metals?.find((m) => m.metal === 'silver')
  const gold = metals?.find((m) => m.metal === 'gold')
  const silverSpot = silver?.priceUsd ?? 1.09
  const goldSpot = gold?.priceUsd ?? 139.1
  const [lastUpdated, setLastUpdated] = useState(t('prices.justNow'))
  const indicator = (silverSpot * 1000 * 2).toFixed(2)
  const methodologySteps = t('prices.methodologySteps', { returnObjects: true }) as string[]
  const disclaimerItems = t('prices.disclaimerItems', { returnObjects: true }) as string[]

  useEffect(() => {
    if (metals) setLastUpdated(t('prices.justNow'))
  }, [metals, t])

  return (
    <div style={{ background: '#080808', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ paddingTop: '110px' }}>
        <section style={{ textAlign: 'center', padding: '80px 32px 60px', maxWidth: '700px', margin: '0 auto' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.3em', color: '#c9a84c', marginBottom: '16px' }}>{t('prices.reference')}</p>
          <h1 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900, color: '#fff', marginBottom: '16px', lineHeight: 1.1 }}>
            {t('prices.title')}<br /><span className="gold-text">{t('prices.titleGold')}</span>
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>{t('prices.intro')}</p>
        </section>

        <section style={{ maxWidth: '700px', margin: '0 auto', padding: '0 32px 30px' }}>
          <div className="gold-card" style={{ padding: '22px', borderRadius: '4px' }}>
            <h3 style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.2em', color: '#c9a84c', marginBottom: '12px' }}>{t('prices.methodology')}</h3>
            {methodologySteps.map((line) => (
              <p key={line} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', margin: '6px 0' }}>{line}</p>
            ))}
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: '14px', lineHeight: 1.65 }}>{t('prices.methodologyNote')}</p>
          </div>
        </section>

        <section style={{ maxWidth: '700px', margin: '0 auto', padding: '0 32px 60px' }}>
          <div className="gold-card" style={{ padding: '48px', borderRadius: '4px', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '32px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} className="animate-pulse" />
              <span style={{ fontSize: '11px', color: '#22c55e', fontWeight: 600, letterSpacing: '0.15em' }}>{t('prices.liveUpdated', { time: lastUpdated })}</span>
            </div>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.2em', marginBottom: '8px' }}>{t('landing.metalGold')}</p>
            <p style={{ fontSize: '32px', fontWeight: 900, color: '#fff', marginBottom: '24px' }}>
              ${(goldSpot * 1000).toFixed(0)}<span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginLeft: '4px' }}>/kg</span>
            </p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.2em', marginBottom: '8px' }}>{t('prices.silverSpot')}</p>
            <p style={{ fontSize: '42px', fontWeight: 900, color: '#fff', marginBottom: '32px' }}>
              ${(silverSpot * 1000).toFixed(2)}<span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.4)', marginLeft: '4px' }}>/kg</span>
            </p>
            <div style={{ height: '1px', background: 'linear-gradient(90deg,transparent,rgba(201,168,76,0.3),transparent)', margin: '0 0 32px' }} />
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.2em', marginBottom: '8px' }}>{t('prices.formula')}</p>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', marginBottom: '32px' }}>{t('prices.formulaText')}</p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.2em', marginBottom: '12px' }}>{t('prices.indicatorLabel')}</p>
            <p style={{ fontSize: '64px', fontWeight: 900 }} className="gold-text">${indicator}</p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '8px' }}>{t('prices.usdIndicative')}</p>
            <div style={{ marginTop: '32px', padding: '16px', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: '2px' }}>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>{t('prices.sourceNote')}</p>
            </div>
          </div>
        </section>

        <section style={{ maxWidth: '700px', margin: '0 auto', padding: '0 32px 80px' }}>
          <div style={{ padding: '32px', background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.2em', color: '#c9a84c', marginBottom: '16px' }}>{t('prices.disclaimerTitle')}</h3>
            {disclaimerItems.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ color: '#c9a84c', flexShrink: 0, fontSize: '12px', marginTop: '2px' }}>•</span>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{item}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  )
}
