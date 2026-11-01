import { Body, Controller, Get, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { createHash } from 'crypto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';
import { MuseumV78Service, RecordKind } from './museum-v78.service';
import { managerRequestSchema } from './contracts/ai-manager-contract';
import { answerManager, managerAvailability, ManagerServiceError } from './contracts/ai-manager-service';

@Controller('museum-v78')
export class MuseumV78Controller {
  private readonly aiRequests = new Map<string, { hash: string; until: number; result: Promise<unknown> }>();
  private readonly aiLimits = new Map<string, { until: number; count: number }>();
  private inFlight = 0;
  constructor(private readonly service: MuseumV78Service) {}

  private json(res: Response, data: unknown, status = 200) {
    return res.status(status).set({ 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' }).json(data);
  }
  private writeAllowed(req: Request) {
    const origin = req.get('origin');
    const allowed = (process.env.FRONTEND_URL || '').split(',').map(x => x.trim()).filter(Boolean);
    if (process.env.NODE_ENV !== 'production') allowed.push('http://127.0.0.1:5174', 'http://localhost:5173');
    return !!origin && allowed.includes(origin) && req.get('sec-fetch-site') !== 'cross-site';
  }
  private validKind(kind: string): kind is RecordKind { return ['designs', 'atelier', 'house-scenes'].includes(kind); }

  @Get('ai-manager')
  availability(@Res() res: Response) { return this.json(res, managerAvailability(process.env)); }

  @Post('ai-manager') @UseGuards(JwtAuthGuard)
  async ai(@CurrentUser() user: User, @Req() req: Request, @Body() body: unknown, @Res() res: Response) {
    if (!this.writeAllowed(req)) return this.json(res, { error: 'ORIGIN_REJECTED' }, 403);
    const parsed = managerRequestSchema.safeParse(body);
    if (!parsed.success) return this.json(res, { error: 'INVALID_AI_REQUEST' }, 400);
    const input = parsed.data, now = Date.now(), key = user.id + ':' + input.request_id;
    for (const [k,v] of this.aiRequests) if(v.until < now) this.aiRequests.delete(k);
    for (const [k,v] of this.aiLimits) if(v.until < now) this.aiLimits.delete(k);
    const hash = createHash('sha256').update(JSON.stringify(input)).digest('hex');
    const old = this.aiRequests.get(key);
    if (old && old.hash !== hash) return this.json(res, { error: 'IDEMPOTENCY_CONFLICT' }, 409);
    if (!old) {
      const limit = this.aiLimits.get(user.id);
      if(this.inFlight >= 4 || (limit?.count || 0) >= 8 || this.aiRequests.size >= 128) return this.json(res, { error: 'AI_RATE_LIMITED' }, 429);
      this.aiLimits.set(user.id,{until:limit?.until || now+60000,count:(limit?.count || 0)+1});this.inFlight++;
      const result = answerManager(input,process.env).finally(()=>{this.inFlight--});
      this.aiRequests.set(key,{hash,until:now+120000,result});
    }
    try { return this.json(res, await this.aiRequests.get(key)!.result); }
    catch(error) { return this.json(res, {error:error instanceof ManagerServiceError ? error.code : 'AI_PROVIDER_UNAVAILABLE'}, error instanceof ManagerServiceError ? error.status : 503); }
  }

  @Get('health') @UseGuards(JwtAuthGuard)
  async health(@CurrentUser() user: User, @Res() res: Response) {
    try { return this.json(res, await this.service.health(user.id)); }
    catch { return this.json(res, {error:'HEALTH_UNAVAILABLE'},503); }
  }

  @Get(':kind') @UseGuards(JwtAuthGuard)
  async list(@CurrentUser() user: User, @Param('kind') kind: string, @Res() res: Response) {
    if (!this.validKind(kind)) return this.json(res,{error:'NOT_FOUND'},404);
    try { return this.json(res, await this.service.list(user.id,kind)); }
    catch { return this.json(res,{error:kind==='house-scenes'?'SCENE_STORAGE_UNAVAILABLE':kind==='designs'?'DRAFT_STORAGE_UNAVAILABLE':'STORAGE_UNAVAILABLE'},503); }
  }

  @Post(':kind') @UseGuards(JwtAuthGuard)
  async save(@CurrentUser() user: User, @Param('kind') kind: string, @Req() req: Request, @Body() body: unknown, @Res() res: Response) {
    if (!this.validKind(kind)) return this.json(res,{error:'NOT_FOUND'},404);
    if (!this.writeAllowed(req)) return this.json(res,{error:'ORIGIN_REJECTED'},403);
    if (Buffer.byteLength(JSON.stringify(body)) > (kind === 'designs' ? 4096 : 20000)) return this.json(res,{error:'BODY_TOO_LARGE'},413);
    try { const saved=await this.service.save(user.id,kind,body);return this.json(res,saved,saved.replayed?200:201); }
    catch(error) {
      const code=error instanceof Error ? error.message : '';
      if(['INVALID_DESIGN','INVALID_SCENE','INVALID_PARENT'].includes(code)) return this.json(res,{error:code},400);
      if(['IDEMPOTENCY_CONFLICT','COLLECTION_LIMIT_REACHED','INVALID_SCENE_PARENT','SCENE_VERSION_LIMIT'].includes(code)) return this.json(res,{error:code},409);
      return this.json(res,{error:kind==='house-scenes'?'SCENE_STORAGE_UNAVAILABLE':'DRAFT_STORAGE_UNAVAILABLE'},503);
    }
  }
}
