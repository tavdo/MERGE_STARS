import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type AiTrainingStatus = 'pending' | 'trained' | 'dismissed';

@Entity('ai_training_items')
export class AiTrainingItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  question: string;

  @Index()
  @Column({ name: 'normalized_question', type: 'varchar', length: 500 })
  normalizedQuestion: string;

  @Column({ type: 'text', nullable: true })
  answer: string | null;

  @Index()
  @Column({ type: 'varchar', length: 16, default: 'pending' })
  status: AiTrainingStatus;

  @Column({ name: 'ask_count', type: 'int', default: 1 })
  askCount: number;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  @Column({ type: 'varchar', length: 8, nullable: true })
  language: string | null;

  @Column({ name: 'trained_by_user_id', type: 'uuid', nullable: true })
  trainedByUserId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

export function aiTrainingItemView(row: AiTrainingItem) {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    status: row.status,
    askCount: row.askCount,
    userId: row.userId,
    language: row.language,
    trainedByUserId: row.trainedByUserId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
