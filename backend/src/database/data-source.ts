import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { entities } from './entities';

const ssl =
  process.env.DB_SSL === 'true' ? { rejectUnauthorized: false as const } : false;

export default new DataSource(
  process.env.DATABASE_URL
    ? {
        type: 'postgres',
        url: process.env.DATABASE_URL,
        entities,
        migrations: ['src/database/migrations/*.ts'],
        ssl,
      }
    : {
        type: 'postgres',
        host: process.env.DB_HOST ?? 'localhost',
        port: Number(process.env.DB_PORT ?? 5432),
        username: process.env.DB_USER ?? 'merge_stars',
        password: process.env.DB_PASSWORD ?? 'merge_stars',
        database: process.env.DB_NAME ?? 'merge_stars',
        entities,
        migrations: ['src/database/migrations/*.ts'],
        ssl,
      },
);
