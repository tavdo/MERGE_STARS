import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  IsString,
  IsOptional,
  IsObject,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { AuditService } from './audit.service';
import { AuditActorRole } from './audit.types';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { User } from '../database/entities/user.entity';

class AuditInput {
  @IsString() @IsNotEmpty() @MaxLength(200) action: string;
  @IsOptional() @IsString() @MaxLength(200) object_id?: string;
  @IsOptional() @IsObject() meta?: Record<string, unknown>;
}

@Controller('audit')
@UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  @Get('events')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  list(@Query('limit') limit?: string) {
    const parsed = Number(limit ?? 200);
    const n = Number.isFinite(parsed)
      ? Math.max(1, Math.min(2000, Math.floor(parsed)))
      : 200;
    return this.audit.listLast(n);
  }

  /**
   * Append-only audit writer for semantic events (AI responses, QR scans, referral events, etc).
   * Actor can be provided via headers (x-actor-id / x-actor-role) or body.
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
    const action = body.action ?? 'UNSPECIFIED';

    const ev = this.audit.write({
      actor_id,
      actor_role,
      action,
      object_id: body.object_id ?? null,
      ip_address: (req.ip as string | undefined) ?? null,
      result: 'SUCCESS',
      owner: 'client',
      meta: body.meta ?? undefined,
    });

    return { ok: true, data: ev };
  }
}
