import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as Sentry from '@sentry/nestjs';
import cookieParser = require('cookie-parser');
import { AppModule } from './app.module';
import { AuditService } from './audit/audit.service';

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV ?? 'development',
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
  });
}

function parseCorsOrigins(raw: string | undefined): string[] {
  if (!raw?.trim()) {
    return ['http://localhost:5173', 'http://localhost:8080'];
  }
  return raw.split(',').map((origin) => origin.trim()).filter(Boolean);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new IoAdapter(app));

  // Match frontend VITE_API_URL=/api and nginx proxy (full /api/... path)
  app.setGlobalPrefix('api');

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: false }),
  );

  app.enableCors({
    origin: parseCorsOrigins(process.env.FRONTEND_URL),
    credentials: true,
  });

  const audit = app.get(AuditService);
  app.use((req: any, res: any, next: any) => {
    const started = Date.now();
    const actorId = (req.headers['x-actor-id'] as string | undefined) ?? 'ANON';
    const actorRole = (
      (req.headers['x-actor-role'] as string | undefined) ?? 'ANONYMOUS'
    ).toUpperCase();
    res.on('finish', () => {
      const ok = res.statusCode >= 200 && res.statusCode < 400;
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
      });
    });
    next();
  });

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');
}
bootstrap();
