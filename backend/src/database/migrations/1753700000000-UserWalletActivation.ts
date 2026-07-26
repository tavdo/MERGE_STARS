import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserWalletActivation1753700000000 implements MigrationInterface {
  name = 'UserWalletActivation1753700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "wallet_activated_at" TIMESTAMP WITH TIME ZONE NULL
    `);
    // Members who already received earnings keep an active wallet.
    await queryRunner.query(`
      UPDATE "users" u
      SET "wallet_activated_at" = sub."first_tx"
      FROM (
        SELECT "user_id", MIN("created_at") AS "first_tx"
        FROM "wallet_transactions"
        GROUP BY "user_id"
      ) sub
      WHERE u."id" = sub."user_id" AND u."wallet_activated_at" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN IF EXISTS "wallet_activated_at"`,
    );
  }
}
