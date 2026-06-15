import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import AdminLayout from '../../components/AdminLayout'
import { api } from '@/lib/axios'
import type { ApiResponse } from '@/shared/types/api.types'

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
}

const ACTION_COLORS: Record<string, string> = {
  STATUS_CHANGE: '#c9a84c',
  ORDER_SUBMIT: '#60a5fa',
  KYC_VERIFIED: '#22c55e',
  PAYMENT_CONFIRM: '#22c55e',
  CRYSTAL_SEND: '#a78bfa',
  USER_REGISTER: '#2dd4bf',
  PRODUCTION_START: '#f59e0b',
}

function actionColor(action: string) {
  const key = Object.keys(ACTION_COLORS).find((k) => action.toUpperCase().includes(k))
  return key ? ACTION_COLORS[key] : '#c9a84c'
}

export default function AdminAuditPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('All')
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    api
      .get<ApiResponse<AuditEvent[]>>('/audit/events?limit=500')
      .then((res) => {
        if (!mounted) return
        const payload = res.data.data
        setEvents(Array.isArray(payload) ? payload : [])
      })
      .catch((e) => {
        if (!mounted) return
        setError(e instanceof Error ? e.message : 'Could not load audit log')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  const actions = useMemo(() => {
    const set = new Set(events.map((e) => e.action))
    return ['All', ...Array.from(set).sort()]
  }, [events])

  const filtered = events.filter((l) => {
    const ms = (l.actor_id + l.action + (l.object_id ?? '')).toLowerCase().includes(search.toLowerCase())
    const ma = actionFilter === 'All' || l.action === actionFilter
    return ms && ma
  })

  return (
    <AdminLayout title="ADMIN PANEL" subtitle="AUDIT LOG">
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          className="gold-input"
          style={{ width: '220px' }}
          placeholder={t('admin.audit.searchPlaceholder', { defaultValue: 'Search user, action, target…' })}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="gold-input" style={{ width: '180px' }} value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
          {actions.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        {loading && <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', alignSelf: 'center' }}>Loading…</span>}
        {error && <span style={{ fontSize: '11px', color: '#f87171', alignSelf: 'center' }}>{error}</span>}
      </div>

      <div className="gold-card" style={{ borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['ID', 'USER', 'ACTION', 'TARGET', 'BEFORE', 'AFTER', 'IP', 'TIME', 'SESSION'].map((h) => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.event_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '12px 14px', fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>{l.event_id.slice(0, 8)}</td>
                  <td style={{ padding: '12px 14px', fontSize: '11px', color: '#fff', fontWeight: 600 }}>{l.actor_id}</td>
                  <td style={{ padding: '12px 14px', fontSize: '10px', fontWeight: 700, color: actionColor(l.action) }}>{l.action}</td>
                  <td style={{ padding: '12px 14px', fontSize: '11px', color: 'rgba(255,255,255,0.55)' }}>{l.object_id ?? '—'}</td>
                  <td style={{ padding: '12px 14px', fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>—</td>
                  <td style={{ padding: '12px 14px', fontSize: '10px', color: l.result === 'SUCCESS' ? '#22c55e' : '#f87171' }}>{l.result}</td>
                  <td style={{ padding: '12px 14px', fontSize: '10px', color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>{l.ip_address ?? '—'}</td>
                  <td style={{ padding: '12px 14px', fontSize: '10px', color: 'rgba(255,255,255,0.45)', whiteSpace: 'nowrap' }}>{l.timestamp}</td>
                  <td style={{ padding: '12px 14px', fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>{l.owner}</td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ padding: '20px 14px', fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>
                    {t('admin.audit.empty', { defaultValue: 'No audit events yet.' })}
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
