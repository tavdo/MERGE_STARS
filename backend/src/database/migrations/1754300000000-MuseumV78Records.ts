import { MigrationInterface, QueryRunner } from 'typeorm';

export class MuseumV78Records1754300000000 implements MigrationInterface {
  name = 'MuseumV78Records1754300000000';
  async up(q: QueryRunner) {
    await q.query(`CREATE TABLE IF NOT EXISTS museum_v78_records (
      id uuid PRIMARY KEY, owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      kind varchar(20) NOT NULL, request_id uuid NOT NULL, request_hash varchar(64) NOT NULL,
      payload jsonb NOT NULL, created_at timestamptz NOT NULL,
      CONSTRAINT museum_v78_request_unique UNIQUE(owner_id,kind,request_id))`);
    await q.query('CREATE INDEX IF NOT EXISTS museum_v78_owner_kind_created ON museum_v78_records(owner_id,kind,created_at DESC,id DESC)');
    await q.query(`CREATE TABLE IF NOT EXISTS museum_v78_events (
      id uuid PRIMARY KEY, record_id uuid NOT NULL REFERENCES museum_v78_records(id) ON DELETE CASCADE,
      owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, event varchar(60) NOT NULL,
      created_at timestamptz NOT NULL)`);
  }
  async down(q: QueryRunner) {
    await q.query('DROP TABLE IF EXISTS museum_v78_events');
    await q.query('DROP TABLE IF EXISTS museum_v78_records');
  }
}
