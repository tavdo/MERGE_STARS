import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import DashboardLayout from '../../components/DashboardLayout'
import ProfileAvatar from '../../components/profile/ProfileAvatar'
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

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null)
  const [passwordErr, setPasswordErr] = useState<string | null>(null)

  const [newEmail, setNewEmail] = useState('')
  const [emailCode, setEmailCode] = useState('')
  const [emailPassword, setEmailPassword] = useState('')
  const [emailStep, setEmailStep] = useState<'idle' | 'code'>('idle')
  const [emailMsg, setEmailMsg] = useState<string | null>(null)
  const [emailErr, setEmailErr] = useState<string | null>(null)

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

  const syncSession = (user: {
    id: string
    firstName: string
    lastName: string
    email: string
    mergeId: string
    roles: Role[]
  }) => {
    if (token) {
      setSession(token, {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mergeId: user.mergeId,
        roles: user.roles,
      })
    }
  }

  const uploadAvatar = useMutation({
    mutationFn: (file: File) => usersApi.uploadAvatar(file),
    onSuccess: ({ data }) => {
      qc.invalidateQueries({ queryKey: ['users-me'] })
      syncSession({ ...data.data, roles: data.data.roles as Role[] })
      setError(null)
    },
    onError: (err) =>
      setError(getApiErrorMessage(err, t('pages.profile.avatarFailed', { defaultValue: 'Could not upload photo' }))),
  })

  const uploadKyc = useMutation({
    mutationFn: (file: File) => kycApi.upload(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['kyc-docs'] })
      setKycMsg(t('pages.profile.kycUploaded', { defaultValue: 'Document uploaded' }))
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
      syncSession({ ...data.data, roles: data.data.roles as Role[] })
      qc.invalidateQueries({ queryKey: ['users-me'] })
      setSaved(true)
      setError(null)
      setTimeout(() => setSaved(false), 2500)
    },
    onError: (err) =>
      setError(getApiErrorMessage(err, t('pages.profile.saveFailed', { defaultValue: 'Could not save profile' }))),
  })

  const changePassword = useMutation({
    mutationFn: () => usersApi.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordErr(null)
      setPasswordMsg(t('pages.profile.passwordUpdated', { defaultValue: 'Password updated' }))
      setTimeout(() => setPasswordMsg(null), 3000)
    },
    onError: (err) => {
      setPasswordMsg(null)
      setPasswordErr(getApiErrorMessage(err, t('pages.profile.passwordFailed', { defaultValue: 'Could not change password' })))
    },
  })

  const requestEmail = useMutation({
    mutationFn: () => usersApi.requestEmailChange(newEmail.trim()),
    onSuccess: () => {
      setEmailStep('code')
      setEmailErr(null)
      setEmailMsg(t('pages.profile.emailCodeSent', { defaultValue: 'Verification code sent to new email' }))
    },
    onError: (err) => {
      setEmailMsg(null)
      setEmailErr(getApiErrorMessage(err, t('pages.profile.emailFailed', { defaultValue: 'Could not send code' })))
    },
  })

  const confirmEmail = useMutation({
    mutationFn: () =>
      usersApi.confirmEmailChange(newEmail.trim(), emailCode.trim(), emailPassword),
    onSuccess: ({ data }) => {
      syncSession({ ...data.data, roles: data.data.roles as Role[] })
      qc.invalidateQueries({ queryKey: ['users-me'] })
      setNewEmail('')
      setEmailCode('')
      setEmailPassword('')
      setEmailStep('idle')
      setEmailErr(null)
      setEmailMsg(t('pages.profile.emailUpdated', { defaultValue: 'Email updated successfully' }))
    },
    onError: (err) => {
      setEmailMsg(null)
      setEmailErr(getApiErrorMessage(err, t('pages.profile.emailConfirmFailed', { defaultValue: 'Could not update email' })))
    },
  })

  const sectionTitle = (label: string) => (
    <p className="text-xs font-bold tracking-[0.2em] mb-6" style={{ color: '#c9a84c' }}>
      {label}
    </p>
  )

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
            <>
              {sectionTitle(t('pages.profile.photoSection', { defaultValue: 'PROFILE PHOTO' }))}
              <ProfileAvatar
                hasAvatar={!!profile?.avatarUrl}
                firstName={firstName || profile?.firstName || ''}
                lastName={lastName || profile?.lastName || ''}
                onUpload={(file) => uploadAvatar.mutate(file)}
                uploading={uploadAvatar.isPending}
                avatarVersion={profile?.avatarUrl}
              />
            </>
          )}
        </div>

        <div className="apply-surface p-8 sm:p-10">
          {sectionTitle(t('pages.profile.personalSection', { defaultValue: 'PERSONAL INFO' }))}
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
                <label className="apply-label" htmlFor="profile-phone">
                  {t('application.phone')}
                </label>
                <input
                  id="profile-phone"
                  className="apply-field"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+995 …"
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

              <button type="submit" className="luxury-btn-glass justify-center w-full sm:w-auto" disabled={save.isPending}>
                {save.isPending ? '…' : t('pages.profile.save', { defaultValue: 'Save profile' })}
              </button>
            </form>
          )}
        </div>

        <div className="apply-surface p-8 sm:p-10">
          {sectionTitle(t('pages.profile.emailSection', { defaultValue: 'EMAIL' }))}
          <p className="text-sm text-neutral-500 mb-4">
            {t('pages.profile.currentEmail', { defaultValue: 'Current email' })}:{' '}
            <span className="text-neutral-300">{profile?.email}</span>
          </p>

          <div className="flex flex-col gap-4">
            <div>
              <label className="apply-label" htmlFor="profile-new-email">
                {t('pages.profile.newEmail', { defaultValue: 'New email' })}
              </label>
              <input
                id="profile-new-email"
                type="email"
                className="apply-field"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                disabled={emailStep === 'code'}
              />
            </div>

            {emailStep === 'code' && (
              <>
                <div>
                  <label className="apply-label" htmlFor="profile-email-code">
                    {t('pages.profile.verificationCode', { defaultValue: 'Verification code' })}
                  </label>
                  <input
                    id="profile-email-code"
                    className="apply-field tracking-[0.3em]"
                    value={emailCode}
                    onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    inputMode="numeric"
                  />
                </div>
                <div>
                  <label className="apply-label" htmlFor="profile-email-pw">
                    {t('pages.profile.currentPassword', { defaultValue: 'Current password' })}
                  </label>
                  <input
                    id="profile-email-pw"
                    type="password"
                    className="apply-field"
                    value={emailPassword}
                    onChange={(e) => setEmailPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>
              </>
            )}

            {emailErr && <p className="text-sm text-red-400">{emailErr}</p>}
            {emailMsg && <p className="text-sm text-emerald-400">{emailMsg}</p>}

            <div className="flex flex-wrap gap-3">
              {emailStep === 'idle' ? (
                <button
                  type="button"
                  className="luxury-btn-ghost"
                  disabled={!newEmail.trim() || requestEmail.isPending}
                  onClick={() => requestEmail.mutate()}
                >
                  {requestEmail.isPending
                    ? '…'
                    : t('pages.profile.sendEmailCode', { defaultValue: 'Send verification code' })}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="luxury-btn-glass"
                    disabled={
                      emailCode.length !== 6 ||
                      !emailPassword ||
                      confirmEmail.isPending
                    }
                    onClick={() => confirmEmail.mutate()}
                  >
                    {confirmEmail.isPending
                      ? '…'
                      : t('pages.profile.confirmEmail', { defaultValue: 'Confirm new email' })}
                  </button>
                  <button
                    type="button"
                    className="luxury-btn-ghost"
                    onClick={() => {
                      setEmailStep('idle')
                      setEmailCode('')
                      setEmailPassword('')
                      setEmailErr(null)
                      setEmailMsg(null)
                    }}
                  >
                    {t('common.cancel', { defaultValue: 'Cancel' })}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="apply-surface p-8 sm:p-10">
          {sectionTitle(t('pages.profile.passwordSection', { defaultValue: 'PASSWORD' }))}
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              if (newPassword !== confirmPassword) {
                setPasswordErr(t('pages.profile.passwordMismatch', { defaultValue: 'Passwords do not match' }))
                return
              }
              changePassword.mutate()
            }}
          >
            <div>
              <label className="apply-label" htmlFor="profile-cur-pw">
                {t('pages.profile.currentPassword', { defaultValue: 'Current password' })}
              </label>
              <input
                id="profile-cur-pw"
                type="password"
                className="apply-field"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="apply-label" htmlFor="profile-new-pw">
                  {t('pages.profile.newPassword', { defaultValue: 'New password' })}
                </label>
                <input
                  id="profile-new-pw"
                  type="password"
                  className="apply-field"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="apply-label" htmlFor="profile-confirm-pw">
                  {t('pages.profile.confirmPassword', { defaultValue: 'Confirm password' })}
                </label>
                <input
                  id="profile-confirm-pw"
                  type="password"
                  className="apply-field"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
            </div>
            {passwordErr && <p className="text-sm text-red-400">{passwordErr}</p>}
            {passwordMsg && <p className="text-sm text-emerald-400">{passwordMsg}</p>}
            <button
              type="submit"
              className="luxury-btn-glass w-full sm:w-auto justify-center"
              disabled={!currentPassword || newPassword.length < 8 || changePassword.isPending}
            >
              {changePassword.isPending
                ? '…'
                : t('pages.profile.updatePassword', { defaultValue: 'Update password' })}
            </button>
          </form>
        </div>

        <div className="apply-surface p-8 sm:p-10">
          {sectionTitle('KYC')}
          <p className="text-sm text-neutral-500 mb-4">
            {t('pages.profile.kycHint', { defaultValue: 'Upload ID document (PDF, JPEG, PNG — max 10 MB)' })}
          </p>
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

        <div className="flex flex-wrap gap-3">
          <Link to="/apply" className="luxury-btn-ghost">
            {t('pages.profile.newApplication')}
          </Link>
          <Link to="/dashboard/settings" className="luxury-btn-ghost">
            {t('pages.profile.settings')}
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
