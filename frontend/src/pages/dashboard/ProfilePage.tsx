import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import DashboardLayout from '../../components/DashboardLayout'
import ProfileAvatar from '../../components/profile/ProfileAvatar'
import {
  SOCIAL_LINK_KEYS,
  usersApi,
  type SocialLinkKey,
  type SocialLinks,
} from '@/features/users/api/users.api'
import { kycApi, type KycDocumentItem } from '@/features/kyc/api/kyc.api'
import { useAuthStore } from '@/features/auth/store/auth.store'
import type { Role } from '@/shared/types/api.types'
import { getApiErrorMessage } from '@/shared/utils/apiError'

type IdSide = 'id_front' | 'id_back'

const SOCIAL_PLACEHOLDERS: Record<SocialLinkKey, string> = {
  tiktok: 'https://www.tiktok.com/@…',
  facebook: 'https://www.facebook.com/…',
  instagram: 'https://www.instagram.com/…',
  linkedin: 'https://www.linkedin.com/in/…',
  whatsapp: '+995 … or https://wa.me/…',
  youtube: 'https://www.youtube.com/@…',
  x: 'https://x.com/…',
  telegram: '@username or https://t.me/…',
  website: 'https://…',
}

function emptySocialForm(): Record<SocialLinkKey, string> {
  return Object.fromEntries(SOCIAL_LINK_KEYS.map((k) => [k, ''])) as Record<SocialLinkKey, string>
}

function KycStatusPill({ status }: { status?: string | null }) {
  const s = (status ?? 'pending').toLowerCase()
  const tone =
    s === 'verified' ? 'profile-pill--ok' : s === 'rejected' ? 'profile-pill--bad' : 'profile-pill--wait'
  return <span className={`profile-pill ${tone}`}>{status ?? 'PENDING'}</span>
}

