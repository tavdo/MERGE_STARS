import { MigrationInterface, QueryRunner } from 'typeorm';

export class CatalogCommerce1753000000000 implements MigrationInterface {
  name = 'CatalogCommerce1753000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "catalog_items"
      ADD COLUMN IF NOT EXISTS "price_usd" numeric(14,2)
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "catalog_orders" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "public_id" varchar NOT NULL UNIQUE,
        "buyer_id" uuid NOT NULL,
        "seller_id" uuid NOT NULL,
        "item_id" uuid NOT NULL,
        "collection_id" uuid NOT NULL,
        "item_title" varchar(160) NOT NULL,
        "amount" numeric(14,2) NOT NULL,
        "seller_earnings" numeric(14,2) NOT NULL,
        "brand_share_label" varchar(32) NOT NULL,
        "status" varchar(32) NOT NULL DEFAULT 'paid',
        "meta" jsonb,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "FK_catalog_orders_buyer" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_catalog_orders_seller" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_catalog_orders_buyer_id" ON "catalog_orders" ("buyer_id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_catalog_orders_seller_id" ON "catalog_orders" ("seller_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "catalog_orders"`);
    await queryRunner.query(`ALTER TABLE "catalog_items" DROP COLUMN IF EXISTS "price_usd"`);
  }
}
