import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { usersApi } from '@/features/users/api/users.api'
import AvatarCropModal from './AvatarCropModal'

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

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
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [cropFileName, setCropFileName] = useState('avatar.jpg')
  const [pickError, setPickError] = useState<string | null>(null)

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

  useEffect(() => {
    return () => {
      if (cropSrc) URL.revokeObjectURL(cropSrc)
    }
  }, [cropSrc])

  const openPicker = () => inputRef.current?.click()

  const closeCrop = () => {
    setCropSrc((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
  }

  const onFilePicked = (file: File | undefined) => {
    setPickError(null)
    if (!file) return

    if (!ALLOWED_TYPES.has(file.type)) {
      setPickError(
        t('pages.profile.photoTypeInvalid', {
          defaultValue: 'Allowed types: JPEG, PNG, WEBP',
        }),
      )
      return
    }
    if (file.size > MAX_BYTES) {
      setPickError(
        t('pages.profile.photoTooLarge', {
          defaultValue: 'Image too large (max 5 MB)',
        }),
      )
      return
    }

    setCropSrc((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
    setCropFileName(file.name || 'avatar.jpg')
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <button
        type="button"
        className="relative group shrink-0"
        onClick={openPicker}
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
        {pickError && <p className="text-sm text-red-400 mt-2">{pickError}</p>}
        <button
          type="button"
          className="luxury-btn-ghost mt-3 text-xs"
          onClick={openPicker}
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
          onFilePicked(e.target.files?.[0])
          e.target.value = ''
        }}
      />

      {cropSrc && (
        <AvatarCropModal
          imageSrc={cropSrc}
          fileName={cropFileName}
          onCancel={closeCrop}
          onConfirm={(file) => {
            closeCrop()
            onUpload(file)
          }}
        />
      )}
    </div>
  )
}
