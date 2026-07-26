import { MigrationInterface, QueryRunner } from 'typeorm';

export class AiTrainingItems1753600000000 implements MigrationInterface {
  name = 'AiTrainingItems1753600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "ai_training_items" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "question" text NOT NULL,
        "normalized_question" varchar(500) NOT NULL,
        "answer" text NULL,
        "status" varchar(16) NOT NULL DEFAULT 'pending',
        "ask_count" int NOT NULL DEFAULT 1,
        "user_id" uuid NULL,
        "language" varchar(8) NULL,
        "trained_by_user_id" uuid NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_ai_training_normalized"
      ON "ai_training_items" ("normalized_question")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_ai_training_status"
      ON "ai_training_items" ("status")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ai_training_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ai_training_normalized"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ai_training_items"`);
  }
}
