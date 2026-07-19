import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import AdminLayout from '../../components/AdminLayout'
import { adminApi, type AdminOrder } from '../../features/admin/api/admin.api'

const STATUS_COLOR = (v: string) => {
  const u = v.toUpperCase()
  if (u === 'PAID' || u === 'APPROVED') return { bg: 'rgba(34,197,94,0.1)', color: '#22c55e' }
  if (u === 'REJECTED') return { bg: 'rgba(239,68,68,0.1)', color: '#f87171' }
  if (u === 'PENDING') return { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' }
  return { bg: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }
}

function bankLabel(order: AdminOrder): string {
  const s = order.appStatus
  if (!s) return '—'
  if (s === 'approved' || s === 'funds_received' || s.startsWith('production') || s === 'in_production' || s === 'quality_check' || s === 'ready' || s === 'delivered') return 'APPROVED'
  if (s === 'rejected') return 'REJECTED'
  if (s === 'sent_to_crystal' || s === 'under_review') return 'PENDING'
  return '—'
}

function crystalLabel(order: AdminOrder): string {
  if (order.crystalSent) return 'Yes'
  if (order.appStatus === 'sent_to_crystal') return 'Sent'
  return '—'
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB')
}

export default function AdminFinancePage() {
  const qc = useQueryClient()
  const [identifier, setIdentifier] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [creditMsg, setCreditMsg] = useState<string | null>(null)

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => adminApi.getOrders().then((r) => r.data.data),
  })

  const credit = useMutation({
    mutationFn: () =>
      adminApi.creditWallet({
        identifier: identifier.trim(),
        amount: Number(amount),
        note: note.trim() || undefined,
      }),
    onSuccess: (res) => {
      const tx = res.data.data
      setCreditMsg(`Credited $${Number(tx.amount).toFixed(2)}. New balance: $${Number(tx.balanceAfter).toFixed(2)}`)
      setIdentifier('')
      setAmount('')
      setNote('')
      qc.invalidateQueries({ queryKey: ['admin-orders'] })
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || 'Credit failed'
      setCreditMsg(msg)
    },
  })

  const rows = useMemo(() => orders.map((o) => ({
    id: o.id,
    user: o.user,
    coin: o.coinType ?? '—',
    value: `$${Number(o.amount).toLocaleString()}`,
    payment: o.status.toUpperCase(),
    bank: bankLabel(o),
    crystal: crystalLabel(o),
    date: formatDate(o.createdAt),
    raw: o,
  })), [orders])

  const totalFunds = rows.filter((o) => o.payment === 'PAID').reduce((s, o) => s + Number(o.raw.amount), 0)

  return (
    <AdminLayout title="ADMIN PANEL" subtitle="FINANCE PANEL">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'TOTAL FUNDS RECEIVED', value: `$${totalFunds.toLocaleString()}`, color: '#22c55e' },
          { label: 'PAYMENT PENDING', value: rows.filter((o) => o.payment === 'PENDING').length, color: '#f59e0b' },
          { label: 'BANK APPROVED', value: rows.filter((o) => o.bank === 'APPROVED').length, color: '#60a5fa' },
          { label: 'BANK REJECTED', value: rows.filter((o) => o.bank === 'REJECTED').length, color: '#f87171' },
          { label: 'PLATFORM FEE (2%)', value: `$${(totalFunds * 0.02).toFixed(2)}`, color: '#c9a84c' },
        ].map((s) => (
          <div key={s.label} className="gold-card" style={{ padding: '18px 20px', borderRadius: '4px' }}>
            <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.35)', marginBottom: '8px' }}>{s.label}</p>
            <p style={{ fontSize: '24px', fontWeight: 900, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="gold-card" style={{ padding: '20px', borderRadius: '4px', marginBottom: '24px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', color: '#c9a84c', marginBottom: '8px' }}>
          CREDIT EARNINGS WALLET
        </p>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginBottom: '16px', lineHeight: 1.5 }}>
          Add catalog earnings (brand share) to a user&apos;s wallet. They can spend this balance on coin orders.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '12px', alignItems: 'end' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)' }}>EMAIL / MERGE ID</span>
            <input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="user@email.com or MERGE-…"
              style={{ padding: '10px 12px', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '4px', color: '#fff', fontSize: '13px' }}
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)' }}>AMOUNT (USD)</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              style={{ padding: '10px 12px', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '4px', color: '#fff', fontSize: '13px' }}
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)' }}>NOTE (optional)</span>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Catalog sale / manual credit"
              style={{ padding: '10px 12px', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '4px', color: '#fff', fontSize: '13px' }}
            />
          </label>
          <button
            type="button"
            className="gold-btn justify-center"
            disabled={credit.isPending || !identifier.trim() || !(Number(amount) > 0)}
            onClick={() => { setCreditMsg(null); credit.mutate() }}
            style={{ height: '42px' }}
          >
            {credit.isPending ? '…' : 'CREDIT WALLET'}
          </button>
        </div>
        {creditMsg && (
          <p style={{ fontSize: '12px', marginTop: '14px', color: credit.isError ? '#f87171' : '#22c55e' }}>{creditMsg}</p>
        )}
      </div>

      <div style={{ padding: '14px 20px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: '4px', marginBottom: '24px' }}>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
          🔒 Production lock rule: <strong style={{ color: '#60a5fa' }}>payment_status = PAID</strong> OR <strong style={{ color: '#60a5fa' }}>bank_status = APPROVED</strong> required before production can begin.
        </p>
      </div>

      <div className="gold-card" style={{ borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(201,168,76,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', color: '#c9a84c' }}>FINANCE RECORDS</p>
        </div>
        <div style={{ overflowX: 'auto' }}>
          {isLoading ? (
            <p style={{ padding: '24px', color: 'rgba(255,255,255,0.5)' }}>Loading…</p>
          ) : rows.length === 0 ? (
            <p style={{ padding: '24px', color: 'rgba(255,255,255,0.5)' }}>No orders yet</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['ORDER ID', 'USER', 'COIN', 'VALUE', 'PAYMENT', 'BANK STATUS', 'CRYSTAL', 'DATE'].map((h) => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((o) => {
                  const pc = STATUS_COLOR(o.payment)
                  const bc = STATUS_COLOR(o.bank)
                  return (
                    <tr key={o.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(201,168,76,0.02)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#c9a84c' }}>{o.id}</td>
                      <td style={{ padding: '12px 16px', fontSize: '12px', color: '#fff' }}>{o.user}</td>
                      <td style={{ padding: '12px 16px', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{o.coin}</td>
                      <td style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#fff' }}>{o.value}</td>
                      <td style={{ padding: '12px 16px' }}><span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 8px', background: pc.bg, color: pc.color, borderRadius: '2px' }}>{o.payment}</span></td>
                      <td style={{ padding: '12px 16px' }}><span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 8px', background: bc.bg, color: bc.color, borderRadius: '2px' }}>{o.bank}</span></td>
                      <td style={{ padding: '12px 16px', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{o.crystal}</td>
                      <td style={{ padding: '12px 16px', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{o.date}</td>
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
