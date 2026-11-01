import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import DashboardLayout from '../components/DashboardLayout'
import { dashboardApi } from '@/features/dashboard/api/dashboard.api'
import { statusLabel } from '@/shared/utils/applicationStatus'
import { formatMetalFineness, metalI18nKey } from '@/shared/utils/metalPurity'
import coinRender from '@/assets/merge_coin_3d_render.png'

function formatActivityTime(iso: string) {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  if (diff < 3600000) return `${Math.max(1, Math.floor(diff / 60000))}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

export default function DashboardPage() {
  const { t, i18n } = useTranslation()

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => dashboardApi.getSummary().then((r) => r.data.data),
  })

  const { data: activity = [] } = useQuery({
    queryKey: ['dashboard-activity'],
    queryFn: () => dashboardApi.getActivity().then((r) => r.data.data),
  })

  const app = data?.application
  const registeredValue = data?.registeredValue ?? 0
  const coinBalance = data?.coinBalance ?? 0

  return (
    <DashboardLayout titleKey="dashboard">
      <div className="dash-home">
        <div className="dash-home-stats">
          <div className="dash-panel ld-glass">
            <p className="dash-label">{t('dashboardHome.coinBalance')}</p>
            <p className="dash-stat-value dash-stat-value--gold">
              {isLoading ? '…' : coinBalance.toLocaleString()}
              <span>MGS</span>
            </p>
            <Link to="/dashboard/coins" className="dash-text-link">
              {t('dashboardHome.viewCoins')}
            </Link>
          </div>

          <div className="dash-panel ld-glass">
            <p className="dash-label">{t('dashboardHome.applicationStatus')}</p>
            <p className="dash-stat-status">
              {app ? statusLabel(app.status) : t('dashboardHome.noApplication', { defaultValue: 'No application yet' })}
            </p>
            {app && <p className="dash-stat-meta">{app.id}</p>}
            <Link to="/status" className="dash-text-link">
              {t('dashboardHome.viewDetails')}
            </Link>
          </div>

          <div className="dash-panel ld-glass" id="registry">
            <p className="dash-label">{t('dashboardHome.registeredValue')}</p>
            <p className="dash-stat-value">
              ${isLoading ? '…' : registeredValue.toLocaleString()}
            </p>
            <p className="dash-stat-meta">{t('dashboardHome.valueIndicator')}</p>
          </div>
        </div>

        <div className="dash-home-main">
          <div className="dash-panel ld-glass dash-home-coin">
            <p className="dash-label">{t('dashboardHome.myMergeCoin')}</p>
            <div className="dash-home-coin-row">
              <img
                src={coinRender}
                alt=""
                className="dash-coin-thumb"
                width={120}
                height={120}
              />
              <div className="min-w-0">
                <h3 className="dash-coin-title">
                  {app?.coinType ?? t('dashboardHome.coinName')}
                </h3>
                <p className="dash-stat-meta">
                  {t('dashboardHome.quantity')}:{' '}
                  {app ? `${(app.quantity * 1000).toLocaleString(i18n.language)} g` : '—'}
                </p>
                <p className="dash-stat-meta">
                  {app
                    ? `${t('dashboardHome.fineness')}: ${formatMetalFineness(app.metalPurity, i18n.language)} ${t(`application.metals.${metalI18nKey(app.metalType)}`)}`
                    : t('dashboardHome.purityDefault')}
                </p>
                {app && (
                  <span className="dash-status dash-status--blue">{statusLabel(app.status)}</span>
                )}
              </div>
            </div>
            <div className="dash-home-coin-actions">
              <Link to="/dashboard/coins" className="luxury-btn-glass">
                {t('dashboardHome.viewCoin')}
              </Link>
              <Link to="/status" className="luxury-btn-ghost">
                {t('dashboardHome.trackStatus')}
              </Link>
            </div>
          </div>

          <div className="dash-panel ld-glass dash-home-activity">
            <p className="dash-label">{t('dashboardHome.recentActivity')}</p>
            <ul className="dash-activity-list">
              {activity.length === 0 ? (
                <li className="dash-stat-meta">
                  {t('dashboardHome.noActivity', { defaultValue: 'No recent activity yet.' })}
                </li>
              ) : (
                activity.map((a) => (
                  <li key={`${a.time}-${a.text}`}>
                    <p className="dash-activity-text">{a.text}</p>
                    <p className="dash-activity-time">{formatActivityTime(a.time)}</p>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className="dash-panel ld-glass dash-home-actions">
            <p className="dash-label">{t('dashboardHome.quickActions')}</p>
            <div className="dash-home-actions-stack">
              <Link to="/apply" className="luxury-btn-glass justify-center text-center">
                {t('dashboardHome.newApplication')}
              </Link>
              <Link to="/dashboard/payment" className="luxury-btn-ghost justify-center text-center">
                {t('dashboardHome.makePayment')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
