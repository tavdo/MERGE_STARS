import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import DashboardLayout from '../../components/DashboardLayout'
import { investmentsApi } from '@/features/investments/api/investments.api'

export default function InvestmentsPage() {
  const { t } = useTranslation()

  const { data: summary } = useQuery({
    queryKey: ['investments-summary'],
    queryFn: () => investmentsApi.getSummary().then((r) => r.data.data),
  })

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['investments'],
    queryFn: () => investmentsApi.getAll().then((r) => r.data.data),
  })

  return (
    <DashboardLayout titleKey="investments">
      <div style={{ maxWidth: '900px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.3em', color: '#c9a84c', marginBottom: '8px' }}>PRODUCT REGISTRY</p>
        <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#fff', marginBottom: '24px' }}>{t('dashboard.titles.investments')}</h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '16px', marginBottom: '24px' }}>
          <div className="gold-card" style={{ padding: '18px 20px', borderRadius: '4px' }}>
            <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.35)', marginBottom: '8px' }}>REGISTERED VALUE</p>
            <p style={{ fontSize: '24px', fontWeight: 900, color: '#c9a84c' }}>${(summary?.totalUsd ?? 0).toLocaleString()}</p>
          </div>
          <div className="gold-card" style={{ padding: '18px 20px', borderRadius: '4px' }}>
            <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.35)', marginBottom: '8px' }}>ENTRIES</p>
            <p style={{ fontSize: '24px', fontWeight: 900, color: '#fff' }}>{rows.length}</p>
          </div>
        </div>

        <div className="gold-card" style={{ borderRadius: '4px', overflow: 'hidden' }}>
          {isLoading ? (
            <p style={{ padding: '24px', color: 'rgba(255,255,255,0.5)' }}>{t('common.loading')}</p>
          ) : rows.length === 0 ? (
            <p style={{ padding: '24px', color: 'rgba(255,255,255,0.5)' }}>No registry entries yet. Submit an application to begin.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['APPLICATION', 'VALUE', 'DATE'].map((h) => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#c9a84c' }}>{r.applicationId}</td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#fff' }}>${Number(r.amountUsd).toLocaleString()}</td>
                    <td style={{ padding: '12px 16px', fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>{new Date(r.createdAt).toLocaleDateString('en-GB')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ marginTop: '20px' }}>
          <Link to="/apply" className="gold-btn">New application →</Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
