import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { usersApi } from '@/features/users/api/users.api'

interface ProfileAvatarProps {
  hasAvatar: boolean
  firstName: string
  lastName: string
  onUpload: (file: File) => void
  uploading?: boolean
  avatarVersion?: string | null
}

export default function ProfileAvatar({
  hasAvatar,
  firstName,
  lastName,
  onUpload,
  uploading,
  avatarVersion,
}: ProfileAvatarProps) {
  const { t } = useTranslation()
  const token = useAuthStore((s) => s.accessToken)
  const inputRef = useRef<HTMLInputElement>(null)
  const [src, setSrc] = useState<string | null>(null)

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '?'

  useEffect(() => {
    if (!hasAvatar || !token) {
      setSrc(null)
      return
    }

    let objectUrl: string | null = null
    let cancelled = false

    fetch(`${usersApi.avatarFileUrl()}?v=${encodeURIComponent(avatarVersion ?? '')}`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error('avatar')
        return res.blob()
      })
      .then((blob) => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setSrc(objectUrl)
      })
      .catch(() => {
        if (!cancelled) setSrc(null)
      })

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [hasAvatar, token, avatarVersion])

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <button
        type="button"
        className="relative group shrink-0"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        aria-label={t('pages.profile.changePhoto', { defaultValue: 'Change photo' })}
      >
        <div
          className="w-28 h-28 rounded-full overflow-hidden border-2 flex items-center justify-center text-2xl font-bold tracking-wide"
          style={{ borderColor: 'rgba(201,168,76,0.45)', background: '#111', color: '#c9a84c' }}
        >
          {src ? (
            <img src={src} alt="" className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <span
          className="absolute inset-0 rounded-full flex items-center justify-center text-[10px] font-bold tracking-[0.15em] uppercase opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'rgba(0,0,0,0.55)', color: '#f0d78a' }}
        >
          {uploading ? '…' : t('pages.profile.changePhoto', { defaultValue: 'Change' })}
        </span>
      </button>

      <div className="text-center sm:text-left">
        <p className="text-lg text-white font-medium">
          {firstName} {lastName}
        </p>
        <p className="text-sm text-neutral-500 mt-1">
          {t('pages.profile.photoHint', { defaultValue: 'JPEG, PNG or WEBP · max 5 MB' })}
        </p>
        <button
          type="button"
          className="luxury-btn-ghost mt-3 text-xs"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading
            ? t('common.loading', { defaultValue: 'Loading…' })
            : t('pages.profile.uploadPhoto', { defaultValue: 'Upload photo' })}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onUpload(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}
