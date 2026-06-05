import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '../../components/DashboardLayout'

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  DRAFT: { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' },
  SUBMITTED: { bg: 'rgba(201,168,76,0.1)', color: '#c9a84c' },
  INVOICE: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
  PAYMENT_PENDING: { bg: 'rgba(59,130,246,0.1)', color: '#60a5fa' },
  APPROVED: { bg: 'rgba(34,197,94,0.1)', color: '#22c55e' },
  PRODUCTION: { bg: 'rgba(139,92,246,0.1)', color: '#a78bfa' },
  QC: { bg: 'rgba(20,184,166,0.1)', color: '#2dd4bf' },
  READY: { bg: 'rgba(34,197,94,0.1)', color: '#4ade80' },
  DELIVERED: { bg: 'rgba(34,197,94,0.15)', color: '#22c55e' },
  COMPLETED: { bg: 'rgba(201,168,76,0.12)', color: '#c9a84c' },
}

const ORDERS = [
  { id: 'ORD-2024-000123', coin: 'Silver Coin (1KG)', qty: 1, value: '$2,450', date: '10/05/2024', status: 'SUBMITTED', payment: 'PENDING' },
  { id: 'ORD-2024-000122', coin: 'Gold Coin (1KG)', qty: 1, value: '$8,900', date: '08/05/2024', status: 'PRODUCTION', payment: 'PAID' },
  { id: 'ORD-2024-000121', coin: 'Silver Coin (2KG)', qty: 2, value: '$4,900', date: '01/05/2024', status: 'DELIVERED', payment: 'PAID' },
  { id: 'ORD-2024-000120', coin: 'Silver Coin (1KG)', qty: 1, value: '$2,450', date: '15/04/2024', status: 'COMPLETED', payment: 'PAID' },
]

export default function OrdersPage() {
  const { t } = useTranslation()
  const pipeline = t('orders.pipeline', { returnObjects: true }) as string[]
  const headers = t('orders.headers', { returnObjects: true }) as Record<string, string>
  const headerList = [headers.orderId, headers.coin, headers.qty, headers.value, headers.date, headers.payment, headers.status, headers.view]

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
              const sc = STATUS_COLORS[s] ?? { bg: '#222', color: '#fff' }
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
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {headerList.map((h) => (
                    <th key={h || 'actions'} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '9px', fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ORDERS.map((o) => {
                  const sc = STATUS_COLORS[o.status] ?? { bg: '#222', color: '#fff' }
                  const paid = o.payment === 'PAID'
                  return (
                    <tr key={o.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '14px 16px', fontSize: '11px', fontWeight: 700, color: '#c9a84c' }}>{o.id}</td>
                      <td style={{ padding: '14px 16px', fontSize: '12px', color: '#fff' }}>{o.coin}</td>
                      <td style={{ padding: '14px 16px', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{o.qty}</td>
                      <td style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: '#fff' }}>{o.value}</td>
                      <td style={{ padding: '14px 16px', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{o.date}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 8px', background: paid ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', color: paid ? '#22c55e' : '#f59e0b', borderRadius: '2px' }}>
                          {paid ? t('orders.paymentPaid') : t('orders.paymentPending')}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 8px', background: sc.bg, color: sc.color, borderRadius: '2px' }}>{o.status}</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <Link to="/status" style={{ fontSize: '11px', color: '#c9a84c', textDecoration: 'none', fontWeight: 600 }}>{t('orders.viewLink')}</Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
