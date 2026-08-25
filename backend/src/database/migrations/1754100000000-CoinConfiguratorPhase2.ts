import { MigrationInterface, QueryRunner } from 'typeorm';

export class CoinConfiguratorPhase21754100000000 implements MigrationInterface {
  name = 'CoinConfiguratorPhase21754100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "coin_configurator_sessions"
      ADD COLUMN IF NOT EXISTS "case_layout_json" jsonb
    `);

    await queryRunner.query(`
      ALTER TABLE "coin_configurator_products"
      ADD COLUMN IF NOT EXISTS "passport_id" uuid
    `);

    await queryRunner.query(`
      ALTER TABLE "coin_applications"
      ADD COLUMN IF NOT EXISTS "order_snapshot_json" jsonb
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "product_passports" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "public_id" varchar(32) NOT NULL,
        "owner_user_id" uuid NOT NULL,
        "configurator_product_id" uuid NOT NULL,
        "session_id" uuid NOT NULL,
        "brand_house_id" varchar(64),
        "source_qr_ref" varchar(255),
        "product_type" varchar(40) NOT NULL,
        "title" varchar(160) NOT NULL,
        "prompt" text,
        "model3d_url" varchar(512),
        "estimated_weight_g" int,
        "verified_weight_g" int,
        "visibility" varchar(16) NOT NULL DEFAULT 'private',
        "catalog_item_id" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_product_passports" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_product_passports_public_id" UNIQUE ("public_id"),
        CONSTRAINT "FK_product_passports_user" FOREIGN KEY ("owner_user_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      INSERT INTO "coin_package_configs"
        ("label", "package_kg", "total_weight_g", "case_weight_g", "product_capacity_g", "is_default", "is_active")
      SELECT '20 KG', 20, 20000, 10000, 10000, false, true
      WHERE NOT EXISTS (SELECT 1 FROM "coin_package_configs" WHERE "package_kg" = 20)
    `);

    await queryRunner.query(`
      INSERT INTO "coin_package_configs"
        ("label", "package_kg", "total_weight_g", "case_weight_g", "product_capacity_g", "is_default", "is_active")
      SELECT '100 KG', 100, 100000, 50000, 50000, false, true
      WHERE NOT EXISTS (SELECT 1 FROM "coin_package_configs" WHERE "package_kg" = 100)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "product_passports"`);
    await queryRunner.query(`ALTER TABLE "coin_applications" DROP COLUMN IF EXISTS "order_snapshot_json"`);
    await queryRunner.query(`ALTER TABLE "coin_configurator_products" DROP COLUMN IF EXISTS "passport_id"`);
    await queryRunner.query(`ALTER TABLE "coin_configurator_sessions" DROP COLUMN IF EXISTS "case_layout_json"`);
  }
}
