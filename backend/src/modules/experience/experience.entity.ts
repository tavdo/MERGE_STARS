import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

export const measurementKeys = [
  'height',
  'shoulders',
  'chest',
  'waist',
  'hips',
  'neck',
  'wrist',
  'finger',
  'foot',
  'head',
] as const;
export type Measurements = Partial<
  Record<(typeof measurementKeys)[number], number>
>;

@Entity('fit_profiles')
export class FitProfile {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'user_id', type: 'uuid', unique: true }) userId: string;
  @Column({ type: 'jsonb', default: {} }) measurements: Measurements;
  @Column({ type: 'varchar', default: 'MANUAL_UNVERIFIED' }) source: string;
  @Column({ name: 'consented_at', type: 'timestamptz' }) consentedAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

@Entity('design_proposals')
export class DesignProposal {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'creator_id', type: 'uuid' }) creatorId: string;
  @Column({ name: 'source_product_id', type: 'uuid' }) sourceProductId: string;
  @Column({ name: 'parent_proposal_id', type: 'uuid', nullable: true }) parentProposalId: string | null;
  @Column({ name: 'publication_requested_at', type: 'timestamptz', nullable: true }) publicationRequestedAt: Date | null;
  @Column({ name: 'publication_consent_version', type: 'varchar', nullable: true }) publicationConsentVersion: string | null;
  @Column({ name: 'source_updated_at', type: 'timestamptz' })
  sourceUpdatedAt: Date;
  @Column({ name: 'house_id', type: 'uuid', nullable: true }) houseId:
    | string
    | null;
  @Column({ name: 'brand_line_id', type: 'varchar', nullable: true })
  brandLineId: string | null;
  @Column({ type: 'jsonb' }) preferences: {
    material?: string;
    initials?: string;
    notes?: string;
    measurements: Measurements;
    fitSource: string | null;
    fitUpdatedAt: string | null;
  };
  @Column({
    name: 'verification_requested_at',
    type: 'timestamptz',
    nullable: true,
  })
  verificationRequestedAt: Date | null;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}

@Entity('product_interactions')
@Unique(['userId', 'productId', 'kind'])
export class ProductInteraction {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'user_id', type: 'uuid' }) userId: string;
  @Column({ name: 'product_id', type: 'uuid' }) productId: string;
  @Column({ type: 'varchar' }) kind: 'LIKE' | 'SAVE';
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
