import { MigrationInterface, QueryRunner } from 'typeorm';

export class MasterCatalog1753900000000 implements MigrationInterface {
  name = 'MasterCatalog1753900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "catalog_collections"
      ADD COLUMN IF NOT EXISTS "is_master" boolean NOT NULL DEFAULT false
    `);
    await queryRunner.query(`
      ALTER TABLE "catalog_items"
      ADD COLUMN IF NOT EXISTS "house" varchar(40)
    `);
    await queryRunner.query(`
      ALTER TABLE "catalog_items"
      ADD COLUMN IF NOT EXISTS "lifecycle" varchar(24) NOT NULL DEFAULT 'ACTIVE'
    `);
    await queryRunner.query(`
      ALTER TABLE "catalog_items"
      ADD COLUMN IF NOT EXISTS "ownership" varchar(24) NOT NULL DEFAULT 'PRIVATE'
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_catalog_items_house"
      ON "catalog_items" ("house")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_catalog_items_ownership"
      ON "catalog_items" ("ownership")
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "brand_room_picks" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "catalog_item_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_brand_room_picks" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_brand_room_picks_user_item" UNIQUE ("user_id", "catalog_item_id"),
        CONSTRAINT "FK_brand_room_picks_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_brand_room_picks_item" FOREIGN KEY ("catalog_item_id")
          REFERENCES "catalog_items"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_brand_room_picks_user"
      ON "brand_room_picks" ("user_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "brand_room_picks"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_catalog_items_ownership"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_catalog_items_house"`);
    await queryRunner.query(`ALTER TABLE "catalog_items" DROP COLUMN IF EXISTS "ownership"`);
    await queryRunner.query(`ALTER TABLE "catalog_items" DROP COLUMN IF EXISTS "lifecycle"`);
    await queryRunner.query(`ALTER TABLE "catalog_items" DROP COLUMN IF EXISTS "house"`);
    await queryRunner.query(`ALTER TABLE "catalog_collections" DROP COLUMN IF EXISTS "is_master"`);
  }
}
