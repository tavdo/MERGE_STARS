import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserNickname1754200000000 implements MigrationInterface {
  name = 'UserNickname1754200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "nickname" varchar(40)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "nickname"`);
  }
}
