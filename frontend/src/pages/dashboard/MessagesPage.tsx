import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import DashboardLayout from '../../components/DashboardLayout'
import { notificationsApi } from '@/features/notifications/api/notifications.api'
import { socket } from '@/lib/socket'
import { useAuthStore } from '@/features/auth/store/auth.store'

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function MessagesPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const token = useAuthStore((s) => s.accessToken)

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list(50).then((r) => r.data.data),
  })

  const markRead = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const markAll = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  useEffect(() => {
    if (!token) return
    const handler = () => qc.invalidateQueries({ queryKey: ['notifications'] })
    socket.on('notification:new', handler)
    return () => {
      socket.off('notification:new', handler)
    }
  }, [token, qc])

  const unread = items.filter((n) => !n.read).length

  return (
    <DashboardLayout titleKey="messages">
      <div style={{ maxWidth: '800px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.3em', color: '#c9a84c', marginBottom: '8px' }}>INBOX</p>
            <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#fff', margin: 0 }}>{t('dashboard.titles.messages')}</h1>
          </div>
          {unread > 0 && (
            <button type="button" className="gold-btn-outline" onClick={() => markAll.mutate()} disabled={markAll.isPending}>
              Mark all read ({unread})
            </button>
          )}
        </div>

        <div className="gold-card" style={{ borderRadius: '4px', overflow: 'hidden' }}>
          {isLoading ? (
            <p style={{ padding: '24px', color: 'rgba(255,255,255,0.5)' }}>{t('common.loading')}</p>
          ) : items.length === 0 ? (
            <p style={{ padding: '24px', color: 'rgba(255,255,255,0.5)' }}>
              No messages yet. Updates about applications and KYC will appear here.
            </p>
          ) : (
            items.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: '18px 22px',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  background: n.read ? 'transparent' : 'rgba(201,168,76,0.04)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '6px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff', margin: 0 }}>{n.title}</p>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap' }}>{formatWhen(n.createdAt)}</span>
                </div>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', margin: '0 0 10px', lineHeight: 1.6 }}>{n.body}</p>
                {!n.read && (
                  <button
                    type="button"
                    onClick={() => markRead.mutate(n.id)}
                    style={{ fontSize: '10px', fontWeight: 700, color: '#c9a84c', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    Mark as read
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        <div style={{ marginTop: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Link to="/status" className="gold-btn-outline">Application status</Link>
          <Link to="/dashboard/ai" className="gold-btn-outline">AI Assistant</Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
