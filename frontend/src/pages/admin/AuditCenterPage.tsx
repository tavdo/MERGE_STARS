import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { api } from '@/lib/axios'

type AuditEvent = {
  event_id: string
  actor_id: string
  actor_role: string
  action: string
  object_id: string | null
  timestamp: string
  ip_address: string | null
  result: 'SUCCESS' | 'FAILURE'
  owner: string
  meta?: Record<string, unknown>
}

type SectionKey =
  | 'Audit Logs'
  | 'Evidence Records'
  | 'QR Verification Events'
  | 'Payment Confirmation Events'
  | 'QC Events'
  | 'Delivery Events'
  | 'User Actions'
  | 'Admin Actions'

const SECTIONS: SectionKey[] = [
  'Audit Logs',
  'Evidence Records',
  'QR Verification Events',
  'Payment Confirmation Events',
  'QC Events',
  'Delivery Events',
  'User Actions',
  'Admin Actions',
]

function classify(ev: AuditEvent): { section: SectionKey; label: string } {
  const a = (ev.action ?? '').toUpperCase()
  const role = (ev.actor_role ?? '').toUpperCase()

  if (a.includes('QR') || a.includes('PASSPORT')) return { section: 'QR Verification Events', label: 'QR / Passport' }
  if (a.includes('PAY') || a.includes('BANK')) return { section: 'Payment Confirmation Events', label: 'Payment / Bank' }
  if (a.includes('QC')) return { section: 'QC Events', label: 'QC' }
  if (a.includes('DELIVER')) return { section: 'Delivery Events', label: 'Delivery' }
  if (a.includes('EVIDENCE')) return { section: 'Evidence Records', label: 'Evidence' }
  if (role === 'ADMIN' || role === 'MANAGER') return { section: 'Admin Actions', label: 'Admin' }
  if (role === 'CUSTOMER') return { section: 'User Actions', label: 'User' }
  return { section: 'Audit Logs', label: 'Log' }
}

export default function AuditCenterPage() {
  const [active, setActive] = useState<SectionKey>('Audit Logs')
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)
    api
      .get<{ ok: boolean; data: AuditEvent[] }>('/audit/events?limit=500')
      .then((res) => {
        if (!mounted) return
        setEvents(res.data.data ?? [])
      })
      .catch((e) => {
        if (!mounted) return
        setError(e instanceof Error ? e.message : 'Could not load audit events')
      })
      .finally(() => {
        if (!mounted) return
        setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  const grouped = useMemo(() => {
    const map = new Map<SectionKey, AuditEvent[]>()
    for (const s of SECTIONS) map.set(s, [])
    for (const ev of events) {
      const { section } = classify(ev)
      map.get(section)!.push(ev)
      map.get('Audit Logs')!.push(ev)
    }
    return map
  }, [events])

  const visible = grouped.get(active) ?? []

  return (
    <AdminLayout title="AUDIT" subtitle="AUDIT CENTER">
      <div style={{ padding: '12px 16px', background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.12)', borderRadius: '4px', marginBottom: '18px', display: 'flex', gap: '10px' }}>
        <span style={{ fontSize: '16px' }}>🧾</span>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, margin: 0 }}>
          Audit Center is <strong style={{ color: '#c9a84c' }}>append-only</strong>, timestamped, actor-linked, and owner-linked.
          Logs are non-deletable from the UI.
        </p>
      </div>

      <div className="gold-card" style={{ borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: '8px', padding: '12px 14px', borderBottom: '1px solid rgba(201,168,76,0.1)', flexWrap: 'wrap' }}>
          {SECTIONS.map((s) => {
            const isActive = active === s
            return (
              <button
                key={s}
                type="button"
                className={isActive ? 'gold-btn' : 'gold-btn-outline'}
                style={{ padding: '8px 10px', fontSize: '10px', letterSpacing: '0.1em' }}
                onClick={() => setActive(s)}
              >
                {s}
              </button>
            )
          })}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {loading && <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>Loading…</span>}
            {error && <span style={{ fontSize: '10px', color: '#f87171' }}>{error}</span>}
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>{visible.length} records</span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['EVENT ID', 'TIMESTAMP (UTC)', 'ACTOR', 'ROLE', 'ACTION', 'OBJECT', 'RESULT', 'IP', 'OWNER'].map((h) => (
                  <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((ev) => (
                <tr
                  key={ev.event_id}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(201,168,76,0.02)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '11px 14px', fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>{ev.event_id}</td>
                  <td style={{ padding: '11px 14px', fontSize: '10px', color: 'rgba(255,255,255,0.45)', whiteSpace: 'nowrap' }}>{ev.timestamp}</td>
                  <td style={{ padding: '11px 14px', fontSize: '11px', color: '#fff', fontWeight: 600 }}>{ev.actor_id}</td>
                  <td style={{ padding: '11px 14px', fontSize: '10px', color: 'rgba(255,255,255,0.45)' }}>{ev.actor_role}</td>
                  <td style={{ padding: '11px 14px', fontSize: '11px', color: '#c9a84c', fontWeight: 700 }}>{ev.action}</td>
                  <td style={{ padding: '11px 14px', fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>{ev.object_id ?? '—'}</td>
                  <td style={{ padding: '11px 14px', fontSize: '10px', fontWeight: 800, color: ev.result === 'SUCCESS' ? '#22c55e' : '#f87171' }}>{ev.result}</td>
                  <td style={{ padding: '11px 14px', fontSize: '10px', color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>{ev.ip_address ?? '—'}</td>
                  <td style={{ padding: '11px 14px', fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>{ev.owner}</td>
                </tr>
              ))}
              {!loading && !visible.length && (
                <tr>
                  <td colSpan={9} style={{ padding: '18px 14px', fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>
                    No records yet. Once actions occur, they will appear here (append-only).
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}

