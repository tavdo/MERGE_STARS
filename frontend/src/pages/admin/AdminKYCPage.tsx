import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import AdminLayout from '../../components/AdminLayout'
import { adminApi, type AdminUser } from '../../features/admin/api/admin.api'
import { kycApi } from '@/features/kyc/api/kyc.api'

const KYC_COLORS: Record<string, { bg: string; color: string }> = {
  pending: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
  verified: { bg: 'rgba(34,197,94,0.1)', color: '#22c55e' },
  rejected: { bg: 'rgba(239,68,68,0.1)', color: '#f87171' },
}

export default function AdminKYCPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const qc = useQueryClient()

  const { data: pendingUsers = [], isLoading } = useQuery({
    queryKey: ['admin-kyc-pending'],
    queryFn: () => adminApi.getUsers({ kycStatus: 'pending' }).then((r) => r.data.data),
  })

  const { data: allUsers = [] } = useQuery({
    queryKey: ['admin-kyc-stats'],
    queryFn: () => adminApi.getUsers().then((r) => r.data.data),
  })

  const updateKyc = useMutation({
    mutationFn: ({ id, kycStatus }: { id: string; kycStatus: 'verified' | 'rejected' }) =>
      adminApi.updateKyc(id, kycStatus),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-kyc-pending'] })
      qc.invalidateQueries({ queryKey: ['admin-kyc-stats'] })
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      setSelected(null)
    },
  })

  const stats = useMemo(() => ({
    pending: allUsers.filter((u) => (u.kycStatus ?? 'pending').toLowerCase() === 'pending').length,
    verified: allUsers.filter((u) => u.kycStatus?.toLowerCase() === 'verified').length,
    rejected: allUsers.filter((u) => u.kycStatus?.toLowerCase() === 'rejected').length,
  }), [allUsers])

  const item = pendingUsers.find((q) => q.id === selected)

  const { data: kycDocs = [] } = useQuery({
    queryKey: ['admin-kyc-docs', item?.id],
    queryFn: () => kycApi.adminList(item!.id).then((r) => r.data.data),
    enabled: !!item?.id,
  })

  const decide = (user: AdminUser, decision: 'verified' | 'rejected') => {
    updateKyc.mutate({ id: user.id, kycStatus: decision })
  }

  return (
    <AdminLayout title="ADMIN PANEL" subtitle="KYC VERIFICATION">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'PENDING', value: stats.pending, color: '#f59e0b' },
          { label: 'VERIFIED', value: stats.verified, color: '#22c55e' },
          { label: 'REJECTED', value: stats.rejected, color: '#f87171' },
        ].map((s) => (
          <div key={s.label} className="gold-card" style={{ padding: '18px 20px', borderRadius: '4px' }}>
            <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.35)', marginBottom: '8px' }}>{s.label}</p>
            <p style={{ fontSize: '28px', fontWeight: 900, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 360px' : '1fr', gap: '20px' }}>
        <div className="gold-card" style={{ borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', color: '#c9a84c' }}>KYC VERIFICATION QUEUE</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {isLoading ? (
              <p style={{ padding: '24px', color: 'rgba(255,255,255,0.5)' }}>Loading…</p>
            ) : pendingUsers.length === 0 ? (
              <p style={{ padding: '24px', color: 'rgba(255,255,255,0.5)' }}>No pending KYC requests</p>
            ) : pendingUsers.map((q) => {
              const st = (q.kycStatus ?? 'pending').toLowerCase()
              const colors = KYC_COLORS[st] ?? KYC_COLORS.pending
              return (
                <div key={q.id}
                  style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', background: selected === q.id ? 'rgba(201,168,76,0.06)' : 'transparent', transition: 'background 0.15s' }}
                  onClick={() => setSelected(selected === q.id ? null : q.id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>{q.name}</p>
                      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{q.mergeId} · Joined: {q.joined}</p>
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '4px 10px', background: colors.bg, color: colors.color, borderRadius: '2px' }}>{st.toUpperCase()}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {item && (
          <div className="gold-card" style={{ padding: '24px', borderRadius: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', color: '#c9a84c' }}>KYC DETAILS</p>
              <button onClick={() => setSelected(null)} style={{ color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
            {[
              { label: 'Full Name', value: item.name },
              { label: 'Merge ID', value: item.mergeId },
              { label: 'ID Number', value: item.personalId ?? '—' },
              { label: 'Phone', value: item.phone ?? '—' },
              { label: 'Email', value: item.email },
              { label: 'Registered', value: item.joined },
            ].map((d) => (
              <div key={d.label} style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em' }}>{d.label}</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{d.value}</span>
              </div>
            ))}

            <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px' }}>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>ID DOCUMENTS</p>
              {kycDocs.length === 0 ? (
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>No documents uploaded yet</p>
              ) : (
                kycDocs.map((d) => (
                  <a
                    key={d.id}
                    href={kycApi.adminFileUrl(d.id)}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'block', fontSize: '12px', color: '#c9a84c', padding: '6px 0', textDecoration: 'none' }}
                  >
                    📄 {d.originalName}
                  </a>
                ))
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                disabled={updateKyc.isPending}
                onClick={() => decide(item, 'verified')}
                style={{ flex: 1, padding: '12px', background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '2px', cursor: 'pointer', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', opacity: updateKyc.isPending ? 0.6 : 1 }}
              >
                ✓ VERIFY
              </button>
              <button
                disabled={updateKyc.isPending}
                onClick={() => decide(item, 'rejected')}
                style={{ flex: 1, padding: '12px', background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '2px', cursor: 'pointer', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', opacity: updateKyc.isPending ? 0.6 : 1 }}
              >
                ✗ REJECT
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
