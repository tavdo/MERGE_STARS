import { MigrationInterface, QueryRunner } from 'typeorm';

export class KycIdentitySides1753400000000 implements MigrationInterface {
  name = 'KycIdentitySides1753400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "personal_id" DROP NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "kyc_documents"
      ADD COLUMN IF NOT EXISTS "document_type" varchar(32) NOT NULL DEFAULT 'other'
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_kyc_documents_user_type"
      ON "kyc_documents" ("user_id", "document_type")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_kyc_documents_user_type"`);
    await queryRunner.query(`
      ALTER TABLE "kyc_documents" DROP COLUMN IF EXISTS "document_type"
    `);
  }
}
