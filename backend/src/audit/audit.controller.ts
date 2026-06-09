import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common'
import { AuditService } from './audit.service'
import { AuditActorRole, AuditEvent } from './audit.types'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'

@Controller('audit')
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  @Get('events')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  list(@Query('limit') limit?: string) {
    const n = Math.max(1, Math.min(2000, Number(limit ?? 200)))
    return { ok: true, data: this.audit.listLast(n) }
  }

  /**
   * Append-only audit writer for semantic events (AI responses, QR scans, referral events, etc).
   * Actor can be provided via headers (x-actor-id / x-actor-role) or body.
   */
  @Post('events')
  write(@Req() req: any, @Body() body: Partial<AuditEvent> & { action?: string; object_id?: string | null }) {
    const actor_id = (req.headers['x-actor-id'] as string | undefined) ?? body.actor_id ?? 'ANON'
    const actor_role = ((req.headers['x-actor-role'] as string | undefined) ?? body.actor_role ?? 'ANONYMOUS').toUpperCase() as AuditActorRole
    const action = body.action ?? 'UNSPECIFIED'

    const ev = this.audit.write({
      actor_id,
      actor_role,
      action,
      object_id: body.object_id ?? null,
      ip_address: (req.ip as string | undefined) ?? null,
      result: (body.result as any) ?? 'SUCCESS',
      owner: body.owner ?? 'system',
      meta: body.meta ?? undefined,
    })

    return { ok: true, data: ev }
  }
}

