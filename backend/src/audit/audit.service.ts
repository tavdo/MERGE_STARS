import { Injectable } from '@nestjs/common'
import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { AuditEvent } from './audit.types'

function isoUtcNow() {
  return new Date().toISOString()
}

function makeEventId() {
  // stable enough for dev; append-only file keeps full history
  const t = Date.now().toString(36).toUpperCase()
  const r = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `AUD-${t}-${r}`
}

@Injectable()
export class AuditService {
  private readonly filePath = resolve(process.cwd(), 'data', 'audit.log.jsonl')

  private ensureDir() {
    const dir = dirname(this.filePath)
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  }

  write(event: Omit<AuditEvent, 'event_id' | 'timestamp'> & Partial<Pick<AuditEvent, 'event_id' | 'timestamp'>>) {
    const ev: AuditEvent = {
      event_id: event.event_id ?? makeEventId(),
      timestamp: event.timestamp ?? isoUtcNow(),
      actor_id: event.actor_id,
      actor_role: event.actor_role,
      action: event.action,
      object_id: event.object_id ?? null,
      ip_address: event.ip_address ?? null,
      result: event.result,
      owner: event.owner,
      meta: event.meta,
    }

    this.ensureDir()
    appendFileSync(this.filePath, JSON.stringify(ev) + '\n', { encoding: 'utf8' })
    return ev
  }

  /**
   * Returns last N events (best-effort, for dev/demo).
   */
  listLast(limit = 200): AuditEvent[] {
    if (!existsSync(this.filePath)) return []
    const raw = readFileSync(this.filePath, 'utf8')
    const lines = raw.trim().length ? raw.trim().split('\n') : []
    const slice = lines.slice(Math.max(0, lines.length - limit))
    const out: AuditEvent[] = []
    for (const line of slice) {
      try {
        out.push(JSON.parse(line) as AuditEvent)
      } catch {
        // ignore bad lines
      }
    }
    return out
  }
}

