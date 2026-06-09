import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import DashboardLayout from '../../components/DashboardLayout'
import { usersApi } from '@/features/users/api/users.api'
import { kycApi } from '@/features/kyc/api/kyc.api'
import { useAuthStore } from '@/features/auth/store/auth.store'
import type { Role } from '@/shared/types/api.types'
import { getApiErrorMessage } from '@/shared/utils/apiError'

export default function ProfilePage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const setSession = useAuthStore((s) => s.setSession)
  const token = useAuthStore((s) => s.accessToken)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [kycMsg, setKycMsg] = useState<string | null>(null)

  const { data: profile, isLoading } = useQuery({
    queryKey: ['users-me'],
    queryFn: () => usersApi.getMe().then((r) => r.data.data),
  })

  const { data: kycDocs = [] } = useQuery({
    queryKey: ['kyc-docs'],
    queryFn: () => kycApi.listMine().then((r) => r.data.data),
  })

  useEffect(() => {
    if (!profile) return
    setFirstName(profile.firstName)
    setLastName(profile.lastName)
    setPhone(profile.phone ?? '')
  }, [profile])

  const uploadKyc = useMutation({
    mutationFn: (file: File) => kycApi.upload(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['kyc-docs'] })
      setKycMsg('Document uploaded')
      setTimeout(() => setKycMsg(null), 2500)
    },
    onError: (err) => setKycMsg(getApiErrorMessage(err, 'Upload failed')),
  })

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
    onError: (err) => setError(getApiErrorMessage(err, t('pages.profile.saveFailed', { defaultValue: 'Could not save profile' }))),
  })

  return (
    <DashboardLayout titleKey="profile">
      <div className="max-w-2xl space-y-6">
        <div>
          <p className="landing-sans-head mb-2">{t('dashboard.titles.profile')}</p>
          <p className="apply-lead">{t('pages.profile.description')}</p>
        </div>

        <div className="apply-surface p-8 sm:p-10">
          {isLoading ? (
            <p className="text-neutral-500 text-sm">{t('common.loading', { defaultValue: 'Loading…' })}</p>
          ) : (
            <form
              className="flex flex-col gap-6"
              onSubmit={(e) => {
                e.preventDefault()
                save.mutate()
              }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="apply-label" htmlFor="profile-fn">
                    {t('application.firstName')}
                  </label>
                  <input
                    id="profile-fn"
                    className="apply-field"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="apply-label" htmlFor="profile-ln">
                    {t('application.lastName')}
                  </label>
                  <input
                    id="profile-ln"
                    className="apply-field"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="apply-label">{t('application.email')}</label>
                <input className="apply-field apply-field--muted" value={profile?.email ?? ''} readOnly />
              </div>

              <div>
                <label className="apply-label" htmlFor="profile-phone">
                  {t('application.phone')}
                </label>
                <input
                  id="profile-phone"
                  className="apply-field"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="apply-label mb-1">MERGE ID</p>
                  <p className="text-sm text-[#D4AF37] tracking-wide">{profile?.mergeId ?? '—'}</p>
                </div>
                <div>
                  <p className="apply-label mb-1">KYC</p>
                  <p className="text-sm text-neutral-400 uppercase tracking-wider">{profile?.kycStatus ?? '—'}</p>
                </div>
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}
              {saved && (
                <p className="text-sm text-emerald-400">{t('pages.profile.saved', { defaultValue: 'Profile updated' })}</p>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button type="submit" className="luxury-btn-glass justify-center flex-1" disabled={save.isPending}>
                  {save.isPending ? '…' : t('pages.profile.save', { defaultValue: 'Save profile' })}
                </button>
                <Link to="/apply" className="luxury-btn-ghost justify-center flex-1">
                  {t('pages.profile.newApplication')}
                </Link>
              </div>
            </form>
          )}
        </div>

        <div className="apply-surface p-8 sm:p-10 mt-6">
          <p className="apply-label mb-2">KYC DOCUMENTS</p>
          <p className="text-sm text-neutral-500 mb-4">Upload ID document (PDF, JPEG, PNG — max 10 MB)</p>
          <input
            type="file"
            accept=".pdf,image/jpeg,image/png,image/webp"
            className="text-sm text-neutral-400 mb-4 block"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) uploadKyc.mutate(file)
              e.target.value = ''
            }}
          />
          {kycMsg && <p className="text-sm text-emerald-400 mb-3">{kycMsg}</p>}
          {kycDocs.length > 0 && (
            <ul className="space-y-2">
              {kycDocs.map((d) => (
                <li key={d.id} className="text-sm text-neutral-400 flex justify-between gap-2">
                  <span>{d.originalName}</span>
                  <span className="uppercase text-[10px] tracking-wider">{d.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
