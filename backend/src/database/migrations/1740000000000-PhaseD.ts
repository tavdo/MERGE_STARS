import { MigrationInterface, QueryRunner } from 'typeorm';

export class PhaseD1740000000000 implements MigrationInterface {
  name = 'PhaseD1740000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "notifications" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "type" varchar(64) NOT NULL,
        "title" varchar(255) NOT NULL,
        "body" text NOT NULL,
        "meta" jsonb,
        "read" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_notifications_user_id" ON "notifications" ("user_id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_notifications_user_read" ON "notifications" ("user_id", "read")
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "kyc_documents" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "original_name" varchar(512) NOT NULL,
        "mime_type" varchar(128) NOT NULL,
        "size" integer NOT NULL,
        "file_path" varchar(1024) NOT NULL,
        "status" varchar(32) NOT NULL DEFAULT 'pending',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_kyc_documents_user_id" ON "kyc_documents" ("user_id")
    `);

    await queryRunner.query(`
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "referred_by_id" uuid NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "terms_accepted_at" TIMESTAMPTZ NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "terms_accepted_at"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "referred_by_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "kyc_documents"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "notifications"`);
  }
}
