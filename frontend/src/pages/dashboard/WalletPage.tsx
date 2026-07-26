import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import DashboardLayout from '../../components/DashboardLayout'
import { walletApi } from '@/features/wallet/api/wallet.api'
import { ordersApi } from '@/features/orders/api/orders.api'

const money = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function WalletPage() {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()

  const { data: wallet, isLoading } = useQuery({
    queryKey: ['wallet-me'],
    queryFn: () => walletApi.me(50).then((r) => r.data.data),
  })

  const { data: pendingOrders = [] } = useQuery({
    queryKey: ['orders-awaiting-earnings'],
    queryFn: () => ordersApi.awaitingEarnings().then((r) => r.data.data),
  })

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ['wallet-me'] })
    void qc.invalidateQueries({ queryKey: ['orders-awaiting-earnings'] })
    void qc.invalidateQueries({ queryKey: ['orders'] })
  }

  const activate = useMutation({
    mutationFn: () => walletApi.activate(),
    onSuccess: invalidate,
  })

  const settle = useMutation({
    mutationFn: (orderId: string) => ordersApi.payWithEarnings(orderId),
    onSuccess: invalidate,
  })

  const balance = wallet?.balance ?? 0
  const activated = wallet?.activated ?? false
  const transactions = wallet?.transactions ?? []

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(i18n.language, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })

  const reasonLabel = (reason: string) =>
    t(`wallet.reasons.${reason}`, { defaultValue: reason.replace(/_/g, ' ') })

  return (
    <DashboardLayout titleKey="wallet">
      <div className="profile-page wallet-page">
        <header className="profile-page-head">
          <p className="profile-kicker">{t('wallet.kicker')}</p>
          <p className="profile-title">{t('wallet.subtitle')}</p>
        </header>

        {isLoading ? (
          <p className="profile-muted">{t('common.loading', { defaultValue: 'Loading…' })}</p>
        ) : (
          <>
            <div className="wallet-hero">
              <div>
                <p className="wallet-balance-label">{t('wallet.available')}</p>
                <p className="wallet-balance">
                  ${money(balance)}
                  <small>{wallet?.currency ?? 'USD'}</small>
                </p>
              </div>
              <div className="wallet-hero-side">
                <span className={`profile-pill ${activated ? 'profile-pill--ok' : 'profile-pill--wait'}`}>
                  {activated ? t('wallet.statusActive') : t('wallet.statusInactive')}
                </span>
                {activated ? (
                  wallet?.activatedAt && (
                    <p className="wallet-pending-meta">
                      {t('wallet.activatedOn', { date: formatDate(wallet.activatedAt) })}
                    </p>
                  )
                ) : (
                  <button
                    type="button"
                    className="profile-btn-primary"
                    disabled={activate.isPending}
                    onClick={() => activate.mutate()}
                  >
                    {activate.isPending ? '…' : t('wallet.activate')}
                  </button>
                )}
              </div>
            </div>

            <div className="wallet-stats">
              <div className="wallet-stat">
                <span>{t('wallet.totalEarned')}</span>
                <strong>${money(wallet?.totalEarned ?? 0)}</strong>
              </div>
              <div className="wallet-stat">
                <span>{t('wallet.totalSpent')}</span>
                <strong>${money(wallet?.totalSpent ?? 0)}</strong>
              </div>
              <div className="wallet-stat">
                <span>{t('wallet.reservedOrders')}</span>
                <strong>{pendingOrders.length}</strong>
              </div>
            </div>

            <div className="wallet-notice">
              <p>
                <strong>{t('wallet.howTitle')}</strong>
                {t('wallet.howBody')}
              </p>
            </div>

            <div className="profile-shell">
              <section className="profile-section">
                <div className="profile-section-head">
                  <h2>{t('wallet.reservedTitle')}</h2>
                  <p>{t('wallet.reservedHint')}</p>
                </div>
                {pendingOrders.length === 0 ? (
                  <p className="profile-muted">{t('wallet.reservedEmpty')}</p>
                ) : (
                  <div className="wallet-pending">
                    {pendingOrders.map((order) => {
                      const amount = Number(order.amount)
                      const covered = amount > 0 ? Math.min(100, (balance / amount) * 100) : 0
                      const ready = balance >= amount && amount > 0
                      return (
                        <div key={order.id} className="wallet-pending-row">
                          <div style={{ flex: 1, minWidth: '12rem' }}>
                            <p className="wallet-pending-id">{order.id}</p>
                            <p className="wallet-pending-meta">
                              {order.coinType ?? '—'} · ${money(amount)}
                            </p>
                            <div className="wallet-progress">
                              <i style={{ width: `${covered}%` }} />
                            </div>
                            <p className="wallet-pending-meta" style={{ marginTop: '0.4rem' }}>
                              {ready
                                ? t('wallet.readyToPay')
                                : t('wallet.stillNeeded', { need: money(amount - balance) })}
                            </p>
                          </div>
                          <button
                            type="button"
                            className="profile-btn-primary"
                            disabled={!ready || settle.isPending}
                            onClick={() => settle.mutate(order.id)}
                          >
                            {settle.isPending ? '…' : t('wallet.payNow')}
                          </button>
                        </div>
                      )
                    })}
                    {settle.isError && (
                      <p className="profile-msg profile-msg--err">
                        {(settle.error as { response?: { data?: { message?: string } } })?.response?.data?.message
                          || t('wallet.payFailed')}
                      </p>
                    )}
                  </div>
                )}
              </section>

              <section className="profile-section">
                <div className="profile-section-head">
                  <h2>{t('wallet.historyTitle')}</h2>
                  <p>{t('wallet.historyHint')}</p>
                </div>
                {transactions.length === 0 ? (
                  <p className="profile-muted">{t('wallet.historyEmpty')}</p>
                ) : (
                  <div className="wallet-tx">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="wallet-tx-row">
                        <div>
                          <p className="wallet-tx-reason">{tx.note || reasonLabel(tx.reason)}</p>
                          <p className="wallet-tx-date">{formatDate(tx.createdAt)}</p>
                        </div>
                        <div>
                          <span
                            className={`wallet-tx-amount ${tx.type === 'credit' ? 'wallet-tx-amount--in' : 'wallet-tx-amount--out'}`}
                          >
                            {tx.type === 'credit' ? '+' : '−'}${money(tx.amount)}
                          </span>
                          <span className="wallet-tx-balance">${money(tx.balanceAfter)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="profile-section">
                <div className="profile-section-head">
                  <h2>{t('wallet.earnMoreTitle')}</h2>
                  <p>{t('wallet.earnMoreHint')}</p>
                </div>
                <div className="profile-footer-links">
                  <Link to="/dashboard/collections" className="profile-btn-secondary">
                    {t('wallet.goCollections')}
                  </Link>
                  <Link to="/dashboard/referral" className="profile-btn-ghost">
                    {t('wallet.goReferral')}
                  </Link>
                  <Link to="/dashboard/payment" className="profile-btn-ghost">
                    {t('wallet.goPayment')}
                  </Link>
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
