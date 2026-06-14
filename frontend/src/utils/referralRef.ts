const REF_STORAGE_KEY = 'merge-stars-referral-ref'

export function persistReferralRef(ref: string | null | undefined) {
  const code = ref?.trim()
  if (code) sessionStorage.setItem(REF_STORAGE_KEY, code)
}

export function getPersistedReferralRef(): string | undefined {
  const code = sessionStorage.getItem(REF_STORAGE_KEY)?.trim()
  return code || undefined
}

export function clearPersistedReferralRef() {
  sessionStorage.removeItem(REF_STORAGE_KEY)
}

export function getReferralCodeFromUrl(searchParams: URLSearchParams): string | undefined {
  return searchParams.get('ref')?.trim() || undefined
}

export function resolveReferralCode(searchParams: URLSearchParams): string | undefined {
  return getReferralCodeFromUrl(searchParams) ?? getPersistedReferralRef()
}
