import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import DashboardLayout from '../../components/DashboardLayout'
import { coinsApi } from '@/features/coins/api/coins.api'
import { statusLabel } from '@/shared/utils/applicationStatus'

export default function CoinsPage() {
  const { t } = useTranslation()

  const { data: app, isLoading } = useQuery({
    queryKey: ['application-latest'],
    queryFn: () => coinsApi.getLatestApplication().then((r) => r.data.data),
  })

  return (
    <DashboardLayout titleKey="coins">
      <div className="grid lg:grid-cols-2 gap-6 max-w-5xl">
        <div className="dash-panel">
          <p className="dash-label mb-4">{t('coins.activeCoin')}</p>
          {isLoading ? (
            <p className="text-neutral-500 text-sm">{t('common.loading', { defaultValue: 'Loading…' })}</p>
          ) : app ? (
            <>
              <div className="flex gap-5 items-start">
                <div className="dash-coin-badge text-2xl">★</div>
                <div>
                  <h3 className="text-sm font-medium tracking-wide text-[#D4AF37] mb-2">{app.coinType}</h3>
                  <p className="text-[11px] text-neutral-500 tracking-wide mb-1">
                    {t('coins.quantity')}: {app.quantity} KG
                  </p>
                  <p className="text-[11px] text-neutral-500 tracking-wide mb-3">
                    {t('coins.purity')}: {app.metalPurity}‰
                  </p>
                  <span className="dash-status dash-status--blue">{statusLabel(app.status)}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 mt-6">
                <Link to="/status" className="luxury-btn-glass">{t('coins.trackStatus')}</Link>
                <Link to="/merge-coin" className="luxury-btn-ghost">{t('coins.coinDetails')}</Link>
              </div>
            </>
          ) : (
            <>
              <p className="landing-body mb-6">{t('coins.noCoin', { defaultValue: 'No active coin application yet.' })}</p>
              <Link to="/apply" className="luxury-btn-glass">{t('orders.newOrder')}</Link>
            </>
          )}
        </div>
        <div className="dash-panel">
          <p className="dash-label mb-4">{t('coins.balance')}</p>
          <p className="font-serif-display text-4xl text-[#D4AF37] tracking-wide">
            {app ? Number(app.coinValue).toLocaleString() : '—'}
          </p>
          <p className="text-[10px] tracking-[0.2em] text-neutral-500 mt-1 mb-6">USD · {t('coins.registeredValue', { defaultValue: 'registered value' })}</p>
          <Link to="/merge-coin" className="luxury-btn-glass">{t('coins.exploreCoin')}</Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
