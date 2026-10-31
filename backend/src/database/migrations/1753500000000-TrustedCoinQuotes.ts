import { MigrationInterface, QueryRunner } from 'typeorm';

export class TrustedCoinQuotes1753500000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "coin_applications" ADD COLUMN IF NOT EXISTS "price_quoted_at" timestamptz NULL',
    );
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "coin_applications" DROP COLUMN IF EXISTS "price_quoted_at"',
    );
  }
}
