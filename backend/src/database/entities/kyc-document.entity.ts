import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('kyc_documents')
export class KycDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'original_name' })
  originalName: string;

  @Column({ name: 'mime_type', length: 128 })
  mimeType: string;

  @Column({ type: 'int' })
  size: number;

  @Column({ name: 'file_path' })
  filePath: string;

  @Column({ default: 'pending' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

export function kycDocumentView(doc: KycDocument) {
  return {
    id: doc.id,
    userId: doc.userId,
    originalName: doc.originalName,
    mimeType: doc.mimeType,
    size: doc.size,
    status: doc.status,
    createdAt: doc.createdAt.toISOString(),
  };
}
