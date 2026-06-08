import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import DashboardLayout from '../../components/DashboardLayout'
import LanguageSwitcher from '../../components/LanguageSwitcher'
import { usersApi } from '@/features/users/api/users.api'
import { useAuthStore } from '@/features/auth/store/auth.store'
import type { Role } from '@/shared/types/api.types'
import { getApiErrorMessage } from '@/shared/utils/apiError'

export default function SettingsPage() {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()
  const setSession = useAuthStore((s) => s.setSession)
  const token = useAuthStore((s) => s.accessToken)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: profile, isLoading } = useQuery({
    queryKey: ['users-me'],
    queryFn: () => usersApi.getMe().then((r) => r.data.data),
  })

  useEffect(() => {
    if (!profile) return
    setFirstName(profile.firstName)
    setLastName(profile.lastName)
    setPhone(profile.phone ?? '')
  }, [profile])

  const save = useMutation({
    mutationFn: () =>
      usersApi.updateMe({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
      }),
    onSuccess: ({ data }) => {
      const user = data.data
      if (token) {
        setSession(token, {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          mergeId: user.mergeId,
          roles: user.roles as Role[],
        })
      }
      qc.invalidateQueries({ queryKey: ['users-me'] })
      setSaved(true)
      setError(null)
      setTimeout(() => setSaved(false), 2500)
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Could not save settings')),
  })

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
          <p className="text-xs font-bold tracking-[0.2em] mb-6" style={{ color: '#c9a84c' }}>PROFILE</p>
          {isLoading ? (
            <p className="text-neutral-500 text-sm">{t('common.loading')}</p>
          ) : (
            <form className="flex flex-col gap-6" onSubmit={(e) => { e.preventDefault(); save.mutate() }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="auth-field-label">{t('auth.firstName')}</label>
                  <input className="gold-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                </div>
                <div>
                  <label className="auth-field-label">{t('auth.lastName')}</label>
                  <input className="gold-input" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                </div>
              </div>
              <div>
                <label className="auth-field-label">{t('auth.phone')}</label>
                <input className="gold-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              {saved && <p className="text-sm text-emerald-400">Saved</p>}
              <button type="submit" className="gold-btn w-fit" disabled={save.isPending}>{save.isPending ? '…' : t('common.save', { defaultValue: 'Save' })}</button>
            </form>
          )}
        </div>

        <div className="apply-surface p-8 sm:p-10">
          <p className="text-xs font-bold tracking-[0.2em] mb-4" style={{ color: '#c9a84c' }}>LEGAL</p>
          <Link to="/privacy" className="gold-btn-outline">{t('pages.settings.privacyPolicy', { defaultValue: 'Privacy Policy' })}</Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
