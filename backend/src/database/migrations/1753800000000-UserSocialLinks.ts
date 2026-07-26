import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserSocialLinks1753800000000 implements MigrationInterface {
  name = 'UserSocialLinks1753800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "social_links" jsonb NOT NULL DEFAULT '{}'::jsonb
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN IF EXISTS "social_links"`,
    );
  }
}
