import i18n from 'i18next'
import type { ApplicationStatus } from '@/shared/types/api.types'

const STATUS_KEYS: ApplicationStatus[] = [
  'submitted',
  'under_review',
  'sent_to_crystal',
  'approved',
  'rejected',
  'funds_received',
  'production_queue',
  'in_production',
  'quality_check',
  'ready',
  'delivered',
]

/** English fallbacks used only if i18n is not ready. Prefer statusLabel(). */
export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  sent_to_crystal: 'Sent to Crystal',
  approved: 'Approved',
  rejected: 'Rejected',
  funds_received: 'Funds Received',
  production_queue: 'Production Queue',
  in_production: 'In Production',
  quality_check: 'Quality Check',
  ready: 'Ready',
  delivered: 'Delivered',
}

export function statusLabel(status: string): string {
  const key = status as ApplicationStatus
  if (STATUS_KEYS.includes(key)) {
    return i18n.t(`applicationStatuses.${key}`, { defaultValue: STATUS_LABELS[key] })
  }
  return status.replace(/_/g, ' ')
}

export function statusToApi(label: string): string {
  const byKey = STATUS_KEYS.find((k) => STATUS_LABELS[k] === label || statusLabel(k) === label)
  if (byKey) return byKey
  return label.toLowerCase().replace(/\s+/g, '_')
}

export const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  under_review: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
  submitted: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
  approved: { bg: 'rgba(34,197,94,0.12)', color: '#22c55e' },
  sent_to_crystal: { bg: 'rgba(59,130,246,0.12)', color: '#60a5fa' },
  funds_received: { bg: 'rgba(20,184,166,0.12)', color: '#2dd4bf' },
  rejected: { bg: 'rgba(239,68,68,0.12)', color: '#f87171' },
  in_production: { bg: 'rgba(139,92,246,0.12)', color: '#a78bfa' },
  production_queue: { bg: 'rgba(59,130,246,0.12)', color: '#60a5fa' },
  quality_check: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
  ready: { bg: 'rgba(212,175,55,0.12)', color: '#d4af37' },
  delivered: { bg: 'rgba(212,175,55,0.12)', color: '#d4af37' },
  // Legacy English labels (older admin UI)
  'Under Review': { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
  Submitted: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
  Approved: { bg: 'rgba(34,197,94,0.12)', color: '#22c55e' },
  'Sent to Crystal': { bg: 'rgba(59,130,246,0.12)', color: '#60a5fa' },
  'Funds Received': { bg: 'rgba(20,184,166,0.12)', color: '#2dd4bf' },
  Rejected: { bg: 'rgba(239,68,68,0.12)', color: '#f87171' },
  'In Production': { bg: 'rgba(139,92,246,0.12)', color: '#a78bfa' },
}
