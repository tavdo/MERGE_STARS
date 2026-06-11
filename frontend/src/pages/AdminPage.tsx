import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import AdminLayout from '../components/AdminLayout'
import { adminApi } from '@/features/admin/api/admin.api'
import { STATUS_COLORS, statusLabel, statusToApi } from '@/shared/utils/applicationStatus'

export default function AdminPage() {
  const [selectedApp, setSelectedApp] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [search, setSearch] = useState('')
  const qc = useQueryClient()

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['admin-applications', statusFilter, search],
    queryFn: () =>
      adminApi
        .getApplications({
          status: statusFilter === 'All Status' ? undefined : (statusToApi(statusFilter) as never),
          search: search || undefined,
        })
        .then((r) => r.data.data),
  })

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats().then((r) => r.data.data),
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.updateStatus(id, status as never),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-applications'] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })

  const STATS = stats
    ? [
        { label: 'TOTAL APPLICATIONS', value: String(stats.totalApplications), change: '', up: true },
        { label: 'APPROVED', value: String(stats.approved), change: '', up: true },
        { label: 'REJECTED', value: String(stats.rejected), change: '', up: false },
        { label: 'TOTAL FUNDS', value: `$${stats.totalFunds.toLocaleString()}`, change: '', up: true },
        { label: 'IN PRODUCTION', value: String(stats.inProduction), change: '', up: true },
      ]
    : []

  const filtered = applications.map((a) => ({
    id: a.id,
    user: (a as { user?: string }).user ?? '—',
    coin: a.coinType,
    qty: a.quantity,
    value: `$${Number(a.coinValue).toLocaleString()}`,
    status: statusLabel(a.status),
    crystal: (a as { crystal?: string }).crystal ?? '—',
    rawStatus: a.status,
  }))

  const selected = filtered.find((a) => a.id === selectedApp)

  return (
    <AdminLayout title="ADMIN PANEL" subtitle="APPLICATIONS MANAGEMENT">
          <div className="admin-stat-grid">
            {STATS.map((s) => (
              <div key={s.label} className="admin-stat-card">
                <p className="admin-stat-label">{s.label}</p>
                <p className="admin-stat-value">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-5 flex-col xl:flex-row">
            <div className="flex-1 admin-panel">
              <div className="admin-toolbar">
                <p className="admin-toolbar-title">Applications</p>
                <select
                  className="admin-field-input"
                  style={{ width: 'auto', minHeight: '2.5rem', padding: '0.5rem 0.75rem', fontSize: '13px' }}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option>All Status</option>
                  {Object.keys(STATUS_COLORS).map((s) => <option key={s}>{s}</option>)}
                </select>
                <input
                  className="admin-field-input"
                  style={{ width: '200px', minHeight: '2.5rem', padding: '0.5rem 0.75rem', fontSize: '13px' }}
                  placeholder="Search by ID or name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button type="button" className="admin-btn-secondary ml-auto">
                  Export
                </button>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      {['ID', 'USER', 'COIN TYPE', 'QTY', 'TOTAL VALUE', 'STATUS', 'CRYSTAL', 'ACTIONS'].map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr><td colSpan={8} className="admin-empty">Loading…</td></tr>
                    ) : filtered.length === 0 ? (
                      <tr><td colSpan={8} className="admin-empty">No applications yet</td></tr>
                    ) : filtered.map((app) => {
                      const sc = STATUS_COLORS[app.status] || { bg: 'rgba(255,255,255,0.05)', color: '#fff' }
                      return (
                        <tr
                          key={app.id}
                          className="cursor-pointer transition-colors"
                          style={{
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                            background: selectedApp === app.id ? 'rgba(201,168,76,0.06)' : 'transparent',
                          }}
                          onClick={() => setSelectedApp(selectedApp === app.id ? null : app.id)}
                        >
                          <td className="px-4 py-3 text-[11px] font-bold" style={{ color: '#c9a84c' }}>{app.id}</td>
                          <td className="px-4 py-3 text-[11px] text-white">{app.user}</td>
                          <td className="px-4 py-3 text-[11px]" style={{ color: 'rgba(255,255,255,0.6)' }}>{app.coin}</td>
                          <td className="px-4 py-3 text-[11px] text-white">{app.qty}</td>
                          <td className="px-4 py-3 text-[11px] font-bold text-white">{app.value}</td>
                          <td className="px-4 py-3">
                            <span
                              className="text-[9px] font-bold px-2 py-1 tracking-widest"
                              style={{ background: sc.bg, color: sc.color, borderRadius: '2px' }}
                            >
                              {app.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>{app.crystal}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button className="text-sm" style={{ color: '#c9a84c' }}>👁</button>
                              <button className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>✏</button>
                              <button className="text-sm" style={{ color: 'rgba(239,68,68,0.6)' }}>🗑</button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Detail panel */}
            {selected && (
              <div
                className="w-full xl:w-[300px] shrink-0 admin-section-card flex flex-col gap-4"
                style={{ maxHeight: '600px', overflowY: 'auto' }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold tracking-[0.15em]" style={{ color: '#c9a84c' }}>APPLICATION DETAILS</p>
                  <button onClick={() => setSelectedApp(null)} style={{ color: 'rgba(255,255,255,0.3)' }}>✕</button>
                </div>
                <p className="text-[11px] font-bold text-white">{selected.id}</p>
                {[
                  { label: 'User',       value: selected.user },
                  { label: 'Coin Type',  value: selected.coin },
                  { label: 'Quantity',   value: `${selected.qty} KG` },
                  { label: 'Total Value',value: selected.value },
                  { label: 'Status',     value: selected.status },
                  { label: 'Crystal',    value: selected.crystal },
                ].map((d) => (
                  <div key={d.label} className="flex flex-col gap-0.5 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{d.label}</span>
                    <span className="text-[12px] font-semibold text-white">{d.value}</span>
                  </div>
                ))}
                <div className="flex flex-col gap-2 mt-2">
                  <button
                    type="button"
                    className="gold-btn justify-center"
                    style={{ borderRadius: '2px' }}
                    onClick={() => selected && updateStatus.mutate({ id: selected.id, status: 'sent_to_crystal' })}
                  >
                    SEND TO CRYSTAL
                  </button>
                  <button
                    type="button"
                    className="py-2.5 text-[10px] font-bold tracking-widest transition-all"
                    style={{
                      background: 'rgba(239,68,68,0.1)',
                      color: '#f87171',
                      border: '1px solid rgba(239,68,68,0.2)',
                      borderRadius: '2px',
                    }}
                    onClick={() => selected && updateStatus.mutate({ id: selected.id, status: 'rejected' })}
                  >
                    REJECT
                  </button>
                  <button
                    type="button"
                    className="gold-btn justify-center"
                    style={{ borderRadius: '2px' }}
                    onClick={() => selected && updateStatus.mutate({ id: selected.id, status: 'approved' })}
                  >
                    APPROVE
                  </button>
                </div>
              </div>
            )}
          </div>
    </AdminLayout>
  )
}

