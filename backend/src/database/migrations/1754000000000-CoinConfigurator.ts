import { MigrationInterface, QueryRunner } from 'typeorm';

export class CoinConfigurator1754000000000 implements MigrationInterface {
  name = 'CoinConfigurator1754000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "coin_package_configs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "label" varchar(80) NOT NULL,
        "package_kg" decimal(8,2) NOT NULL,
        "total_weight_g" int NOT NULL,
        "case_weight_g" int NOT NULL,
        "product_capacity_g" int NOT NULL,
        "is_default" boolean NOT NULL DEFAULT false,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_coin_package_configs" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      INSERT INTO "coin_package_configs"
        ("label", "package_kg", "total_weight_g", "case_weight_g", "product_capacity_g", "is_default", "is_active")
      SELECT '1 KG Standard', 1, 1000, 500, 500, true, true
      WHERE NOT EXISTS (SELECT 1 FROM "coin_package_configs" WHERE "is_default" = true)
    `);

    await queryRunner.query(`
      INSERT INTO "coin_package_configs"
        ("label", "package_kg", "total_weight_g", "case_weight_g", "product_capacity_g", "is_default", "is_active")
      SELECT '2 KG', 2, 2000, 1000, 1000, false, true
      WHERE NOT EXISTS (SELECT 1 FROM "coin_package_configs" WHERE "package_kg" = 2)
    `);

    await queryRunner.query(`
      INSERT INTO "coin_package_configs"
        ("label", "package_kg", "total_weight_g", "case_weight_g", "product_capacity_g", "is_default", "is_active")
      SELECT '5 KG', 5, 5000, 2500, 2500, false, true
      WHERE NOT EXISTS (SELECT 1 FROM "coin_package_configs" WHERE "package_kg" = 5)
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "coin_configurator_sessions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "package_config_id" uuid,
        "package_kg" decimal(8,2) NOT NULL DEFAULT 1,
        "case_weight_g" int NOT NULL,
        "product_capacity_g" int NOT NULL,
        "source_brand_house_id" varchar(64),
        "source_qr_ref" varchar(255),
        "status" varchar(24) NOT NULL DEFAULT 'draft',
        "used_weight_g" int NOT NULL DEFAULT 0,
        "remaining_weight_g" int NOT NULL DEFAULT 500,
        "snapshot_json" jsonb,
        "finalized_at" TIMESTAMPTZ,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_coin_configurator_sessions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_coin_configurator_sessions_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_coin_configurator_sessions_pkg" FOREIGN KEY ("package_config_id")
          REFERENCES "coin_package_configs"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_coin_configurator_sessions_user"
      ON "coin_configurator_sessions" ("user_id")
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "coin_configurator_products" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "session_id" uuid NOT NULL,
        "product_type" varchar(40) NOT NULL,
        "title" varchar(160) NOT NULL,
        "prompt" text,
        "meshy_job_id" varchar(64),
        "model3d_url" varchar(512),
        "status" varchar(24) NOT NULL DEFAULT 'drafting',
        "estimated_weight_g" int,
        "verified_weight_g" int,
        "visibility" varchar(16) NOT NULL DEFAULT 'private',
        "catalog_item_id" uuid,
        "sort_order" int NOT NULL DEFAULT 0,
        "approved_at" TIMESTAMPTZ,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_coin_configurator_products" PRIMARY KEY ("id"),
        CONSTRAINT "FK_coin_configurator_products_session" FOREIGN KEY ("session_id")
          REFERENCES "coin_configurator_sessions"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_coin_configurator_products_session"
      ON "coin_configurator_products" ("session_id")
    `);

    await queryRunner.query(`
      ALTER TABLE "coin_applications"
      ADD COLUMN IF NOT EXISTS "configurator_session_id" uuid
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "coin_applications" DROP COLUMN IF EXISTS "configurator_session_id"
    `);
    await queryRunner.query(`DROP TABLE IF EXISTS "coin_configurator_products"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "coin_configurator_sessions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "coin_package_configs"`);
  }
}
