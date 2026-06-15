import { MigrationInterface, QueryRunner } from 'typeorm';

export class PhaseF1742000000000 implements MigrationInterface {
  name = 'PhaseF1742000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "platform_settings" (
        "id" integer PRIMARY KEY DEFAULT 1 CHECK ("id" = 1),
        "ticker_enabled" boolean NOT NULL DEFAULT true,
        "ai_enabled" boolean NOT NULL DEFAULT true,
        "auto_verify" boolean NOT NULL DEFAULT false,
        "platform_share" varchar NOT NULL DEFAULT '1/2',
        "brand_share" varchar NOT NULL DEFAULT '1/4',
        "referrer_share" varchar NOT NULL DEFAULT '1/4',
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      INSERT INTO "platform_settings" ("id")
      VALUES (1)
      ON CONFLICT ("id") DO NOTHING
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "phone_verification_codes" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "phone" varchar NOT NULL,
        "code" varchar(6) NOT NULL,
        "expires_at" TIMESTAMPTZ NOT NULL,
        "used" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_phone_verification_phone"
      ON "phone_verification_codes" ("phone", "created_at" DESC)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "phone_verification_codes"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "platform_settings"`);
  }
}
