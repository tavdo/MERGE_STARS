import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'

export type SocialPlatform = 'whatsapp' | 'facebook' | 'messenger' | 'instagram' | 'x'

const PLATFORMS: { id: SocialPlatform; label: string; color: string }[] = [
  { id: 'whatsapp', label: 'WhatsApp', color: '#25D366' },
  { id: 'facebook', label: 'Facebook', color: '#1877F2' },
  { id: 'messenger', label: 'Messenger', color: '#0084FF' },
  { id: 'instagram', label: 'Instagram', color: '#E4405F' },
  { id: 'x', label: 'X', color: '#fff' },
]

function isMobile() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

export function openSocialShare(
  platform: SocialPlatform,
  link: string,
  message: string,
): 'opened' | 'copied' {
  const text = message.trim()
  const full = `${text}\n${link}`

  switch (platform) {
    case 'whatsapp':
      window.open(`https://wa.me/?text=${encodeURIComponent(full)}`, '_blank', 'noopener,noreferrer')
      return 'opened'
    case 'facebook':
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}&quote=${encodeURIComponent(text)}`,
        '_blank',
        'noopener,noreferrer,width=600,height=500',
      )
      return 'opened'
    case 'messenger':
      if (isMobile()) {
        window.location.href = `fb-messenger://share?link=${encodeURIComponent(link)}`
      } else {
        window.open(
          `https://www.facebook.com/dialog/send?link=${encodeURIComponent(link)}&redirect_uri=${encodeURIComponent(link)}&display=popup`,
          '_blank',
          'noopener,noreferrer,width=600,height=500',
        )
      }
      return 'opened'
    case 'x':
      window.open(
        `https://twitter.com/intent/tweet?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`,
        '_blank',
        'noopener,noreferrer,width=600,height=500',
      )
      return 'opened'
    case 'instagram':
      void navigator.clipboard.writeText(full)
      return 'copied'
    default:
      return 'opened'
  }
}

type Props = {
  link: string
  message?: string
  onAction?: (platform: SocialPlatform, result: 'opened' | 'copied') => void
}

export default function ReferralShareButtons({ link, message, onAction }: Props) {
  const { t } = useTranslation()
  const shareMessage =
    message ??
    t('referral.shareMessage', {
      defaultValue: 'Join MERGE STARS with my referral link',
    })

  return (
    <div className="referral-share">
      <p className="referral-share-label">
        {t('referral.shareOn', { defaultValue: 'Share on' })}
      </p>
      <div className="referral-share-grid">
        {PLATFORMS.map((p) => (
          <button
            key={p.id}
            type="button"
            className="referral-share-btn"
            style={{ '--share-accent': p.color } as CSSProperties}
            onClick={() => {
              const result = openSocialShare(p.id, link, shareMessage)
              onAction?.(p.id, result)
            }}
            title={p.label}
          >
            <span className="referral-share-btn-icon" aria-hidden>
              {p.id === 'whatsapp' && 'WA'}
              {p.id === 'facebook' && 'f'}
              {p.id === 'messenger' && 'M'}
              {p.id === 'instagram' && 'IG'}
              {p.id === 'x' && '𝕏'}
            </span>
            <span className="referral-share-btn-label">{p.label}</span>
          </button>
        ))}
      </div>
      <p className="referral-share-hint">
        {t('referral.shareHint', {
          defaultValue:
            'When someone registers through your link, they are counted under My Referrals automatically.',
        })}
      </p>
    </div>
  )
}
