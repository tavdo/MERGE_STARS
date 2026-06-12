import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import DashboardLayout from '../../components/DashboardLayout'
import { usersApi } from '@/features/users/api/users.api'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { SUPPORTED_LANGUAGES, type LanguageCode } from '@/i18n'

function SettingsTile({
  to,
  icon,
  title,
  description,
  badge,
}: {
  to: string
  icon: string
  title: string
  description: string
  badge?: string
}) {
  return (
    <Link
      to={to}
      className="group relative flex flex-col gap-4 rounded-xl border border-white/[0.08] bg-gradient-to-br from-white/[0.05] to-transparent p-6 transition-all duration-300 hover:border-[rgba(201,168,76,0.35)] hover:from-[rgba(201,168,76,0.06)]"
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[rgba(201,168,76,0.25)] text-lg text-[#c9a84c]"
          style={{ background: 'rgba(201,168,76,0.06)' }}
          aria-hidden
        >
          {icon}
        </span>
        <span
          className="text-neutral-600 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-[#c9a84c]"
          aria-hidden
        >
          →
        </span>
      </div>
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <h3 className="text-sm font-semibold tracking-wide text-white">{title}</h3>
          {badge && (
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
              {badge}
            </span>
          )}
        </div>
        <p className="text-sm leading-relaxed text-neutral-500">{description}</p>
      </div>
    </Link>
  )
}

export default function SettingsPage() {
  const { t, i18n } = useTranslation()
  const authUser = useAuthStore((s) => s.user)
  const currentLang = (i18n.language?.slice(0, 2) || 'en') as LanguageCode

  const { data: profile, isLoading } = useQuery({
    queryKey: ['users-me'],
    queryFn: () => usersApi.getMe().then((r) => r.data.data),
  })

  const displayName = profile
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : authUser
      ? `${authUser.firstName} ${authUser.lastName}`.trim()
      : '—'

  const email = profile?.email ?? authUser?.email ?? '—'
  const mergeId = profile?.mergeId ?? authUser?.mergeId ?? '—'
  const phone = profile?.phone?.trim()
  const kycStatus = profile?.kycStatus ?? '—'
  const initials =
    (profile?.firstName?.[0] ?? authUser?.firstName?.[0] ?? '') +
      (profile?.lastName?.[0] ?? authUser?.lastName?.[0] ?? '') || 'MS'

  const selectLanguage = (code: LanguageCode) => {
    void i18n.changeLanguage(code)
  }

  return (
    <DashboardLayout titleKey="settings">
      <div className="max-w-4xl space-y-8">
        <div>
          <p className="landing-sans-head mb-2">{t('dashboard.titles.settings')}</p>
          <p className="apply-lead">{t('pages.settings.description')}</p>
        </div>

        {/* Account overview */}
        <div
          className="relative overflow-hidden rounded-xl border border-[rgba(201,168,76,0.2)] p-6 sm:p-8"
          style={{
            background:
              'linear-gradient(135deg, rgba(201,168,76,0.08) 0%, rgba(10,10,10,0.95) 45%, rgba(10,10,10,1) 100%)',
          }}
        >
          <div
            className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #c9a84c 0%, transparent 70%)' }}
            aria-hidden
          />
          <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 text-xl font-bold tracking-wide"
              style={{ borderColor: 'rgba(201,168,76,0.45)', color: '#c9a84c', background: '#111' }}
            >
              {initials.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#c9a84c] mb-1">
                {t('pages.settings.accountOverview', { defaultValue: 'Your account' })}
              </p>
              {isLoading ? (
                <p className="text-sm text-neutral-500">{t('common.loading')}</p>
              ) : (
                <>
                  <h2 className="text-xl text-white font-medium truncate">{displayName}</h2>
                  <p className="text-sm text-neutral-400 mt-1 truncate">{email}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="rounded-md border border-white/10 bg-black/30 px-2.5 py-1 text-[11px] tracking-wide text-neutral-400">
                      {mergeId}
                    </span>
                    <span
                      className={`rounded-md border px-2.5 py-1 text-[11px] uppercase tracking-wider ${
                        phone
                          ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400'
                          : 'border-amber-500/25 bg-amber-500/10 text-amber-300'
                      }`}
                    >
                      {phone
                        ? phone
                        : t('pages.settings.phoneMissing', { defaultValue: 'Phone not set' })}
                    </span>
                    <span className="rounded-md border border-white/10 bg-black/30 px-2.5 py-1 text-[11px] uppercase tracking-wider text-neutral-500">
                      KYC: {kycStatus}
                    </span>
                  </div>
                </>
              )}
            </div>
            <Link to="/dashboard/profile" className="luxury-btn-glass shrink-0 justify-center text-xs">
              {t('pages.settings.editProfile', { defaultValue: 'Edit profile' })}
            </Link>
          </div>
        </div>

        {/* Quick links */}
        <div>
          <p className="text-xs font-bold tracking-[0.2em] mb-4 text-[#c9a84c]">
            {t('pages.settings.quickLinks', { defaultValue: 'PREFERENCES' })}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SettingsTile
              to="/dashboard/profile"
              icon="◦"
              title={t('dashboard.nav.profile')}
              description={t('pages.settings.profileCard', {
                defaultValue: 'Photo, name, phone number and contact details.',
              })}
              badge={!phone ? t('pages.settings.actionNeeded', { defaultValue: 'Action needed' }) : undefined}
            />
            <SettingsTile
              to="/dashboard/profile"
              icon="◇"
              title={t('pages.settings.securityTitle', { defaultValue: 'Security' })}
              description={t('pages.settings.securityCard', {
                defaultValue: 'Change password or update your email address.',
              })}
            />
            <SettingsTile
              to="/dashboard/support"
              icon="?"
              title={t('dashboard.nav.support')}
              description={t('pages.settings.supportCard', {
                defaultValue: 'Contact the team or browse help resources.',
              })}
            />
            <SettingsTile
              to="/dashboard/messages"
              icon="✉"
              title={t('dashboard.nav.messages')}
              description={t('pages.settings.messagesCard', {
                defaultValue: 'Application updates and platform notifications.',
              })}
            />
          </div>
        </div>

        {/* Language */}
        <div className="apply-surface p-6 sm:p-8">
          <p className="text-xs font-bold tracking-[0.2em] mb-2 text-[#c9a84c]">
            {t('pages.settings.languageTitle', { defaultValue: 'LANGUAGE' })}
          </p>
          <p className="text-sm text-neutral-500 mb-5">
            {t('pages.settings.languageHint', {
              defaultValue: 'Choose your preferred interface language.',
            })}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {SUPPORTED_LANGUAGES.map(({ code, labelKey }) => {
              const active = code === currentLang
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => selectLanguage(code)}
                  className={`rounded-lg border px-3 py-3 text-left text-sm transition-all ${
                    active
                      ? 'border-[rgba(201,168,76,0.5)] bg-[rgba(201,168,76,0.1)] text-[#f0d78a]'
                      : 'border-white/[0.08] bg-white/[0.02] text-neutral-400 hover:border-white/20 hover:text-neutral-200'
                  }`}
                >
                  <span className="block text-[10px] font-bold uppercase tracking-widest opacity-60 mb-0.5">
                    {code}
                  </span>
                  {t(labelKey)}
                </button>
              )
            })}
          </div>
        </div>

        {/* Legal */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 border-t border-white/[0.06]">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-600 w-full sm:w-auto">
            {t('pages.settings.legalTitle', { defaultValue: 'Legal' })}
          </span>
          <Link to="/privacy" className="text-sm text-neutral-500 hover:text-[#c9a84c] transition-colors">
            {t('pages.settings.privacyPolicy')}
          </Link>
          <Link to="/terms" className="text-sm text-neutral-500 hover:text-[#c9a84c] transition-colors">
            {t('pages.settings.terms', { defaultValue: 'Terms of service' })}
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
