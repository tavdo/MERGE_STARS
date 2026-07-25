import { MigrationInterface, QueryRunner } from 'typeorm';

export class CatalogCategory1753200000000 implements MigrationInterface {
  name = 'CatalogCategory1753200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "catalog_collections"
      ADD COLUMN IF NOT EXISTS "category" varchar(32) NOT NULL DEFAULT 'more'
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_catalog_collections_category"
      ON "catalog_collections" ("category")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_catalog_collections_category"`);
    await queryRunner.query(`
      ALTER TABLE "catalog_collections" DROP COLUMN IF EXISTS "category"
    `);
  }
}
