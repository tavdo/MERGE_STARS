import type { ApplicationStatus } from '@/shared/types/api.types'

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
  return STATUS_LABELS[status as ApplicationStatus] ?? status.replace(/_/g, ' ')
}

export function statusToApi(label: string): string {
  const entry = Object.entries(STATUS_LABELS).find(([, v]) => v === label)
  return entry?.[0] ?? label.toLowerCase().replace(/\s+/g, '_')
}

export const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  'Under Review':    { bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b' },
  Submitted:         { bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b' },
  'Approved':        { bg: 'rgba(34,197,94,0.12)',   color: '#22c55e' },
  'Sent to Crystal': { bg: 'rgba(59,130,246,0.12)',  color: '#60a5fa' },
  'Funds Received':  { bg: 'rgba(20,184,166,0.12)',  color: '#2dd4bf' },
  'Rejected':        { bg: 'rgba(239,68,68,0.12)',   color: '#f87171' },
  'In Production':   { bg: 'rgba(139,92,246,0.12)',  color: '#a78bfa' },
}
