export type AuditActorRole =
  | 'CUSTOMER'
  | 'ADMIN'
  | 'MANAGER'
  | 'SYSTEM'
  | 'ANONYMOUS'

export type AuditResult = 'SUCCESS' | 'FAILURE'

export interface AuditEvent {
  event_id: string
  actor_id: string
  actor_role: AuditActorRole
  action: string
  object_id: string | null
  timestamp: string // ISO UTC
  ip_address: string | null
  result: AuditResult
  owner: string
  meta?: Record<string, unknown>
}

