import { MigrationInterface, QueryRunner } from 'typeorm';

export class WalletTransactions1752900000000 implements MigrationInterface {
  name = 'WalletTransactions1752900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "wallet_transactions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "type" varchar(16) NOT NULL,
        "amount" numeric(14,2) NOT NULL,
        "balance_after" numeric(14,2) NOT NULL,
        "reason" varchar(64) NOT NULL,
        "note" varchar(255),
        "order_id" uuid,
        "created_by" uuid,
        "meta" jsonb,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "FK_wallet_tx_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_wallet_transactions_user_id" ON "wallet_transactions" ("user_id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_wallet_transactions_created_at" ON "wallet_transactions" ("created_at" DESC)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "wallet_transactions"`);
  }
}
