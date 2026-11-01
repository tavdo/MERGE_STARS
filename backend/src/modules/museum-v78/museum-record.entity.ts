import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity('museum_v78_records')
@Index(['ownerId', 'kind', 'requestId'], { unique: true })
export class MuseumRecord {
  @PrimaryColumn('uuid') id: string;
  @Column({ name: 'owner_id', type: 'uuid' }) ownerId: string;
  @Column({ type: 'varchar', length: 20 }) kind: string;
  @Column({ name: 'request_id', type: 'uuid' }) requestId: string;
  @Column({ name: 'request_hash', length: 64 }) requestHash: string;
  @Column({ type: 'jsonb' }) payload: Record<string, unknown>;
  @Column({ name: 'created_at', type: 'timestamptz' }) createdAt: Date;
}
