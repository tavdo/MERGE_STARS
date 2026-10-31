import { validateEnvironment } from './security';

describe('Production configuration', () => {
  const valid = {
    NODE_ENV: 'production',
    JWT_SECRET: 'a'.repeat(48),
    DB_SYNC: 'false',
    DATABASE_URL: 'postgresql://test:test@localhost/test',
    FRONTEND_URL: 'https://example.com',
  };
  it('accepts an explicit production configuration', () =>
    expect(validateEnvironment(valid)).toBe(valid));
  it.each([
    { JWT_SECRET: '' },
    { JWT_SECRET: 'change-this-to-a-long-random-string' },
    { DB_SYNC: 'true' },
    { FRONTEND_URL: 'http://example.com' },
  ])('rejects unsafe configuration %p', (patch) => {
    expect(() => validateEnvironment({ ...valid, ...patch })).toThrow();
  });
  it('permits local development without production credentials', () =>
    expect(validateEnvironment({ NODE_ENV: 'development' })).toBeDefined());
});
