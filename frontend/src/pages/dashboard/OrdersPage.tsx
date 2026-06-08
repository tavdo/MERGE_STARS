import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import DashboardLayout from '../../components/DashboardLayout'
import { ordersApi } from '@/features/orders/api/orders.api'
import { statusLabel } from '@/shared/utils/applicationStatus'

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
  paid: { bg: 'rgba(34,197,94,0.1)', color: '#22c55e' },
  submitted: { bg: 'rgba(201,168,76,0.1)', color: '#c9a84c' },
  in_production: { bg: 'rgba(139,92,246,0.1)', color: '#a78bfa' },
  delivered: { bg: 'rgba(34,197,94,0.15)', color: '#22c55e' },
}

export default function OrdersPage() {
  const { t } = useTranslation()
  const pipeline = t('orders.pipeline', { returnObjects: true }) as string[]
  const headers = t('orders.headers', { returnObjects: true }) as Record<string, string>
  const headerList = [headers.orderId, headers.coin, headers.qty, headers.value, headers.date, headers.payment, headers.status, headers.view]

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.list().then((r) => r.data.data),
  })

  return (
    <DashboardLayout titleKey="orders">
      <div style={{ maxWidth: '1100px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.3em', color: '#c9a84c', marginBottom: '8px' }}>{t('orders.kicker')}</p>
            <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#fff' }}>{t('orders.title')}</h1>
          </div>
          <Link to="/apply" className="gold-btn">{t('orders.newOrder')}</Link>
        </div>

        <div className="gold-card" style={{ padding: '20px 24px', borderRadius: '4px', marginBottom: '24px' }}>
          <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', marginBottom: '12px' }}>{t('orders.stateMachine')}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            {pipeline.map((s, i) => {
              const sc = STATUS_COLORS[s.toLowerCase()] ?? { bg: '#222', color: '#fff' }
              return (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 8px', background: sc.bg, color: sc.color, borderRadius: '2px', letterSpacing: '0.05em' }}>{s}</span>
                  {i < pipeline.length - 1 && <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px' }}>→</span>}
                </div>
              )
            })}
          </div>
        </div>

        <div className="gold-card" style={{ borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            {isLoading ? (
              <p style={{ padding: '24px', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>{t('common.loading', { defaultValue: 'Loading…' })}</p>
            ) : orders.length === 0 ? (
              <div style={{ padding: '32px 24px', textAlign: 'center' }}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '16px' }}>{t('orders.empty', { defaultValue: 'No orders yet' })}</p>
                <Link to="/apply" className="luxury-btn-glass">{t('orders.newOrder')}</Link>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {headerList.map((h) => (
                      <th key={h || 'actions'} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '9px', fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => {
                    const sc = STATUS_COLORS[o.status] ?? { bg: '#222', color: '#fff' }
                    const paid = o.status === 'paid'
                    return (
                      <tr key={o.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '14px 16px', fontSize: '11px', fontWeight: 700, color: '#c9a84c' }}>{o.id}</td>
                        <td style={{ padding: '14px 16px', fontSize: '12px', color: '#fff' }}>{o.coinType ?? '—'}</td>
                        <td style={{ padding: '14px 16px', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{o.quantity ?? '—'}</td>
                        <td style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: '#fff' }}>${Number(o.amount).toLocaleString()}</td>
                        <td style={{ padding: '14px 16px', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 8px', background: paid ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', color: paid ? '#22c55e' : '#f59e0b', borderRadius: '2px' }}>
                            {paid ? t('orders.paymentPaid') : t('orders.paymentPending')}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 8px', background: sc.bg, color: sc.color, borderRadius: '2px' }}>{statusLabel(o.status)}</span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <Link to="/status" style={{ fontSize: '11px', color: '#c9a84c', textDecoration: 'none', fontWeight: 600 }}>{t('orders.viewLink')}</Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
