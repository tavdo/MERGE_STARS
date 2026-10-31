export type LabStatus =
  | 'R&D'
  | 'ESTIMATED'
  | 'TESTING'
  | 'VERIFIED'
  | 'REJECTED';
export type LabData = Record<string, any>;
export type LabAction =
  | 'BATCH_CREATED'
  | 'PRODUCTION_RECORDED'
  | 'SAMPLE_ADDED'
  | 'LAB_RESULT_ADDED'
  | 'LAB_RESULT_UPDATED'
  | 'BATCH_VERIFIED'
  | 'BATCH_REJECTED'
  | 'PASSPORT_CREATED'
  | 'PRODUCT_LINKED_TO_BATCH'
  | 'VERSION_ADDED'
  | 'EQUIPMENT_ADDED'
  | 'EVIDENCE_UPLOADED';
export interface LabState {
  batch: LabData;
  production: LabData[];
  samples: LabData[];
  results: LabData[];
  files: LabData[];
  versions: LabData[];
  equipment: LabData[];
  passports: LabData[];
  products: LabData[];
}
export function emptyLab(): LabState {
  return {
    batch: {},
    production: [],
    samples: [],
    results: [],
    files: [],
    versions: [],
    equipment: [],
    passports: [],
    products: [],
  };
}
export function reduceLab(
  state: LabState,
  action: string,
  p: LabData,
): LabState {
  const s = structuredClone(state);
  if (action === 'BATCH_CREATED')
    s.batch = { ...p, QC_status: 'R&D', verified_metal_percentage: null };
  if (action === 'PRODUCTION_RECORDED') {
    s.production.push(p);
    Object.assign(s.batch, {
      total_output_mass: p.total_output_mass,
      material_loss: s.batch.total_input_mass - p.total_output_mass,
    });
  }
  if (action === 'SAMPLE_ADDED') s.samples.push(p);
  if (action === 'LAB_RESULT_ADDED' || action === 'LAB_RESULT_UPDATED') {
    s.results.push(p);
    s.batch.QC_status = 'TESTING';
    s.batch.verified_metal_percentage = null;
  }
  if (action === 'BATCH_VERIFIED')
    Object.assign(s.batch, {
      QC_status: 'VERIFIED',
      verified_metal_percentage: p.verified_metal_percentage,
      verification: p,
    });
  if (action === 'BATCH_REJECTED')
    Object.assign(s.batch, {
      QC_status: 'REJECTED',
      verified_metal_percentage: null,
      rejection: p,
    });
  if (action === 'PASSPORT_CREATED') s.passports.push(p);
  if (action === 'PRODUCT_LINKED_TO_BATCH') s.products.push(p);
  if (action === 'VERSION_ADDED') s.versions.push(p);
  if (action === 'EQUIPMENT_ADDED') s.equipment.push(p);
  if (action === 'EVIDENCE_UPLOADED') s.files.push(p);
  s.batch.sample_count = s.samples.length;
  return s;
}
export function requireNumber(
  value: unknown,
  label: string,
  max = 1e7,
): number {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > max
  )
    throw new Error(`${label}: invalid non-negative number`);
  return value;
}
export function requireText(value: unknown, label: string): string {
  if (typeof value !== 'string' || !value.trim() || value.length > 5000)
    throw new Error(`${label}: required text`);
  return value.trim();
}
export function validateLab(action: string, p: LabData, s: LabState): void {
  if (action === 'BATCH_CREATED') {
    if (s.batch.batch_id) throw new Error('Batch already exists');
    for (const key of [
      'batch_id',
      'polymer_type',
      'production_date',
      'operator',
      'machine_id',
      'process_version',
    ])
      requireText(p[key], key);
    const sum = ['polymer_input_kg', 'silver_input_kg', 'gold_input_kg'].reduce(
      (n, k) => n + requireNumber(p[k], k),
      0,
    );
    if (sum <= 0) throw new Error('Input mass must be positive');
    return;
  }
  if (!s.batch.batch_id) throw new Error('Batch not found');
  if (action === 'PRODUCTION_RECORDED') {
    for (const k of [
      'step',
      'operator',
      'date',
      'machine_id',
      'parameters',
      'input_material',
      'output_material',
    ])
      requireText(p[k], k);
    if (requireNumber(p.total_output_mass, 'output') > s.batch.total_input_mass)
      throw new Error('Output exceeds input mass');
  } else if (action === 'SAMPLE_ADDED') {
    requireText(p.sample_id, 'sample_id');
    if (requireNumber(p.sample_weight, 'sample_weight') <= 0)
      throw new Error('Positive sample weight required');
    if (
      !['START', 'START-MIDDLE', 'MIDDLE', 'MIDDLE-END', 'END'].includes(
        p.sample_location,
      )
    )
      throw new Error('Invalid sample location');
    if (s.samples.some((x) => x.sample_id === p.sample_id))
      throw new Error('Sample ID already exists');
  } else if (action === 'LAB_RESULT_ADDED' || action === 'LAB_RESULT_UPDATED') {
    for (const k of ['result_id', 'sample_id', 'laboratory', 'test_date'])
      requireText(p[k], k);
    if (s.results.some((x) => x.result_id === p.result_id))
      throw new Error('Result ID already exists');
    if (!s.samples.some((x) => x.sample_id === p.sample_id))
      throw new Error('Sample missing');
    if (!['XRF', 'MICRO-XRF', 'TGA', 'ICP-OES'].includes(p.test_method))
      throw new Error('Unknown method');
    requireNumber(p.Ag, 'Ag', 100);
    requireNumber(p.Au, 'Au', 100);
    if (p.Ag + p.Au > 100) throw new Error('Metal percentages exceed 100');
    if (p.result_status !== 'TESTING')
      throw new Error('Results enter TESTING; approval is a separate event');
    if (
      !s.files.some((x) => x.id === p.certificate && x.kind === 'certificate')
    )
      throw new Error('Upload certificate/report first');
    if (
      action === 'LAB_RESULT_UPDATED' &&
      !s.results.some((x) => x.result_id === p.supersedes)
    )
      throw new Error('Previous result missing');
  } else if (action === 'BATCH_VERIFIED') {
    const result = s.results.find((x) => x.result_id === p.result_id);
    if (
      !result ||
      result.test_method !== 'ICP-OES' ||
      s.results.some((x) => x.supersedes === result.result_id)
    )
      throw new Error('Current reference ICP-OES result required');
    if (s.batch.QC_status !== 'TESTING')
      throw new Error('Batch must be TESTING');
    if (
      !s.production.length ||
      typeof s.batch.total_output_mass !== 'number' ||
      s.batch.total_output_mass <= 0
    )
      throw new Error('Measured production output required');
    if (
      s.samples.some(
        (sample) =>
          typeof sample.sample_weight !== 'number' || sample.sample_weight <= 0,
      )
    )
      throw new Error('Measured sample weights required');
    requireText(p.review_notes, 'review_notes');
    const field = s.batch.gold_input_kg > 0 ? 'Au' : 'Ag';
    if (
      requireNumber(p.verified_metal_percentage, 'verified percentage', 100) !==
      result[field]
    )
      throw new Error('Approval must match the referenced result');
    if (new Set(s.samples.map((x) => x.sample_location)).size !== 5)
      throw new Error(
        'Five sampling locations required for distribution review',
      );
    if (
      s.samples.some(
        (sample) =>
          !s.results.some(
            (r) =>
              r.sample_id === sample.sample_id &&
              ['XRF', 'ICP-OES'].includes(r.test_method) &&
              !s.results.some((later) => later.supersedes === r.result_id),
          ),
      )
    )
      throw new Error('Every sample needs a current quantitative result');
  } else if (action === 'BATCH_REJECTED') requireText(p.reason, 'reason');
  else if (action === 'QR_CREATED') {
    if (s.batch.QC_status !== 'VERIFIED' || !s.passports.length)
      throw new Error('Verified passport required');
  } else if (action === 'PASSPORT_CREATED') {
    if (s.batch.QC_status !== 'VERIFIED')
      throw new Error('Only verified batches receive passports');
    if (
      s.passports.length &&
      s.passports.at(-1)?.verification?.result_id ===
        s.batch.verification?.result_id
    )
      throw new Error('Passport already exists for this verification');
  } else if (action === 'PRODUCT_LINKED_TO_BATCH') {
    if (s.batch.QC_status !== 'VERIFIED' || !s.passports.length)
      throw new Error('Verified passport required');
    for (const k of ['product_id', 'product_passport_id', 'yarn_batch_id'])
      requireText(p[k], k);
    if (requireNumber(p.yarn_weight_used_kg, 'weight') <= 0)
      throw new Error('Positive yarn weight required');
    const used = s.products.reduce((sum, x) => sum + x.yarn_weight_used_kg, 0);
    if (
      s.batch.total_output_mass == null ||
      used + p.yarn_weight_used_kg > s.batch.total_output_mass
    )
      throw new Error('Linked weight exceeds recorded output');
    if (s.products.some((x) => x.product_id === p.product_id))
      throw new Error('Product already linked');
  } else if (action === 'VERSION_ADDED') {
    for (const k of [
      'version',
      'formula',
      'polymer',
      'metal_type',
      'particle_type',
      'process_sequence',
      'machine_settings',
      'notes',
    ])
      requireText(p[k], k);
    requireNumber(p.target_metal_percentage, 'target', 100);
    if (s.versions.some((x) => x.version === p.version))
      throw new Error('Version exists; append a new version');
  } else if (action === 'EQUIPMENT_ADDED') {
    for (const k of [
      'equipment_id',
      'name',
      'manufacturer',
      'model',
      'purpose',
      'status',
    ])
      requireText(p[k], k);
    if (s.equipment.some((x) => x.equipment_id === p.equipment_id))
      throw new Error('Equipment ID exists');
  } else if (action !== 'EVIDENCE_UPLOADED') throw new Error('Unknown action');
}
