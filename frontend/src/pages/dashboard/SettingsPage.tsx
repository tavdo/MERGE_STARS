import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '../../components/DashboardLayout'
import LanguageSwitcher from '../../components/LanguageSwitcher'

export default function SettingsPage() {
  const { t, i18n } = useTranslation()

  return (
    <DashboardLayout titleKey="settings">
      <div className="max-w-2xl space-y-6">
        <div>
          <p className="landing-sans-head mb-2">{t('dashboard.titles.settings')}</p>
          <p className="apply-lead">{t('pages.settings.description', { defaultValue: 'Language, notifications and account preferences.' })}</p>
        </div>

        <div className="apply-surface p-8 sm:p-10">
          <p className="text-xs font-bold tracking-[0.2em] mb-4" style={{ color: '#c9a84c' }}>LANGUAGE</p>
          <LanguageSwitcher />
          <p className="text-[11px] mt-3" style={{ color: 'rgba(255,255,255,0.4)' }}>Current: {i18n.language.toUpperCase()}</p>
        </div>

        <div className="apply-surface p-8 sm:p-10">
          <p className="text-xs font-bold tracking-[0.2em] mb-4" style={{ color: '#c9a84c' }}>ACCOUNT</p>
          <p className="text-sm text-neutral-500 mb-4">
            {t('pages.settings.profileMoved', { defaultValue: 'Profile photo, email, phone and password are managed on your profile page.' })}
          </p>
          <Link to="/dashboard/profile" className="gold-btn w-fit">
            {t('dashboard.nav.profile')}
          </Link>
        </div>

        <div className="apply-surface p-8 sm:p-10">
          <p className="text-xs font-bold tracking-[0.2em] mb-4" style={{ color: '#c9a84c' }}>LEGAL</p>
          <Link to="/privacy" className="gold-btn-outline">{t('pages.settings.privacyPolicy', { defaultValue: 'Privacy Policy' })}</Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
