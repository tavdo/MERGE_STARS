import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
      } else if (typeof body === 'object' && body !== null) {
        const o = body as Record<string, unknown>;
        message = Array.isArray(o.message)
          ? (o.message as string[]).join('; ')
          : String(o.message ?? message);
        code = String(o.error ?? code).replace(/\s+/g, '_').toUpperCase();
      }
    }

    res.status(status).json({
      error: { code, message, statusCode: status },
      meta: { timestamp: new Date().toISOString(), version: '1.0.0' },
    });
  }
}
