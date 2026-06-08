import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import AdminLayout from '../../components/AdminLayout'
import { adminApi } from '../../features/admin/api/admin.api'
import type { ApplicationStatus } from '@/shared/types/api.types'

const PRODUCTION_STATUSES: ApplicationStatus[] = [
  'production_queue',
  'in_production',
  'quality_check',
  'ready',
  'delivered',
]

const STATUS_DISPLAY: Record<string, string> = {
  production_queue: 'WAITING',
  in_production: 'IN_PRODUCTION',
  quality_check: 'QC',
  ready: 'READY',
  delivered: 'DELIVERED',
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  WAITING:       { bg: 'rgba(255,255,255,0.06)',  color: 'rgba(255,255,255,0.4)' },
  IN_PRODUCTION: { bg: 'rgba(139,92,246,0.1)',    color: '#a78bfa' },
  QC:            { bg: 'rgba(20,184,166,0.1)',    color: '#2dd4bf' },
  READY:         { bg: 'rgba(34,197,94,0.1)',     color: '#4ade80' },
  DELIVERED:     { bg: 'rgba(34,197,94,0.15)',    color: '#22c55e' },
}

const PROGRESS: Record<string, number> = {
  production_queue: 0,
  in_production: 60,
  quality_check: 90,
  ready: 100,
  delivered: 100,
}

const NEXT_STATUS: Partial<Record<ApplicationStatus, ApplicationStatus>> = {
  production_queue: 'in_production',
  in_production: 'quality_check',
  quality_check: 'ready',
  ready: 'delivered',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB')
}

export default function AdminProductionPage() {
  const qc = useQueryClient()

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['admin-production'],
    queryFn: () => adminApi.getApplications({ limit: 100 }).then((r) => r.data.data),
    select: (apps) => apps.filter((a) => PRODUCTION_STATUSES.includes(a.status as ApplicationStatus)),
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ApplicationStatus }) =>
      adminApi.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-production'] })
      qc.invalidateQueries({ queryKey: ['admin-applications'] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })

  const queue = useMemo(() => applications.map((a) => {
    const display = STATUS_DISPLAY[a.status] ?? a.status.toUpperCase()
    return {
      id: a.id,
      user: (a as { user?: string }).user ?? '—',
      coin: a.coinType,
      value: `$${Number(a.coinValue).toLocaleString()}`,
      status: display,
      rawStatus: a.status as ApplicationStatus,
      progress: PROGRESS[a.status] ?? 0,
      start: formatDate(a.submittedAt),
      eta: a.updatedAt ? formatDate(a.updatedAt) : '—',
    }
  }), [applications])

  const statCounts = useMemo(() => {
    const counts: Record<string, number> = { WAITING: 0, IN_PRODUCTION: 0, QC: 0, READY: 0 }
    queue.forEach((q) => {
      if (q.status in counts) counts[q.status]++
    })
    return counts
  }, [queue])

  const advance = (id: string, current: ApplicationStatus) => {
    const next = NEXT_STATUS[current]
    if (next) updateStatus.mutate({ id, status: next })
  }

  return (
    <AdminLayout title="ADMIN PANEL" subtitle="PRODUCTION MANAGEMENT">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '16px', marginBottom: '24px' }}>
        {Object.entries(statCounts).map(([status, count]) => {
          const sc = STATUS_COLORS[status]
          return (
            <div key={status} className="gold-card" style={{ padding: '18px 20px', borderRadius: '4px' }}>
              <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.35)', marginBottom: '8px' }}>{status}</p>
              <p style={{ fontSize: '28px', fontWeight: 900, color: sc.color }}>{count}</p>
            </div>
          )
        })}
      </div>

      <div className="gold-card" style={{ borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(201,168,76,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', color: '#c9a84c' }}>PRODUCTION QUEUE</p>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{queue.length} orders</span>
        </div>
        {isLoading ? (
          <p style={{ padding: '24px', color: 'rgba(255,255,255,0.5)' }}>Loading…</p>
        ) : queue.length === 0 ? (
          <p style={{ padding: '24px', color: 'rgba(255,255,255,0.5)' }}>No production orders</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {queue.map((q) => {
              const sc = STATUS_COLORS[q.status] ?? STATUS_COLORS.WAITING
              const canAdvance = q.rawStatus !== 'delivered' && NEXT_STATUS[q.rawStatus]
              return (
                <div key={q.id} style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <p style={{ fontSize: '12px', fontWeight: 700, color: '#c9a84c', marginBottom: '4px' }}>{q.id}</p>
                      <p style={{ fontSize: '13px', color: '#fff' }}>{q.user} · {q.coin} · {q.value}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '10px', fontWeight: 700, padding: '4px 10px', background: sc.bg, color: sc.color, borderRadius: '2px', display: 'inline-block', marginBottom: '6px' }}>{q.status}</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>Progress</span>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: sc.color }}>{q.progress}%</span>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px' }}>
                      <div style={{ height: '100%', width: `${q.progress}%`, background: q.progress === 100 ? '#22c55e' : 'linear-gradient(90deg,#c9a84c,#f5d78e)', borderRadius: '2px', transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '24px', marginTop: '10px', alignItems: 'center' }}>
                    {[{ l: 'Start', v: q.start }, { l: 'Updated', v: q.eta }].map((d) => (
                      <div key={d.l}>
                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>{d.l}: </span>
                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{d.v}</span>
                      </div>
                    ))}
                    {canAdvance && (
                      <button
                        type="button"
                        disabled={updateStatus.isPending}
                        onClick={() => advance(q.id, q.rawStatus)}
                        style={{ marginLeft: 'auto', fontSize: '10px', padding: '4px 12px', background: q.status === 'WAITING' ? 'rgba(139,92,246,0.08)' : 'rgba(201,168,76,0.08)', color: q.status === 'WAITING' ? '#a78bfa' : '#c9a84c', border: `1px solid ${q.status === 'WAITING' ? 'rgba(139,92,246,0.2)' : 'rgba(201,168,76,0.2)'}`, borderRadius: '2px', cursor: 'pointer', fontWeight: 700, opacity: updateStatus.isPending ? 0.6 : 1 }}
                      >
                        {q.status === 'WAITING' ? 'ASSIGN & START' : 'ADVANCE STATUS'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
