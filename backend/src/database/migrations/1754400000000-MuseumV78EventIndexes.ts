import { MigrationInterface, QueryRunner } from 'typeorm';

export class MuseumV78EventIndexes1754400000000 implements MigrationInterface {
  name = 'MuseumV78EventIndexes1754400000000';
  async up(q: QueryRunner) {
    await q.query('CREATE INDEX IF NOT EXISTS museum_v78_events_record ON museum_v78_events(record_id)');
    await q.query('CREATE INDEX IF NOT EXISTS museum_v78_events_owner ON museum_v78_events(owner_id)');
  }
  async down(q: QueryRunner) {
    await q.query('DROP INDEX IF EXISTS museum_v78_events_owner');
    await q.query('DROP INDEX IF EXISTS museum_v78_events_record');
  }
}
