import { useEffect, useState } from 'react'

type Props = {
  value: string
  size?: number
  color?: string
  className?: string
  alt?: string
}

export default function QrCodeImage({ value, size = 140, color = '#1a1a1a', className, alt = 'QR code' }: Props) {
  const [src, setSrc] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void import('qrcode').then((QRCode) =>
      QRCode.toDataURL(value, {
        width: size,
        margin: 1,
        color: { dark: color, light: '#ffffff' },
      }),
    ).then((url) => {
      if (!cancelled) setSrc(url)
    }).catch(() => {
      if (!cancelled) setSrc(null)
    })
    return () => {
      cancelled = true
    }
  }, [value, size, color])

  if (!src) {
    return (
      <div
        className={className}
        style={{ width: size, height: size, background: '#fff', borderRadius: 4 }}
        aria-hidden
      />
    )
  }

  return <img src={src} alt={alt} width={size} height={size} className={className} style={{ borderRadius: 4, background: '#fff' }} />
}

export async function downloadQrPng(value: string, filename: string, size = 512, color = '#1a1a1a') {
  const QRCode = await import('qrcode')
  const url = await QRCode.toDataURL(value, { width: size, margin: 2, color: { dark: color, light: '#ffffff' } })
  const link = document.createElement('a')
  link.download = filename
  link.href = url
  link.click()
}

export async function shareReferralLink(link: string): Promise<'shared' | 'copied'> {
  const payload = {
    title: 'MERGE STARS — Referral',
    text: 'Join MERGE STARS with my referral link',
    url: link,
  }

  if (typeof navigator.share === 'function') {
    try {
      await navigator.share(payload)
      return 'shared'
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') throw err
    }
  }

  await navigator.clipboard.writeText(link)
  return 'copied'
}
