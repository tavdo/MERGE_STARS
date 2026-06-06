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
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {STATS.map((s) => (
              <div key={s.label} className="gold-card p-4" style={{ borderRadius: '4px' }}>
                <p className="text-[9px] font-bold tracking-[0.15em] mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.label}</p>
                <p className="text-xl font-black text-white">{s.value}</p>
                <p className="text-[10px] mt-1 font-semibold" style={{ color: s.up ? '#22c55e' : '#ef4444' }}>{s.change}</p>
              </div>
            ))}
          </div>

          {/* Table + detail */}
          <div className="flex gap-5">
            {/* Table */}
            <div className="flex-1 gold-card" style={{ borderRadius: '4px', overflow: 'hidden' }}>
              {/* Filters */}
              <div
                className="flex items-center gap-3 px-5 py-4 flex-wrap"
                style={{ borderBottom: '1px solid rgba(201,168,76,0.1)' }}
              >
                <p className="text-[11px] font-bold tracking-[0.15em]" style={{ color: '#c9a84c' }}>APPLICATIONS</p>
                <select
                  className="gold-input text-[11px] py-1.5"
                  style={{ width: 'auto' }}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option>All Status</option>
                  {Object.keys(STATUS_COLORS).map((s) => <option key={s}>{s}</option>)}
                </select>
                <input
                  className="gold-input text-[11px] py-1.5"
                  style={{ width: '180px' }}
                  placeholder="Search by ID or name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button className="gold-btn ml-auto">
                  EXPORT
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      {['ID', 'USER', 'COIN TYPE', 'QTY', 'TOTAL VALUE', 'STATUS', 'CRYSTAL', 'ACTIONS'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-[9px] font-bold tracking-[0.15em]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr><td colSpan={8} className="px-4 py-8 text-center text-neutral-500 text-sm">Loading…</td></tr>
                    ) : filtered.length === 0 ? (
                      <tr><td colSpan={8} className="px-4 py-8 text-center text-neutral-500 text-sm">No applications</td></tr>
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
                className="w-[280px] shrink-0 gold-card p-5 flex flex-col gap-4"
                style={{ borderRadius: '4px', maxHeight: '600px', overflowY: 'auto' }}
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

