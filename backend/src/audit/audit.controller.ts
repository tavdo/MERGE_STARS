import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { IsIn } from 'class-validator';
import { AuditService } from './audit.service';
import { AuditActorRole } from './audit.types';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { User } from '../database/entities/user.entity';

class AuditInput {
  @IsIn(['AI_PROMPT', 'AI_RESPONSE'])
  action: 'AI_PROMPT' | 'AI_RESPONSE';
}

@Controller('audit')
@UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  @Get('events')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  list(@Query('limit') limit?: string) {
    const parsed = Number(limit ?? 200);
    const n = Number.isFinite(parsed)
      ? Math.max(1, Math.min(2000, Math.floor(parsed)))
      : 200;
    return this.audit.listLast(n);
  }

  /**
   * Client-reported events carry the authenticated actor and a client owner label.
   */
  @Post('events')
  write(@Req() req: { user: User; ip?: string }, @Body() body: AuditInput) {
    const actor_id = req.user.id;
    const actor_role = (
      req.user.roles.includes('admin')
        ? 'ADMIN'
        : req.user.roles.includes('manager')
          ? 'MANAGER'
          : 'CUSTOMER'
    ) as AuditActorRole;

    const ev = this.audit.write({
      actor_id,
      actor_role,
      action: body.action,
      object_id: null,
      ip_address: (req.ip as string | undefined) ?? null,
      result: 'SUCCESS',
      owner: 'client',
    });

    return { ok: true, data: ev };
  }
}
