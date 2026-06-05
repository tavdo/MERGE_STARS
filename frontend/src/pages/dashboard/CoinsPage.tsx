import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '../../components/DashboardLayout'

export default function CoinsPage() {
  const { t } = useTranslation()

  return (
    <DashboardLayout titleKey="coins">
      <div className="grid lg:grid-cols-2 gap-6 max-w-5xl">
        <div className="dash-panel">
          <p className="dash-label mb-4">{t('coins.activeCoin')}</p>
          <div className="flex gap-5 items-start">
            <div className="dash-coin-badge text-2xl">★</div>
            <div>
              <h3 className="text-sm font-medium tracking-wide text-[#D4AF37] mb-2">{t('coins.coinName')}</h3>
              <p className="text-[11px] text-neutral-500 tracking-wide mb-1">{t('coins.quantity')}</p>
              <p className="text-[11px] text-neutral-500 tracking-wide mb-3">{t('coins.purity')}</p>
              <span className="dash-status dash-status--blue">{t('coins.inProduction')}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link to="/status" className="luxury-btn-glass">{t('coins.trackStatus')}</Link>
            <Link to="/merge-coin" className="luxury-btn-ghost">{t('coins.coinDetails')}</Link>
          </div>
        </div>
        <div className="dash-panel">
          <p className="dash-label mb-4">{t('coins.balance')}</p>
          <p className="font-serif-display text-4xl text-[#D4AF37] tracking-wide">12,450</p>
          <p className="text-[10px] tracking-[0.2em] text-neutral-500 mt-1 mb-6">MGS</p>
          <Link to="/merge-coin" className="luxury-btn-glass">{t('coins.exploreCoin')}</Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
