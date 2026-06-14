import { useEffect, useState } from 'react'
import { useAuthStore } from '@/features/auth/store/auth.store'

/** Fetch protected API asset URLs with Bearer token → blob URL for img/GLTF. */
export function useAuthAssetUrl(url: string | null | undefined) {
  const token = useAuthStore((s) => s.accessToken)
  const [blobUrl, setBlobUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!url) {
      setBlobUrl(null)
      return
    }

    const needsAuth = url.includes('/catalog/items/') || url.includes('/brand/me/logo')
    if (!needsAuth) {
      setBlobUrl(url)
      return
    }

    let objectUrl: string | null = null
    let cancelled = false

    fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error('asset')
        return res.blob()
      })
      .then((blob) => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setBlobUrl(objectUrl)
      })
      .catch(() => {
        if (!cancelled) setBlobUrl(null)
      })

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [url, token])

  return blobUrl
}
