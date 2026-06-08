import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import AdminLayout from '../../components/AdminLayout'
import { adminApi } from '../../features/admin/api/admin.api'
import type { CoinApplication } from '@/features/coins/api/coins.api'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function crystalResponse(app: CoinApplication): 'AWAITING' | 'APPROVED' | 'REJECTED' {
  if (app.status === 'approved') return 'APPROVED'
  if (app.status === 'rejected') return 'REJECTED'
  return 'AWAITING'
}

export default function AdminCrystalPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const qc = useQueryClient()

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['admin-crystal'],
    queryFn: async () => {
      const [sent, approved, rejected] = await Promise.all([
        adminApi.getApplications({ status: 'sent_to_crystal', limit: 50 }).then((r) => r.data.data),
        adminApi.getApplications({ status: 'approved', limit: 20 }).then((r) => r.data.data),
        adminApi.getApplications({ status: 'rejected', limit: 20 }).then((r) => r.data.data),
      ])
      const crystalRelated = [...approved, ...rejected].filter((a) => a.crystal === 'Yes' || (a as { crystal?: string }).crystal)
      const ids = new Set<string>()
      return [...sent, ...crystalRelated].filter((a) => {
        if (ids.has(a.id)) return false
        ids.add(a.id)
        return true
      })
    },
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: 'approved' | 'rejected'; note?: string }) =>
      adminApi.updateStatus(id, status, { note }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-crystal'] })
      qc.invalidateQueries({ queryKey: ['admin-applications'] })
      setSelected(null)
    },
  })

  const app = applications.find((a) => a.id === selected)
  const resp = app ? crystalResponse(app) : null

  return (
    <AdminLayout title="ADMIN PANEL" subtitle="CRYSTAL WORKFLOW">
      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 360px' : '1fr', gap: '20px' }}>
        <div className="gold-card" style={{ borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', color: '#c9a84c' }}>APPLICATIONS SENT TO CRYSTAL</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {isLoading ? (
              <p style={{ padding: '24px', color: 'rgba(255,255,255,0.5)' }}>Loading…</p>
            ) : applications.length === 0 ? (
              <p style={{ padding: '24px', color: 'rgba(255,255,255,0.5)' }}>No crystal applications</p>
            ) : applications.map((a) => {
              const response = crystalResponse(a)
              const rc = response === 'APPROVED' ? { bg: 'rgba(34,197,94,0.1)', color: '#22c55e' } : response === 'REJECTED' ? { bg: 'rgba(239,68,68,0.1)', color: '#f87171' } : { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' }
              return (
                <div key={a.id} onClick={() => setSelected(selected === a.id ? null : a.id)}
                  style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', background: selected === a.id ? 'rgba(201,168,76,0.06)' : 'transparent' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#c9a84c' }}>{a.id}</p>
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 8px', background: rc.bg, color: rc.color, borderRadius: '2px' }}>{response}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#fff' }}>{(a as { user?: string }).user ?? '—'} · {a.coinType} · ${Number(a.coinValue).toLocaleString()}</p>
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>Sent: {formatDate(a.submittedAt)}</p>
                </div>
              )
            })}
          </div>
        </div>

        {app && (
          <div className="gold-card" style={{ padding: '24px', borderRadius: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', color: '#c9a84c' }}>CRYSTAL WORKFLOW</p>
              <button onClick={() => setSelected(null)} style={{ color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
              {[
                { n: 1, title: 'SEND TO CRYSTAL', done: true },
                { n: 2, title: 'CRYSTAL CONTACTS USER', done: resp !== 'AWAITING' },
                { n: 3, title: 'UPDATE RESPONSE', done: resp !== 'AWAITING' },
              ].map((s) => (
                <div key={s.n} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: s.done ? 'linear-gradient(135deg,#c9a84c,#f5d78e)' : '#111', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 900, color: s.done ? '#000' : 'rgba(255,255,255,0.3)', flexShrink: 0 }}>{s.n}</div>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: s.done ? '#fff' : 'rgba(255,255,255,0.35)' }}>{s.title}</p>
                </div>
              ))}
            </div>

            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', marginBottom: '20px' }}>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginBottom: '8px' }}>COMMUNICATION LOG</p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                {formatDate(app.submittedAt)} — Sent to Crystal
              </p>
              {(app as { statusNote?: string }).statusNote && (
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', padding: '4px 0' }}>
                  Note: {(app as { statusNote?: string }).statusNote}
                </p>
              )}
              {resp === 'APPROVED' && (
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', padding: '4px 0' }}>Crystal approved</p>
              )}
              {resp === 'REJECTED' && (
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', padding: '4px 0' }}>Crystal rejected</p>
              )}
            </div>

            {resp === 'AWAITING' && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  disabled={updateStatus.isPending}
                  onClick={() => updateStatus.mutate({ id: app.id, status: 'approved', note: 'Approved by Crystal' })}
                  style={{ flex: 1, padding: '11px', background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '2px', cursor: 'pointer', fontSize: '11px', fontWeight: 700, opacity: updateStatus.isPending ? 0.6 : 1 }}
                >
                  ✓ APPROVE
                </button>
                <button
                  disabled={updateStatus.isPending}
                  onClick={() => updateStatus.mutate({ id: app.id, status: 'rejected', note: 'Rejected by Crystal' })}
                  style={{ flex: 1, padding: '11px', background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '2px', cursor: 'pointer', fontSize: '11px', fontWeight: 700, opacity: updateStatus.isPending ? 0.6 : 1 }}
                >
                  ✗ REJECT
                </button>
              </div>
            )}
            {resp && resp !== 'AWAITING' && (
              <div style={{ padding: '12px', background: resp === 'APPROVED' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${resp === 'APPROVED' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`, borderRadius: '2px', textAlign: 'center' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: resp === 'APPROVED' ? '#22c55e' : '#f87171' }}>{resp === 'APPROVED' ? '✓ APPROVED BY CRYSTAL' : '✗ REJECTED BY CRYSTAL'}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
