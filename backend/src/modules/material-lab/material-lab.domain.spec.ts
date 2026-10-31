import {
  emptyLab,
  reduceLab,
  validateLab,
  LabState,
} from './material-lab.domain';
const inputs = {
  batch_id: 'MSY-TEST-001',
  polymer_input_kg: 2,
  silver_input_kg: 1,
  gold_input_kg: 0,
  polymer_type: 'Trial polymer',
  production_date: '2026-10-04',
  operator: 'Lab operator',
  machine_id: 'EQ-1',
  process_version: 'v0.1',
};
function testingBatch(): LabState {
  let s = reduceLab(emptyLab(), 'BATCH_CREATED', {
    ...inputs,
    total_input_mass: 3,
    target_metal_percentage: 100 / 3,
  });
  s = reduceLab(s, 'PRODUCTION_RECORDED', {
    total_output_mass: 2.9,
    step: 'WINDING',
    date: '2026-10-04',
  });
  s.files.push({ id: 'CERT-1', kind: 'certificate' });
  ['START', 'START-MIDDLE', 'MIDDLE', 'MIDDLE-END', 'END'].forEach(
    (location, i) => {
      s = reduceLab(s, 'SAMPLE_ADDED', {
        sample_id: `S${i}`,
        sample_location: location,
        sample_weight: 0.01,
      });
      s = reduceLab(s, 'LAB_RESULT_ADDED', {
        result_id: `R${i}`,
        sample_id: `S${i}`,
        test_method: i === 2 ? 'ICP-OES' : 'XRF',
        Ag: 33.18,
        Au: 0,
        certificate: 'CERT-1',
        laboratory: 'Test lab',
        test_date: '2026-10-04',
        result_status: 'TESTING',
      });
    },
  );
  return s;
}
describe('Material Lab evidence policy', () => {
  it('keeps the theoretical ratio separate from laboratory content', () => {
    const s = reduceLab(emptyLab(), 'BATCH_CREATED', {
      ...inputs,
      target_metal_percentage: 100 / 3,
    });
    expect(s.batch.target_metal_percentage).toBeCloseTo(33.3333);
    expect(s.batch.verified_metal_percentage).toBeNull();
    expect(() => validateLab('PASSPORT_CREATED', {}, s)).toThrow('verified');
  });
  it('rejects negative, nonfinite and zero input masses', () => {
    for (const mass of [-1, NaN, Infinity])
      expect(() =>
        validateLab(
          'BATCH_CREATED',
          { ...inputs, polymer_input_kg: mass },
          emptyLab(),
        ),
      ).toThrow();
    expect(() =>
      validateLab(
        'BATCH_CREATED',
        { ...inputs, polymer_input_kg: 0, silver_input_kg: 0 },
        emptyLab(),
      ),
    ).toThrow();
  });
  it('requires uploaded evidence and an existing sample', () => {
    const s = testingBatch();
    const p = {
      result_id: 'RX',
      sample_id: 'S0',
      Ag: 33,
      Au: 0,
      test_method: 'XRF',
      laboratory: 'Lab',
      test_date: '2026-10-04',
      certificate: 'MISSING',
      result_status: 'TESTING',
    };
    expect(() => validateLab('LAB_RESULT_ADDED', p, s)).toThrow('Upload');
    expect(() =>
      validateLab('LAB_RESULT_ADDED', { ...p, sample_id: 'UNKNOWN' }, s),
    ).toThrow('Sample');
  });
  it('does not allow routine XRF or TGA to replace a reference approval', () => {
    const s = testingBatch();
    expect(() =>
      validateLab(
        'BATCH_VERIFIED',
        {
          result_id: 'R0',
          verified_metal_percentage: 33.18,
          review_notes: 'reviewed',
        },
        s,
      ),
    ).toThrow('ICP-OES');
  });
  it('requires all locations, current results and an exact reference result', () => {
    const s = testingBatch();
    const p = {
      result_id: 'R2',
      verified_metal_percentage: 33.18,
      review_notes: 'Distribution and reference reviewed',
    };
    expect(() => validateLab('BATCH_VERIFIED', p, s)).not.toThrow();
    expect(() =>
      validateLab(
        'BATCH_VERIFIED',
        { ...p, verified_metal_percentage: 33.33 },
        s,
      ),
    ).toThrow('match');
    s.results.pop();
    expect(() => validateLab('BATCH_VERIFIED', p, s)).toThrow('Every sample');
  });
  it('preserves old results and invalidates verification after a correction', () => {
    const s = testingBatch();
    const verified = reduceLab(s, 'BATCH_VERIFIED', {
      result_id: 'R2',
      verified_metal_percentage: 33.18,
    });
    const revised = reduceLab(verified, 'LAB_RESULT_UPDATED', {
      result_id: 'R2-v2',
      supersedes: 'R2',
      sample_id: 'S2',
      Ag: 32.8,
    });
    expect(revised.results.length).toBe(6);
    expect(revised.results.find((x) => x.result_id === 'R2')?.Ag).toBe(33.18);
    expect(revised.batch.QC_status).toBe('TESTING');
    expect(revised.batch.verified_metal_percentage).toBeNull();
    expect(verified.batch.QC_status).toBe('VERIFIED');
  });
  it('rejects product allocations beyond recorded batch output', () => {
    const s = testingBatch();
    s.batch.QC_status = 'VERIFIED';
    s.batch.total_output_mass = 2.8;
    s.passports.push({ material_id: 'MAT-1' });
    const p = {
      product_id: 'PRODUCT',
      product_passport_id: 'PASSPORT',
      yarn_batch_id: 'YARN',
      yarn_weight_used_kg: 2.9,
    };
    expect(() => validateLab('PRODUCT_LINKED_TO_BATCH', p, s)).toThrow(
      'exceeds',
    );
    expect(() =>
      validateLab(
        'PRODUCT_LINKED_TO_BATCH',
        { ...p, yarn_weight_used_kg: 0.1 },
        s,
      ),
    ).not.toThrow();
  });
  it('never overwrites an existing R&D version', () => {
    const s = testingBatch();
    s.versions.push({ version: 'v0.1' });
    const p = {
      version: 'v0.1',
      formula: '2:1',
      polymer: 'test',
      metal_type: 'Ag',
      particle_type: 'test',
      process_sequence: 'test',
      machine_settings: 'test',
      target_metal_percentage: 33,
      notes: 'test',
    };
    expect(() => validateLab('VERSION_ADDED', p, s)).toThrow('Version exists');
  });
});
