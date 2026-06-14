import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function PhoneMissingBanner() {
  const { t } = useTranslation()

  return (
    <div
      className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3"
      role="status"
    >
      <p className="text-sm text-amber-100/90">
        {t('pages.profile.phoneBanner', {
          defaultValue: 'Please add your phone number to your profile for account verification and order updates.',
        })}
      </p>
      <Link to="/dashboard/profile" className="luxury-btn-glass text-xs shrink-0 justify-center">
        {t('pages.profile.phoneBannerAction', { defaultValue: 'Add phone' })}
      </Link>
    </div>
  )
}
