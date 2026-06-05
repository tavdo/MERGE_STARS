import { useTranslation } from 'react-i18next'
import DashboardLayout from '../../components/DashboardLayout'

const STEP_DATES = ['10/05/2024 09:15', '12/05/2024 14:00', '18/05/2024 10:30', '20/05/2024 09:00', '20/05/2024 15:45', null, null, null]

export default function DeliveryPage() {
  const { t } = useTranslation()
  const steps = (t('delivery.steps', { returnObjects: true }) as { label: string; icon: string }[]).map((s, i) => ({
    ...s,
    done: i < 5,
    current: i === 4,
    date: STEP_DATES[i],
  }))

  return (
    <DashboardLayout titleKey="delivery">
      <div style={{ maxWidth: '900px' }}>
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.3em', color: '#c9a84c', marginBottom: '8px' }}>{t('delivery.kicker')}</p>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#fff' }}>{t('delivery.orderLabel', { id: 'ORD-2024-000122' })}</h1>
        </div>

        <div className="gold-card" style={{ padding: '20px 28px', borderRadius: '4px', display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          {[
            { label: t('delivery.trackingCode'), value: 'MS-TRK-2024-000122', color: '#c9a84c' },
            { label: t('delivery.courier'), value: 'DHL Express', color: '#fff' },
            { label: t('delivery.estDelivery'), value: '24/05/2024', color: '#fff' },
            { label: t('delivery.statusLabel'), value: t('delivery.inTransit'), color: '#f59e0b' },
          ].map((d) => (
            <div key={d.label}>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', marginBottom: '4px' }}>{d.label}</p>
              <p style={{ fontSize: '14px', fontWeight: 700, color: d.color }}>{d.value}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '24px' }}>
          <div className="gold-card" style={{ padding: '28px', borderRadius: '4px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', color: '#c9a84c', marginBottom: '24px' }}>{t('delivery.timeline')}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {steps.map((s, i) => (
                <div key={s.label} style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                      background: s.current ? 'linear-gradient(135deg,#c9a84c,#f5d78e)' : s.done ? 'rgba(201,168,76,0.15)' : '#111',
                      border: s.done && !s.current ? '1px solid rgba(201,168,76,0.3)' : '1px solid rgba(255,255,255,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px',
                      color: s.current ? '#000' : s.done ? '#c9a84c' : 'rgba(255,255,255,0.2)',
                    }}>{s.icon}</div>
                    {i < steps.length - 1 && <div style={{ width: '1px', height: '32px', background: s.done ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.06)', margin: '4px 0' }} />}
                  </div>
                  <div style={{ paddingTop: '6px' }}>
                    <p style={{ fontSize: '12px', fontWeight: s.current ? 700 : 600, color: s.current ? '#c9a84c' : s.done ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)' }}>
                      {s.label}
                      {s.current && <span style={{ marginLeft: '8px', fontSize: '9px', padding: '2px 6px', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', borderRadius: '2px' }}>{t('delivery.current')}</span>}
                    </p>
                    {s.date && <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>{s.date}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="gold-card" style={{ padding: '24px', borderRadius: '4px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', color: '#c9a84c', marginBottom: '16px' }}>{t('delivery.deliveryAddress')}</p>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.8 }}>
                Merge Star<br />123 Luxury Avenue<br />Tbilisi, Georgia 0102<br />+995 555 123 456
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