function KycDropzone({
  side,
  label,
  doc,
  uploading,
  onPick,
}: {
  side: IdSide
  label: string
  doc?: KycDocumentItem
  uploading: boolean
  onPick: (side: IdSide, file: File) => void
}) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  return (
    <div className="profile-dropzone-wrap">
      <p className="profile-dropzone-label">{label}</p>
      <button
        type="button"
        className={`profile-dropzone${dragging ? ' is-dragging' : ''}${doc ? ' has-file' : ''}`}
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          const file = e.dataTransfer.files?.[0]
          if (file) onPick(side, file)
        }}
      >
        {doc ? (
          <>
            <span className="profile-dropzone-file">{doc.originalName}</span>
            <span className="profile-dropzone-meta">{doc.status}</span>
          </>
        ) : (
          <>
            <span className="profile-dropzone-title">
              {uploading
                ? t('common.loading', { defaultValue: 'Loading…' })
                : t('pages.profile.kycDrop', { defaultValue: 'Drop file or browse' })}
            </span>
            <span className="profile-dropzone-meta">JPEG · PNG · WEBP · PDF · max 10 MB</span>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onPick(side, file)
          e.target.value = ''
        }}
      />
    </div>
  )
}

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
  const [kycUploadingSide, setKycUploadingSide] = useState<IdSide | null>(null)

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

  const [socialForm, setSocialForm] = useState<Record<SocialLinkKey, string>>(emptySocialForm)
  const [socialSaved, setSocialSaved] = useState(false)
  const [socialError, setSocialError] = useState<string | null>(null)

  const { data: profile, isLoading } = useQuery({
    queryKey: ['users-me'],
    queryFn: () => usersApi.getMe().then((r) => r.data.data),
  })

  const { data: kycDocs = [] } = useQuery({
    queryKey: ['kyc-docs'],
    queryFn: () => kycApi.listMine().then((r) => r.data.data),
  })

  const frontDoc = kycDocs.find((d) => d.documentType === 'id_front')
  const backDoc = kycDocs.find((d) => d.documentType === 'id_back')
  const otherDocs = kycDocs.filter((d) => d.documentType === 'other')

  useEffect(() => {
    if (!profile) return
    setFirstName(profile.firstName)
    setLastName(profile.lastName)
    setPhone(profile.phone ?? '')
    const next = emptySocialForm()
    const links = (profile.socialLinks ?? {}) as SocialLinks
    for (const key of SOCIAL_LINK_KEYS) {
      next[key] = links[key] ?? ''
    }
    setSocialForm(next)
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
      setError(
        getApiErrorMessage(err, t('pages.profile.avatarFailed', { defaultValue: 'Could not upload photo' })),
      ),
  })

  const uploadKyc = useMutation({
    mutationFn: ({ file, side }: { file: File; side: IdSide }) => kycApi.upload(file, side),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['kyc-docs'] })
      setKycMsg(t('pages.profile.kycUploaded', { defaultValue: 'Document uploaded' }))
      setTimeout(() => setKycMsg(null), 2500)
      setKycUploadingSide(null)
    },
    onError: (err) => {
      setKycMsg(getApiErrorMessage(err, 'Upload failed'))
      setKycUploadingSide(null)
    },
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
      setError(
        getApiErrorMessage(err, t('pages.profile.saveFailed', { defaultValue: 'Could not save profile' })),
      ),
  })

  const saveSocial = useMutation({
    mutationFn: () => {
      const socialLinks: Partial<Record<SocialLinkKey, string | null>> = {}
      for (const key of SOCIAL_LINK_KEYS) {
        socialLinks[key] = socialForm[key].trim() || null
      }
      return usersApi.updateMe({ socialLinks })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users-me'] })
      setSocialSaved(true)
      setSocialError(null)
      setTimeout(() => setSocialSaved(false), 2500)
    },
    onError: (err) =>
      setSocialError(
        getApiErrorMessage(
          err,
          t('pages.profile.socialSaveFailed', { defaultValue: 'Could not save social links' }),
        ),
      ),
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
      setPasswordErr(
        getApiErrorMessage(
          err,
          t('pages.profile.passwordFailed', { defaultValue: 'Could not change password' }),
        ),
      )
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
      setEmailErr(
        getApiErrorMessage(err, t('pages.profile.emailFailed', { defaultValue: 'Could not send code' })),
      )
    },
  })

  const confirmEmail = useMutation({
    mutationFn: () => usersApi.confirmEmailChange(newEmail.trim(), emailCode.trim(), emailPassword),
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
      setEmailErr(
        getApiErrorMessage(
          err,
          t('pages.profile.emailConfirmFailed', { defaultValue: 'Could not update email' }),
        ),
      )
    },
  })

  const pickKyc = (side: IdSide, file: File) => {
    setKycUploadingSide(side)
    uploadKyc.mutate({ file, side })
  }

  return (
    <DashboardLayout titleKey="profile">
      <div className="profile-page">
        <header className="profile-page-head">
          <p className="profile-kicker">{t('dashboard.titles.profile')}</p>
          <h1 className="profile-title">{t('pages.profile.description')}</h1>
        </header>

        {isLoading ? (
          <p className="profile-muted">{t('common.loading', { defaultValue: 'Loading…' })}</p>
        ) : (
          <>
            <section className="profile-identity">
              <ProfileAvatar
                hasAvatar={!!profile?.avatarUrl}
                firstName={firstName || profile?.firstName || ''}
                lastName={lastName || profile?.lastName || ''}
                onUpload={(file) => uploadAvatar.mutate(file)}
                uploading={uploadAvatar.isPending}
                avatarVersion={profile?.avatarUrl}
              />
              <div className="profile-identity-meta">
                <p className="profile-identity-email">{profile?.email}</p>
                <div className="profile-identity-badges">
                  <div className="profile-badge">
                    <span>MERGE ID</span>
                    <strong>{profile?.mergeId ?? '—'}</strong>
                  </div>
                  <div className="profile-badge">
                    <span>KYC</span>
                    <KycStatusPill status={profile?.kycStatus} />
                  </div>
                </div>
              </div>
            </section>

            <div className="profile-shell">
              <section className="profile-section">
                <div className="profile-section-head">
                  <h2>{t('pages.profile.personalSection', { defaultValue: 'PERSONAL INFO' })}</h2>
                  <p>{t('pages.profile.personalHint', { defaultValue: 'Name and phone used across your account.' })}</p>
                </div>
                <form
                  className="profile-form"
                  onSubmit={(e) => {
                    e.preventDefault()
                    save.mutate()
                  }}
                >
                  <div className="profile-grid-2">
                    <div className="profile-field">
                      <label htmlFor="profile-fn">{t('application.firstName')}</label>
                      <input
                        id="profile-fn"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="profile-field">
                      <label htmlFor="profile-ln">{t('application.lastName')}</label>
                      <input
                        id="profile-ln"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="profile-field">
                    <label htmlFor="profile-phone">{t('application.phone')}</label>
                    <input
                      id="profile-phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+995 …"
                    />
                  </div>
                  {error && <p className="profile-msg profile-msg--err">{error}</p>}
                  {saved && (
                    <p className="profile-msg profile-msg--ok">
                      {t('pages.profile.saved', { defaultValue: 'Profile updated' })}
                    </p>
                  )}
                  <div className="profile-actions">
                    <button type="submit" className="profile-btn-primary" disabled={save.isPending}>
                      {save.isPending ? '…' : t('pages.profile.save', { defaultValue: 'Save profile' })}
                    </button>
                  </div>
                </form>
              </section>

              <section className="profile-section">
                <div className="profile-section-head">
                  <h2>{t('pages.profile.socialSection', { defaultValue: 'SOCIAL LINKS' })}</h2>
                  <p>
                    {t('pages.profile.socialHint', {
                      defaultValue:
                        'Optional links shown on your public brand profile. Leave blank to hide.',
                    })}
                  </p>
                </div>
                <form
                  className="profile-form"
                  onSubmit={(e) => {
                    e.preventDefault()
                    saveSocial.mutate()
                  }}
                >
                  <div className="profile-social-grid">
                    {SOCIAL_LINK_KEYS.map((key) => (
                      <div key={key} className="profile-field">
                        <label htmlFor={`profile-social-${key}`}>
                          {t(`pages.profile.social.${key}`, {
                            defaultValue:
                              key === 'x'
                                ? 'X (Twitter)'
                                : key === 'website'
                                  ? 'Website'
                                  : key.charAt(0).toUpperCase() + key.slice(1),
                          })}
                        </label>
                        <input
                          id={`profile-social-${key}`}
                          type="text"
                          inputMode={key === 'whatsapp' ? 'tel' : 'url'}
                          autoComplete="url"
                          value={socialForm[key]}
                          onChange={(e) =>
                            setSocialForm((prev) => ({ ...prev, [key]: e.target.value }))
                          }
                          placeholder={SOCIAL_PLACEHOLDERS[key]}
                        />
                      </div>
                    ))}
                  </div>
                  {socialError && <p className="profile-msg profile-msg--err">{socialError}</p>}
                  {socialSaved && (
                    <p className="profile-msg profile-msg--ok">
                      {t('pages.profile.socialSaved', { defaultValue: 'Social links updated' })}
                    </p>
                  )}
                  <div className="profile-actions">
                    <button type="submit" className="profile-btn-primary" disabled={saveSocial.isPending}>
                      {saveSocial.isPending
                        ? '…'
                        : t('pages.profile.saveSocial', { defaultValue: 'Save social links' })}
                    </button>
                  </div>
                </form>
              </section>

              <section className="profile-section">
                <div className="profile-section-head">
                  <h2>{t('pages.profile.emailSection', { defaultValue: 'EMAIL' })}</h2>
                  <p>
                    {t('pages.profile.currentEmail', { defaultValue: 'Current email' })}:{' '}
                    <span className="profile-inline-strong">{profile?.email}</span>
                  </p>
                </div>
                <div className="profile-form">
                  <div className="profile-field">
                    <label htmlFor="profile-new-email">
                      {t('pages.profile.newEmail', { defaultValue: 'New email' })}
                    </label>
                    <input
                      id="profile-new-email"
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      disabled={emailStep === 'code'}
                    />
                  </div>
                  {emailStep === 'code' && (
                    <div className="profile-grid-2">
                      <div className="profile-field">
                        <label htmlFor="profile-email-code">
                          {t('pages.profile.verificationCode', { defaultValue: 'Verification code' })}
                        </label>
                        <input
                          id="profile-email-code"
                          className="profile-input-code"
                          value={emailCode}
                          onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          maxLength={6}
                          inputMode="numeric"
                        />
                      </div>
                      <div className="profile-field">
                        <label htmlFor="profile-email-pw">
                          {t('pages.profile.currentPassword', { defaultValue: 'Current password' })}
                        </label>
                        <input
                          id="profile-email-pw"
                          type="password"
                          value={emailPassword}
                          onChange={(e) => setEmailPassword(e.target.value)}
                          autoComplete="current-password"
                        />
                      </div>
                    </div>
                  )}
                  {emailErr && <p className="profile-msg profile-msg--err">{emailErr}</p>}
                  {emailMsg && <p className="profile-msg profile-msg--ok">{emailMsg}</p>}
                  <div className="profile-actions">
                    {emailStep === 'idle' ? (
                      <button
                        type="button"
                        className="profile-btn-secondary"
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
                          className="profile-btn-primary"
                          disabled={emailCode.length !== 6 || !emailPassword || confirmEmail.isPending}
                          onClick={() => confirmEmail.mutate()}
                        >
                          {confirmEmail.isPending
                            ? '…'
                            : t('pages.profile.confirmEmail', { defaultValue: 'Confirm new email' })}
                        </button>
                        <button
                          type="button"
                          className="profile-btn-ghost"
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
              </section>

              <section className="profile-section">
                <div className="profile-section-head">
                  <h2>{t('pages.profile.passwordSection', { defaultValue: 'PASSWORD' })}</h2>
                  <p>
                    {t('pages.profile.passwordHint', {
                      defaultValue: 'Use at least 8 characters for a new password.',
                    })}
                  </p>
                </div>
                <form
                  className="profile-form"
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (newPassword !== confirmPassword) {
                      setPasswordErr(
                        t('pages.profile.passwordMismatch', { defaultValue: 'Passwords do not match' }),
                      )
                      return
                    }
                    changePassword.mutate()
                  }}
                >
                  <div className="profile-field">
                    <label htmlFor="profile-cur-pw">
                      {t('pages.profile.currentPassword', { defaultValue: 'Current password' })}
                    </label>
                    <input
                      id="profile-cur-pw"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                  </div>
                  <div className="profile-grid-2">
                    <div className="profile-field">
                      <label htmlFor="profile-new-pw">
                        {t('pages.profile.newPassword', { defaultValue: 'New password' })}
                      </label>
                      <input
                        id="profile-new-pw"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        minLength={8}
                        autoComplete="new-password"
                      />
                    </div>
                    <div className="profile-field">
                      <label htmlFor="profile-confirm-pw">
                        {t('pages.profile.confirmPassword', { defaultValue: 'Confirm password' })}
                      </label>
                      <input
                        id="profile-confirm-pw"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        minLength={8}
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                  {passwordErr && <p className="profile-msg profile-msg--err">{passwordErr}</p>}
                  {passwordMsg && <p className="profile-msg profile-msg--ok">{passwordMsg}</p>}
                  <div className="profile-actions">
                    <button
                      type="submit"
                      className="profile-btn-primary"
                      disabled={!currentPassword || newPassword.length < 8 || changePassword.isPending}
                    >
                      {changePassword.isPending
                        ? '…'
                        : t('pages.profile.updatePassword', { defaultValue: 'Update password' })}
                    </button>
                  </div>
                </form>
              </section>

              <section className="profile-section">
                <div className="profile-section-head">
                  <h2>KYC</h2>
                  <p>
                    {t('pages.profile.kycHint', {
                      defaultValue: 'Upload front and back of your ID (JPEG, PNG, WEBP or PDF — max 10 MB).',
                    })}
                  </p>
                </div>
                <div className="profile-kyc-grid">
                  <KycDropzone
                    side="id_front"
                    label={t('pages.profile.kycFront', { defaultValue: 'ID front' })}
                    doc={frontDoc}
                    uploading={kycUploadingSide === 'id_front'}
                    onPick={pickKyc}
                  />
                  <KycDropzone
                    side="id_back"
                    label={t('pages.profile.kycBack', { defaultValue: 'ID back' })}
                    doc={backDoc}
                    uploading={kycUploadingSide === 'id_back'}
                    onPick={pickKyc}
                  />
                </div>
                {kycMsg && <p className="profile-msg profile-msg--ok">{kycMsg}</p>}
                {otherDocs.length > 0 && (
                  <ul className="profile-doc-list">
                    {otherDocs.map((d) => (
                      <li key={d.id}>
                        <span>{d.originalName}</span>
                        <span>{d.status}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            <div className="profile-footer-links">
              <Link to="/apply" className="profile-btn-secondary">
                {t('pages.profile.newApplication')}
              </Link>
              <Link to="/privacy" className="profile-btn-ghost">
                {t('pages.settings.privacyPolicy', { defaultValue: 'Privacy policy' })}
              </Link>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
