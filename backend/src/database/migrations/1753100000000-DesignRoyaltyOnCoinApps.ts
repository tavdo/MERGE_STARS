import { MigrationInterface, QueryRunner } from 'typeorm';

export class DesignRoyaltyOnCoinApps1753100000000 implements MigrationInterface {
  name = 'DesignRoyaltyOnCoinApps1753100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "coin_applications"
      ADD COLUMN IF NOT EXISTS "catalog_item_id" uuid
    `);
    await queryRunner.query(`
      ALTER TABLE "coin_applications"
      ADD COLUMN IF NOT EXISTS "design_author_id" uuid
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_coin_applications_catalog_item_id"
      ON "coin_applications" ("catalog_item_id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_coin_applications_design_author_id"
      ON "coin_applications" ("design_author_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "coin_applications" DROP COLUMN IF EXISTS "design_author_id"`);
    await queryRunner.query(`ALTER TABLE "coin_applications" DROP COLUMN IF EXISTS "catalog_item_id"`);
  }
}
