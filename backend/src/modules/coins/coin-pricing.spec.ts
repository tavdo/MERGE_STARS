import { calculateBrandLinePrice as price } from './coin-pricing';
describe('Locked CORE Brand Line pricing', () => {
  it('uses 2 Ag for Silver and only 1 Au for Gold', () => {
    expect(price('silver', '1', 200000)).toBe(400000);
    expect(price('gold', '1', 200000, 10000000)).toBe(10000000);
    expect(price('gold', '1', 0, 10000000)).toBe(10000000);
  });
  it('scales pricing weight and rounds only once', () => {
    expect(price('silver', '0.125', 200000)).toBe(50000);
    expect(price('gold', '0.5', 101, 102)).toBe(51);
  });
  it('fails closed for Premium', () =>
    expect(() => price('premium', '1', 200000)).toThrow(
      'pending verification',
    ));
  it.each(['0', '-1', 'NaN', '1e3', '0.0000001'])('rejects weight %s', (w) =>
    expect(() => price('silver', w, 200000)).toThrow(),
  );
  it('rejects absent Gold reference and imprecise money', () => {
    expect(() => price('gold', '1', 200000)).toThrow();
    expect(() => price('silver', '1', 1.5)).toThrow();
    expect(() => price('silver', '1', Infinity)).toThrow();
  });
});
