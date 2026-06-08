import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { entities } from './entities';

export function buildTypeOrmOptions(): TypeOrmModuleOptions {
  const synchronize = process.env.DB_SYNC !== 'false';
  const ssl =
    process.env.DB_SSL === 'true' ? { rejectUnauthorized: false as const } : false;

  const shared = {
    type: 'postgres' as const,
    entities,
    synchronize,
    migrations: [`${__dirname}/migrations/*{.ts,.js}`],
    migrationsRun: process.env.DB_MIGRATE === 'true' && !synchronize,
    ssl,
  };

  if (process.env.DATABASE_URL) {
    return { ...shared, url: process.env.DATABASE_URL };
  }

  return {
    ...shared,
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USER ?? 'merge_stars',
    password: process.env.DB_PASSWORD ?? 'merge_stars',
    database: process.env.DB_NAME ?? 'merge_stars',
  };
}
