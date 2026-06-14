import { MigrationInterface, QueryRunner } from 'typeorm';

export class PhaseE1741000000000 implements MigrationInterface {
  name = 'PhaseE1741000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "catalog_items"
      ADD COLUMN IF NOT EXISTS "model3d_url" varchar NULL,
      ADD COLUMN IF NOT EXISTS "model3d_format" varchar NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "avatar_url" varchar NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "orders"
      ADD COLUMN IF NOT EXISTS "tracking_code" varchar NULL,
      ADD COLUMN IF NOT EXISTS "courier" varchar NULL,
      ADD COLUMN IF NOT EXISTS "est_delivery_at" TIMESTAMPTZ NULL,
      ADD COLUMN IF NOT EXISTS "delivery_status" varchar NOT NULL DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS "shipped_at" TIMESTAMPTZ NULL,
      ADD COLUMN IF NOT EXISTS "delivered_at" TIMESTAMPTZ NULL
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "brand_line_profiles" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
        "name" varchar NULL,
        "description" text NULL,
        "logo_url" varchar NULL,
        "profile_views" integer NOT NULL DEFAULT 0,
        "qr_scans" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "brand_line_profiles"`);
    await queryRunner.query(`
      ALTER TABLE "orders"
      DROP COLUMN IF EXISTS "delivered_at",
      DROP COLUMN IF EXISTS "shipped_at",
      DROP COLUMN IF EXISTS "delivery_status",
      DROP COLUMN IF EXISTS "est_delivery_at",
      DROP COLUMN IF EXISTS "courier",
      DROP COLUMN IF EXISTS "tracking_code"
    `);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "avatar_url"`);
    await queryRunner.query(`
      ALTER TABLE "catalog_items"
      DROP COLUMN IF EXISTS "model3d_format",
      DROP COLUMN IF EXISTS "model3d_url"
    `);
  }
}
