import { MigrationInterface, QueryRunner } from 'typeorm';

export class PersonalMuseumVersions1753800000000 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE design_proposals ADD COLUMN parent_proposal_id uuid REFERENCES design_proposals(id) ON DELETE RESTRICT, ADD COLUMN publication_requested_at timestamptz, ADD COLUMN publication_consent_version varchar`);
    await q.query(`CREATE INDEX design_proposals_parent ON design_proposals(parent_proposal_id)`);
  }
  async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP INDEX design_proposals_parent`);
    await q.query(`ALTER TABLE design_proposals DROP COLUMN publication_consent_version, DROP COLUMN publication_requested_at, DROP COLUMN parent_proposal_id`);
  }
}
