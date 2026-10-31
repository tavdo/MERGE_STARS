import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { createHash, randomUUID } from 'crypto';
import { CatalogItem } from '../../database/entities/catalog-item.entity';
import { MaterialLabEvent, MaterialLabFile } from './material-lab.entity';
import {
  emptyLab,
  LabData,
  reduceLab,
  validateLab,
} from './material-lab.domain';

const fields: Record<string, string[]> = {
  BATCH_CREATED: [
    'polymer_input_kg',
    'silver_input_kg',
    'gold_input_kg',
    'polymer_type',
    'production_date',
    'operator',
    'machine_id',
    'process_version',
    'closed_dosing',
    'ventilation',
    'PPE',
    'operator_training',
    'powder_batch_id',
    'particle_specification',
    'safety_document',
    'purity',
  ],
  PRODUCTION_RECORDED: [
    'step',
    'operator',
    'date',
    'machine_id',
    'parameters',
    'input_material',
    'output_material',
    'total_output_mass',
    'photos_video',
    'test_result',
    'QC_status',
  ],
  SAMPLE_ADDED: ['sample_id', 'sample_location', 'sample_weight'],
  LAB_RESULT_ADDED: [
    'result_id',
    'sample_id',
    'Ag',
    'Au',
    'other_elements',
    'test_method',
    'laboratory',
    'test_date',
    'certificate',
    'result_status',
  ],
  LAB_RESULT_UPDATED: [
    'result_id',
    'supersedes',
    'sample_id',
    'Ag',
    'Au',
    'other_elements',
    'test_method',
    'laboratory',
    'test_date',
    'certificate',
    'result_status',
  ],
  BATCH_VERIFIED: ['result_id', 'verified_metal_percentage', 'review_notes'],
  BATCH_REJECTED: ['reason'],
  PASSPORT_CREATED: [],
  QR_CREATED: [],
  PRODUCT_LINKED_TO_BATCH: [
    'product_id',
    'product_passport_id',
    'yarn_batch_id',
    'yarn_weight_used_kg',
  ],
  VERSION_ADDED: [
    'version',
    'formula',
    'polymer',
    'metal_type',
    'particle_type',
    'target_metal_percentage',
    'process_sequence',
    'machine_settings',
    'test_results',
    'strength',
    'flexibility',
    'appearance',
    'conductivity',
    'notes',
  ],
  EQUIPMENT_ADDED: [
    'equipment_id',
    'name',
    'manufacturer',
    'model',
    'purpose',
    'status',
    'capacity',
    'supported_materials',
    'photo',
    'manual',
    'maintenance_date',
    'calibration_date',
    'operator_permissions',
  ],
};
@Injectable()
export class MaterialLabService {
  constructor(private readonly db: DataSource) {}
  private id(id: string) {
    if (!/^[A-Za-z0-9_-]{3,80}$/.test(id))
      throw new BadRequestException('Invalid batch ID');
    return id;
  }
  async read(id: string) {
    this.id(id);
    const events = await this.db
      .getRepository(MaterialLabEvent)
      .find({ where: { batchId: id }, order: { revision: 'ASC' } });
    if (!events.length) throw new NotFoundException('Batch not found');
    return {
      state: events.reduce(
        (s, e) => reduceLab(s, e.action, e.payload),
        emptyLab(),
      ),
      events,
    };
  }
  async list() {
    const rows = await this.db.query(
      `SELECT batch_id FROM material_lab_events WHERE action = 'BATCH_CREATED' ORDER BY created_at DESC LIMIT 100`,
    );
    return Promise.all(
      rows.map((r: { batch_id: string }) => this.read(r.batch_id)),
    );
  }
  async command(
    id: string,
    action: string,
    input: LabData,
    actorId: string,
    file?: Express.Multer.File,
    kind?: string,
  ) {
    this.id(id);
    if (!fields[action] && action !== 'EVIDENCE_UPLOADED')
      throw new BadRequestException('Unknown action');
    return this.db.transaction(async (manager) => {
      await manager.query('SELECT pg_advisory_xact_lock(hashtext($1))', [
        `material-lab:${id}`,
      ]);
      const repo = manager.getRepository(MaterialLabEvent);
      const events = await repo.find({
        where: { batchId: id },
        order: { revision: 'ASC' },
      });
      const state = events.reduce(
        (s, e) => reduceLab(s, e.action, e.payload),
        emptyLab(),
      );
      let payload: LabData = Object.fromEntries(
        (fields[action] ?? [])
          .filter((k) => input[k] !== undefined)
          .map((k) => [k, input[k]]),
      );
      if (action === 'BATCH_CREATED') {
        payload.batch_id = id;
        try {
          validateLab(action, payload, state);
        } catch (e) {
          throw new BadRequestException((e as Error).message);
        }
        if (payload.silver_input_kg && payload.gold_input_kg)
          throw new BadRequestException(
            'First milestone supports one precious metal per batch',
          );
        for (const key of [
          'ventilation',
          'PPE',
          'operator_training',
          'powder_batch_id',
          'particle_specification',
          'safety_document',
        ])
          if (typeof payload[key] !== 'string' || !payload[key].trim())
            throw new BadRequestException(`Safety record required: ${key}`);
        if (payload.closed_dosing !== true)
          throw new BadRequestException('Controlled closed dosing required');
        payload.total_input_mass =
          payload.polymer_input_kg +
          payload.silver_input_kg +
          payload.gold_input_kg;
        payload.target_metal_percentage =
          ((payload.silver_input_kg + payload.gold_input_kg) /
            payload.total_input_mass) *
          100;
        payload.total_output_mass = null;
        payload.material_loss = null;
      }
      if (action === 'EVIDENCE_UPLOADED') {
        if (!state.batch.batch_id || !file)
          throw new BadRequestException('Batch and file required');
        const mime = file.mimetype;
        const pdf = file.buffer.subarray(0, 5).toString() === '%PDF-';
        const png = file.buffer
          .subarray(0, 8)
          .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
        const jpg =
          file.buffer[0] === 255 &&
          file.buffer[1] === 216 &&
          file.buffer[2] === 255;
        const mp4 = file.buffer.subarray(4, 8).toString() === 'ftyp';
        if (
          ![
            'certificate',
            'photo',
            'video',
            'manual',
            'safety_document',
          ].includes(kind ?? '') ||
          !(
            (mime === 'application/pdf' && pdf) ||
            (mime === 'image/png' && png) ||
            (mime === 'image/jpeg' && jpg) ||
            (mime === 'video/mp4' && mp4)
          )
        )
          throw new BadRequestException(
            'Use PDF, PNG, JPEG or MP4 with matching content',
          );
        if (
          ['certificate', 'manual', 'safety_document'].includes(kind!) &&
          !pdf
        )
          throw new BadRequestException('Document must be PDF');
        const stored = manager.getRepository(MaterialLabFile).create({
          id: randomUUID(),
          batchId: id,
          kind: kind!,
          name: file.originalname
            .replace(/[^a-zA-Z0-9._ -]/g, '_')
            .slice(0, 150),
          mime,
          hash: createHash('sha256').update(file.buffer).digest('hex'),
          bytes: file.buffer,
          createdAt: new Date(),
        });
        await manager.getRepository(MaterialLabFile).save(stored);
        payload = {
          id: stored.id,
          kind,
          name: stored.name,
          mime,
          hash: stored.hash,
          uploaded_at: stored.createdAt.toISOString(),
        };
      }
      try {
        validateLab(action, payload, state);
      } catch (e) {
        throw new BadRequestException((e as Error).message);
      }
      if (action === 'PRODUCT_LINKED_TO_BATCH') {
        if (
          !/^[0-9a-f-]{36}$/i.test(payload.product_id) ||
          !(await manager
            .getRepository(CatalogItem)
            .findOneBy({ id: payload.product_id }))
        )
          throw new BadRequestException(
            'Existing CORE catalog product required',
          );
        // Existing CORE has no separate passport entity: preserve its product ID as the passport reference.
        if (payload.product_passport_id !== payload.product_id)
          throw new BadRequestException(
            'Use the existing CORE product ID as passport reference',
          );
        payload.material_batch_id = id;
        payload.verified_metal_percentage_at_link =
          state.batch.verified_metal_percentage;
        payload.calculated_precious_metal_kg =
          (payload.yarn_weight_used_kg *
            state.batch.verified_metal_percentage) /
          100;
        payload.content_status = 'CALCULATED';
        payload.source_status = 'VERIFIED';
      }
      if (action === 'PASSPORT_CREATED')
        payload = {
          material_id: `MAT-${randomUUID()}`,
          batch_id: id,
          ...state.batch,
          QC_status: 'VERIFIED',
          results: state.results,
          production_history: state.production,
          verification: state.batch.verification,
          created_at: new Date().toISOString(),
        };
      if (action === 'QR_CREATED')
        payload = {
          url: `/material-lab/passport/${id}`,
          material_id: state.passports.at(-1)?.material_id,
        };
      const previous = events.at(-1);
      const event = repo.create({
        id: randomUUID(),
        batchId: id,
        revision: (previous?.revision ?? 0) + 1,
        action,
        actorId,
        payload,
        createdAt: new Date(),
        previousHash: previous?.hash ?? 'GENESIS',
      });
      event.hash = createHash('sha256')
        .update(
          JSON.stringify({
            ...event,
            createdAt: event.createdAt.toISOString(),
          }),
        )
        .digest('hex');
      await repo.save(event);
      return { state: reduceLab(state, action, payload), event };
    });
  }
  async passport(id: string) {
    const { state } = await this.read(id);
    const passport = state.passports.at(-1);
    if (
      !passport ||
      state.batch.QC_status !== 'VERIFIED' ||
      passport.verification.result_id !== state.batch.verification.result_id
    )
      throw new NotFoundException('No current verified passport');
    // Public read model excludes personal operator data and private uploaded reports.
    return {
      material_id: passport.material_id,
      batch_id: id,
      polymer_type: passport.polymer_type,
      precious_metal: passport.gold_input_kg > 0 ? 'Au' : 'Ag',
      purity: passport.purity ?? 'Not provided',
      theoretical_metal_percentage: passport.target_metal_percentage,
      verified_metal_percentage: passport.verified_metal_percentage,
      total_batch_weight: passport.total_output_mass,
      production_date: passport.production_date,
      QC_status: 'VERIFIED',
      results: state.results.map(
        ({
          sample_id,
          Ag,
          Au,
          test_method,
          laboratory,
          test_date,
          result_id,
        }) => ({
          sample_id,
          Ag,
          Au,
          test_method,
          laboratory,
          test_date,
          result_id,
        }),
      ),
      production_history: state.production.map(({ step, date, QC_status }) => ({
        step,
        date,
        QC_status,
      })),
      products: state.products,
    };
  }
  async file(id: string) {
    const row = await this.db
      .getRepository(MaterialLabFile)
      .createQueryBuilder('f')
      .addSelect('f.bytes')
      .where('f.id = :id', { id })
      .getOne();
    if (!row) throw new NotFoundException();
    return row;
  }
  async productSources(productId: string) {
    if (!/^[0-9a-f-]{36}$/i.test(productId))
      throw new BadRequestException('Invalid product ID');
    const product = await this.db.getRepository(CatalogItem).findOne({
      where: { id: productId, status: 'ACTIVE' },
      relations: { collection: true },
    });
    if (!product || product.collection.visibility !== 'PUBLIC')
      throw new NotFoundException();
    const events = await this.db
      .getRepository(MaterialLabEvent)
      .createQueryBuilder('e')
      .where('e.action = :action', { action: 'PRODUCT_LINKED_TO_BATCH' })
      .andWhere("e.payload->>'product_id' = :id", { id: productId })
      .getMany();
    return Promise.all(
      events.map(async (event) => {
        const { state } = await this.read(event.batchId);
        return {
          ...event.payload,
          current_source_status: state.batch.QC_status,
          source_recorded_at: event.createdAt,
          passport_path:
            state.batch.QC_status === 'VERIFIED'
              ? `/material-lab/passport/${event.batchId}`
              : null,
          content_status: 'CALCULATED — NOT FINISHED-PRODUCT ASSAY',
        };
      }),
    );
  }
}
