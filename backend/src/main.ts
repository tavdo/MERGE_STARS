import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuditService } from './audit/audit.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const audit = app.get(AuditService)
  app.use((req: any, res: any, next: any) => {
    const started = Date.now()
    const actorId = (req.headers['x-actor-id'] as string | undefined) ?? 'ANON'
    const actorRole = ((req.headers['x-actor-role'] as string | undefined) ?? 'ANONYMOUS').toUpperCase()
    res.on('finish', () => {
      const ok = res.statusCode >= 200 && res.statusCode < 400
      audit.write({
        actor_id: actorId,
        actor_role: actorRole as any,
        action: `${req.method} ${req.originalUrl ?? req.url}`,
        object_id: null,
        ip_address: (req.ip as string | undefined) ?? null,
        result: ok ? 'SUCCESS' : 'FAILURE',
        owner: 'system',
        meta: {
          status_code: res.statusCode,
          duration_ms: Date.now() - started,
        },
      })
    })
    next()
  })

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
