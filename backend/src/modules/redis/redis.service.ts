import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

type RedisClient = {
  ping(): Promise<string>;
  quit(): Promise<string>;
};

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly log = new Logger(RedisService.name);
  private client: RedisClient | null = null;
  private mode: 'disabled' | 'connected' | 'error' = 'disabled';

  async onModuleInit() {
    const url = process.env.REDIS_URL?.trim();
    if (!url) {
      this.log.log('REDIS_URL not set — queue/cache disabled');
      return;
    }
    try {
      const { default: Redis } = await import('ioredis');
      const redis = new Redis(url, {
        maxRetriesPerRequest: 2,
        lazyConnect: true,
        connectTimeout: 5000,
      });
      await redis.connect();
      await redis.ping();
      this.client = redis as unknown as RedisClient;
      this.mode = 'connected';
      this.log.log('Redis connected');
    } catch (err) {
      this.mode = 'error';
      this.log.warn(`Redis unavailable: ${(err as Error).message}`);
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit().catch(() => undefined);
    }
  }

  isConnected() {
    return this.mode === 'connected';
  }

  status() {
    return this.mode;
  }

  async ping() {
    if (!this.client) return false;
    try {
      await this.client.ping();
      return true;
    } catch {
      return false;
    }
  }

  /** Simple list queue — BullMQ-compatible pattern without extra deps when Redis is up */
  async enqueueMail(job: { to: string; subject: string; html: string; text: string }) {
    if (!this.client) return false;
    try {
      const { default: Redis } = await import('ioredis');
      const redis = this.client as InstanceType<typeof Redis>;
      await redis.lpush('merge-stars:mail-queue', JSON.stringify(job));
      return true;
    } catch {
      return false;
    }
  }
}
