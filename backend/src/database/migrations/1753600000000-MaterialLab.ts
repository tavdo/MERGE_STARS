import { MigrationInterface, QueryRunner } from 'typeorm';

export class MaterialLab1753600000000 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query(
      `CREATE TABLE material_lab_events (id uuid PRIMARY KEY, batch_id varchar NOT NULL, revision integer NOT NULL, action varchar NOT NULL, actor_id varchar NOT NULL, payload jsonb NOT NULL, created_at timestamptz NOT NULL, previous_hash varchar NOT NULL, hash varchar NOT NULL, UNIQUE(batch_id, revision))`,
    );
    await q.query(
      `CREATE TABLE material_lab_files (id uuid PRIMARY KEY, batch_id varchar NOT NULL, kind varchar NOT NULL, name varchar NOT NULL, mime varchar NOT NULL, hash varchar NOT NULL, bytes bytea NOT NULL, created_at timestamptz NOT NULL)`,
    );
    await q.query(
      `CREATE FUNCTION material_lab_no_mutation() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Material Lab evidence and events are append-only'; END; $$`,
    );
    for (const table of ['material_lab_events', 'material_lab_files']) {
      await q.query(
        `CREATE TRIGGER ${table}_immutable BEFORE UPDATE OR DELETE OR TRUNCATE ON ${table} FOR EACH STATEMENT EXECUTE FUNCTION material_lab_no_mutation()`,
      );
    }
  }
  async down(q: QueryRunner): Promise<void> {
    await q.query('DROP TABLE material_lab_files, material_lab_events');
    await q.query('DROP FUNCTION material_lab_no_mutation()');
  }
}
