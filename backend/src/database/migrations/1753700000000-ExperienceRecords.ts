import { MigrationInterface, QueryRunner } from 'typeorm';
export class ExperienceRecords1753700000000 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query(
      `CREATE TABLE IF NOT EXISTS fit_profiles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE, measurements jsonb NOT NULL DEFAULT '{}', source varchar NOT NULL DEFAULT 'MANUAL_UNVERIFIED', consented_at timestamptz NOT NULL, updated_at timestamptz NOT NULL DEFAULT now())`,
    );
    await q.query(
      `CREATE TABLE IF NOT EXISTS design_proposals (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), creator_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, source_product_id uuid NOT NULL REFERENCES catalog_items(id) ON DELETE RESTRICT, source_updated_at timestamptz NOT NULL, house_id uuid REFERENCES brand_line_profiles(id) ON DELETE SET NULL, brand_line_id varchar, preferences jsonb NOT NULL, verification_requested_at timestamptz, created_at timestamptz NOT NULL DEFAULT now())`,
    );
    await q.query(
      `CREATE INDEX IF NOT EXISTS design_proposals_creator ON design_proposals(creator_id,created_at)`,
    );
    await q.query(
      `CREATE TABLE IF NOT EXISTS product_interactions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, product_id uuid NOT NULL REFERENCES catalog_items(id) ON DELETE CASCADE, kind varchar NOT NULL CHECK(kind IN ('LIKE','SAVE')), created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(user_id,product_id,kind))`,
    );
  }
  async down(q: QueryRunner): Promise<void> {
    await q.query('DROP TABLE product_interactions');
    await q.query('DROP TABLE design_proposals');
    await q.query('DROP TABLE fit_profiles');
  }
}
