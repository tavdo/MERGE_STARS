import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import AdminLayout from '../../components/AdminLayout'
import { adminApi } from '../../features/admin/api/admin.api'

const KYC_COLORS: Record<string, { bg: string; color: string }> = {
  verified: { bg: 'rgba(34,197,94,0.1)', color: '#22c55e' },
  pending: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
  rejected: { bg: 'rgba(239,68,68,0.1)', color: '#f87171' },
}

export default function AdminUsersPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [kycFilter, setKycFilter] = useState('all')

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users', search],
    queryFn: () => adminApi.getUsers(search.trim() || undefined).then((r) => r.data.data),
  })

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const kyc = u.kycStatus?.toLowerCase() ?? 'pending'
      return kycFilter === 'all' || kyc === kycFilter
    })
  }, [users, kycFilter])

  const stats = useMemo(() => {
    const pending = users.filter((u) => (u.kycStatus ?? 'pending').toLowerCase() === 'pending').length
    const verified = users.filter((u) => u.kycStatus?.toLowerCase() === 'verified').length
    const rejected = users.filter((u) => u.kycStatus?.toLowerCase() === 'rejected').length
    return { total: users.length, pending, verified, rejected }
  }, [users])

  return (
    <AdminLayout title="ADMIN PANEL" subtitle="USER MANAGEMENT">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'TOTAL USERS', value: stats.total, color: '#fff' },
          { label: 'VERIFIED', value: stats.verified, color: '#22c55e' },
          { label: 'PENDING KYC', value: stats.pending, color: '#f59e0b' },
          { label: 'REJECTED', value: stats.rejected, color: '#f87171' },
        ].map((s) => (
          <div key={s.label} className="gold-card" style={{ padding: '18px 20px', borderRadius: '4px' }}>
            <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.35)', marginBottom: '8px' }}>{s.label}</p>
            <p style={{ fontSize: '28px', fontWeight: 900, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="gold-card" style={{ borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: '12px', padding: '16px 20px', borderBottom: '1px solid rgba(201,168,76,0.1)', flexWrap: 'wrap' }}>
          <input
            className="gold-input"
            style={{ width: '220px' }}
            placeholder={t('admin.users.searchPlaceholder', { defaultValue: 'Search by name, email, ID...' })}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="gold-input" style={{ width: '140px' }} value={kycFilter} onChange={(e) => setKycFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="verified">VERIFIED</option>
            <option value="pending">PENDING</option>
            <option value="rejected">REJECTED</option>
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          {isLoading ? (
            <p style={{ padding: '24px', color: 'rgba(255,255,255,0.5)' }}>Loading…</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['MERGE ID', 'NAME', 'EMAIL', 'PHONE', 'KYC', 'JOINED', 'STATUS'].map((h) => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '9px', fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const kycKey = (u.kycStatus ?? 'pending').toLowerCase()
                  const kc = KYC_COLORS[kycKey] ?? KYC_COLORS.pending
                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#c9a84c' }}>{u.mergeId}</td>
                      <td style={{ padding: '12px 16px', fontSize: '12px', color: '#fff', fontWeight: 600 }}>{u.name}</td>
                      <td style={{ padding: '12px 16px', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{u.email}</td>
                      <td style={{ padding: '12px 16px', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{u.phone ?? '—'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 8px', background: kc.bg, color: kc.color, borderRadius: '2px', textTransform: 'uppercase' }}>{u.kycStatus}</span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{u.joined}</td>
                      <td style={{ padding: '12px 16px', fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>{u.status}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
