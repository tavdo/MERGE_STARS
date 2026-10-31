import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('material_lab_events')
export class MaterialLabEvent {
  @PrimaryColumn({ type: 'uuid' }) id: string;
  @Column({ name: 'batch_id' }) batchId: string;
  @Column({ type: 'integer' }) revision: number;
  @Column() action: string;
  @Column({ name: 'actor_id' }) actorId: string;
  @Column({ type: 'jsonb' }) payload: Record<string, unknown>;
  @Column({ name: 'created_at', type: 'timestamptz' }) createdAt: Date;
  @Column({ name: 'previous_hash' }) previousHash: string;
  @Column() hash: string;
}

@Entity('material_lab_files')
export class MaterialLabFile {
  @PrimaryColumn({ type: 'uuid' }) id: string;
  @Column({ name: 'batch_id' }) batchId: string;
  @Column() kind: string;
  @Column() name: string;
  @Column() mime: string;
  @Column() hash: string;
  @Column({ type: 'bytea', select: false }) bytes: Buffer;
  @Column({ name: 'created_at', type: 'timestamptz' }) createdAt: Date;
}
