import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import AdminLayout from '../../components/AdminLayout'
import { adminApi } from '@/features/admin/api/admin.api'

export default function AdminAnalyticsPage() {
  const { t } = useTranslation()

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => adminApi.getAnalytics().then((r) => r.data.data),
    refetchInterval: 60_000,
  })

  const stats = data?.stats ?? []
  const monthly = data?.monthly ?? []
  const countries = data?.countries ?? []
  const funnel = data?.funnel ?? []
  const maxRevenue = Math.max(...monthly.map((m) => m.revenue), 1)

  return (
    <AdminLayout title={t('admin.panel')} subtitle={t('admin.analytics.subtitle')}>
      {isLoading && (
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '16px' }}>Loading live analytics…</p>
      )}
      {error && (
        <p style={{ color: '#f87171', marginBottom: '16px' }}>Could not load analytics.</p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '14px', marginBottom: '28px' }}>
        {stats.map((s) => (
          <div key={s.label} className="gold-card" style={{ padding: '16px 18px', borderRadius: '4px' }}>
            <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.35)', marginBottom: '8px' }}>{s.label}</p>
            <p style={{ fontSize: '22px', fontWeight: 900, color: s.color, marginBottom: '4px' }}>{s.value}</p>
            <p style={{ fontSize: '10px', fontWeight: 600, color: s.up ? '#22c55e' : '#f87171' }}>{s.change} this month</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: '20px', marginBottom: '20px' }}>
        <div className="gold-card" style={{ padding: '24px', borderRadius: '4px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', color: '#c9a84c', marginBottom: '20px' }}>MONTHLY REVENUE</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '160px' }}>
            {monthly.map((m, i) => (
              <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                <p style={{ fontSize: '10px', color: '#c9a84c', fontWeight: 700 }}>${(m.revenue / 1000).toFixed(1)}k</p>
                <div
                  style={{
                    width: '100%', borderRadius: '2px 2px 0 0',
                    height: `${(m.revenue / maxRevenue) * 120}px`,
                    background: i === monthly.length - 1 ? 'linear-gradient(180deg,#c9a84c,#f5d78e)' : 'rgba(201,168,76,0.25)',
                    transition: 'height 0.5s ease',
                  }}
                />
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>{m.month}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="gold-card" style={{ padding: '24px', borderRadius: '4px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', color: '#c9a84c', marginBottom: '20px' }}>MONTHLY ORDERS</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '160px' }}>
            {monthly.map((m, i) => {
              const max = Math.max(...monthly.map((x) => x.orders), 1)
              return (
                <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                  <p style={{ fontSize: '10px', color: '#60a5fa', fontWeight: 700 }}>{m.orders}</p>
                  <div style={{ width: '100%', borderRadius: '2px 2px 0 0', height: `${(m.orders / max) * 120}px`, background: i === monthly.length - 1 ? 'linear-gradient(180deg,#3b82f6,#60a5fa)' : 'rgba(59,130,246,0.2)', transition: 'height 0.5s ease' }} />
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>{m.month}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '20px' }}>
        <div className="gold-card" style={{ padding: '24px', borderRadius: '4px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', color: '#c9a84c', marginBottom: '20px' }}>USER DISTRIBUTION BY COUNTRY</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {countries.length === 0 ? (
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>No user phone data yet.</p>
            ) : countries.map((c) => (
              <div key={c.country}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '12px', color: '#fff', fontWeight: 600 }}>{c.country}</span>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{c.count} · {c.pct}%</span>
                </div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px' }}>
                  <div style={{ height: '100%', width: `${c.pct}%`, background: 'linear-gradient(90deg,#c9a84c,#f5d78e)', borderRadius: '2px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="gold-card" style={{ padding: '24px', borderRadius: '4px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', color: '#c9a84c', marginBottom: '20px' }}>CONVERSION FUNNEL</p>
          {funnel.map((f) => (
            <div key={f.stage} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{f.stage}</span>
                <span style={{ fontSize: '11px', color: '#c9a84c', fontWeight: 700 }}>{f.count} ({f.pct}%)</span>
              </div>
              <div style={{ height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }}>
                <div style={{ height: '100%', width: `${f.pct}%`, background: `rgba(201,168,76,${Math.max(f.pct / 100, 0.15)})`, borderRadius: '2px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
