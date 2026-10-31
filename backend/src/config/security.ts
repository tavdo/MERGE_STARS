export function jwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (
    process.env.NODE_ENV === 'production' &&
    (!secret || secret.length < 32 || /change|dev-secret/i.test(secret))
  ) {
    throw new Error(
      'Production requires a unique JWT_SECRET of at least 32 characters',
    );
  }
  return secret || 'merge-stars-dev-secret-change-me';
}

export function validateEnvironment(env: Record<string, unknown>) {
  if (env.NODE_ENV === 'production') {
    const secret = String(env.JWT_SECRET ?? '').trim();
    if (secret.length < 32 || /change|dev-secret/i.test(secret))
      throw new Error('Set a strong production JWT_SECRET');
    if (env.DB_SYNC !== 'false')
      throw new Error('Production requires DB_SYNC=false; use migrations');
    if (!env.DATABASE_URL && !env.DB_PASSWORD)
      throw new Error('Configure production database credentials');
    if (
      !env.FRONTEND_URL ||
      !String(env.FRONTEND_URL)
        .split(',')
        .every((url) => url.trim().startsWith('https://'))
    )
      throw new Error('Production FRONTEND_URL must use HTTPS');
  }
  return env;
}
