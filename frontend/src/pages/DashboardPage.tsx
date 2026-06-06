import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import DashboardLayout from '../components/DashboardLayout'
import { dashboardApi } from '@/features/dashboard/api/dashboard.api'
import { statusLabel } from '@/shared/utils/applicationStatus'

export default function DashboardPage() {
  const { t } = useTranslation()
  const activity = t('dashboardHome.activity', { returnObjects: true }) as { text: string; time: string }[]
  const tones = ['gold', 'green', 'blue', 'amber', 'green'] as const

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => dashboardApi.getSummary().then((r) => r.data.data),
  })

  const app = data?.application
  const registeredValue = data?.registeredValue ?? 0
  const coinBalance = data?.coinBalance ?? 0

  return (
    <DashboardLayout titleKey="dashboard">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="dash-panel">
            <p className="dash-label mb-4">{t('dashboardHome.coinBalance')}</p>
            <div className="flex items-end gap-4">
              <div className="dash-coin-badge text-xl">★</div>
              <div>
                <p className="font-serif-display text-3xl text-[#D4AF37] tracking-wide leading-none">
                  {isLoading ? '…' : coinBalance.toLocaleString()}
                </p>
                <p className="text-[10px] tracking-[0.2em] text-neutral-500 mt-1">MGS</p>
              </div>
            </div>
            <Link to="/dashboard/coins" className="dash-text-link mt-5 inline-block">{t('dashboardHome.viewCoins')}</Link>
          </div>

          <div className="dash-panel">
            <p className="dash-label mb-4">{t('dashboardHome.applicationStatus')}</p>
            <div className="flex items-center gap-2 mb-2">
              <span className="dash-pulse-dot" />
              <p className="text-lg font-medium tracking-wide text-amber-400/90">
                {app ? statusLabel(app.status) : t('dashboardHome.noApplication', { defaultValue: 'No application yet' })}
              </p>
            </div>
            <p className="text-[11px] text-neutral-500 tracking-wide leading-relaxed">
              {app ? app.id : t('dashboardHome.underReviewBody')}
            </p>
            <Link to="/status" className="dash-text-link mt-5 inline-block">{t('dashboardHome.viewDetails')}</Link>
          </div>

          <div className="dash-panel">
            <p className="dash-label mb-4">{t('dashboardHome.registeredValue')}</p>
            <p className="font-serif-display text-3xl text-neutral-100 tracking-wide">
              ${isLoading ? '…' : registeredValue.toLocaleString()}
            </p>
            <p className="text-[11px] mt-2 text-neutral-500 tracking-wide">{t('dashboardHome.valueIndicator')}</p>
            <div className="mt-5 h-9 flex items-end gap-1">
              {[40, 55, 45, 70, 65, 80, 90, 85, 95].map((h, i) => (
                <div key={i} className="flex-1 rounded-sm transition-all duration-300" style={{ height: `${h}%`, background: i === 8 ? 'rgba(212,175,55,0.7)' : 'rgba(212,175,55,0.15)' }} />
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="dash-panel lg:col-span-5">
            <p className="dash-label mb-5">{t('dashboardHome.myMergeCoin')}</p>
            <div className="flex gap-4 items-start">
              <div className="dash-coin-badge text-2xl shrink-0">★</div>
              <div className="min-w-0">
                <h3 className="text-sm font-medium tracking-wide text-[#D4AF37] mb-2">{app?.coinType ?? t('dashboardHome.coinName')}</h3>
                <p className="text-[11px] text-neutral-500 tracking-wide">{t('dashboardHome.quantity')}: {app?.quantity ?? '—'}</p>
                <p className="text-[11px] text-neutral-500 tracking-wide mt-0.5">{t('dashboardHome.purity')}</p>
                {app && (
                  <span className="dash-status dash-status--blue mt-3">{statusLabel(app.status)}</span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-white/[0.06]">
              <Link to="/dashboard/coins" className="luxury-btn-glass">{t('dashboardHome.viewCoin')}</Link>
              <Link to="/status" className="luxury-btn-ghost">{t('dashboardHome.trackStatus')}</Link>
            </div>
          </div>

          <div className="dash-panel lg:col-span-4">
            <p className="dash-label mb-5">{t('dashboardHome.recentActivity')}</p>
            <ul className="space-y-4">
              {activity.map((a, i) => (
                <li key={a.text} className="flex items-start gap-3">
                  <span className={`dash-activity-icon dash-activity-icon--${tones[i] ?? 'gold'}`}>✓</span>
                  <div>
                    <p className="text-[11px] font-medium text-neutral-200 tracking-wide">{a.text}</p>
                    <p className="text-[10px] text-neutral-600 mt-0.5 tracking-wide">{a.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="dash-panel lg:col-span-3 flex flex-col justify-between">
            <div>
              <p className="dash-label mb-4">{t('dashboardHome.quickActions')}</p>
              <div className="flex flex-col gap-2">
                <Link to="/apply" className="luxury-btn-glass justify-center text-center">{t('dashboardHome.newApplication')}</Link>
                <Link to="/dashboard/payment" className="luxury-btn-ghost justify-center text-center">{t('dashboardHome.makePayment')}</Link>
              </div>
            </div>
            {data?.user && (
              <p className="text-[10px] text-neutral-600 mt-6 tracking-wide">
                ID: {data.user.mergeId}
              </p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
