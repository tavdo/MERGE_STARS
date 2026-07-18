const REF_STORAGE_KEY = 'merge-stars-referral-ref'
const SRC_STORAGE_KEY = 'merge-stars-referral-src'

export function persistReferralRef(ref: string | null | undefined) {
  const code = ref?.trim()
  if (code) sessionStorage.setItem(REF_STORAGE_KEY, code)
}

export function persistReferralSource(src: string | null | undefined) {
  const value = src?.trim().toLowerCase()
  if (value === 'qr' || value === 'link') {
    sessionStorage.setItem(SRC_STORAGE_KEY, value)
  }
}

export function getPersistedReferralRef(): string | undefined {
  const code = sessionStorage.getItem(REF_STORAGE_KEY)?.trim()
  return code || undefined
}

export function getPersistedReferralSource(): string | undefined {
  const src = sessionStorage.getItem(SRC_STORAGE_KEY)?.trim().toLowerCase()
  return src || undefined
}

export function clearPersistedReferralRef() {
  sessionStorage.removeItem(REF_STORAGE_KEY)
  sessionStorage.removeItem(SRC_STORAGE_KEY)
}

export function getReferralCodeFromUrl(searchParams: URLSearchParams): string | undefined {
  return searchParams.get('ref')?.trim() || undefined
}

export function getReferralSourceFromUrl(searchParams: URLSearchParams): string | undefined {
  const src = searchParams.get('src')?.trim().toLowerCase()
  if (src === 'qr' || src === 'link') return src
  return undefined
}

export function resolveReferralCode(searchParams: URLSearchParams): string | undefined {
  return getReferralCodeFromUrl(searchParams) ?? getPersistedReferralRef()
}

export function resolveReferralSource(searchParams: URLSearchParams): string | undefined {
  return getReferralSourceFromUrl(searchParams) ?? getPersistedReferralSource()
}
