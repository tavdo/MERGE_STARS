#!/usr/bin/env bash
# Reset admin@mergestars.com password from .env (SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
# shellcheck source=load-env.sh
source "$SCRIPT_DIR/load-env.sh"

if [ -f "$REPO_ROOT/.env" ]; then
  load_env_file "$REPO_ROOT/.env"
fi

EMAIL="${SEED_ADMIN_EMAIL:-admin@mergestars.com}"
PASS="${SEED_ADMIN_PASSWORD:-}"

if [ -z "$PASS" ]; then
  echo "FAIL: Set SEED_ADMIN_PASSWORD in $REPO_ROOT/.env"
  exit 1
fi

echo "Resetting password for $EMAIL …"
cd "$REPO_ROOT/backend"
export SEED_ADMIN_EMAIL="$EMAIL"
export SEED_ADMIN_PASSWORD="$PASS"
export SEED_ADMIN_SYNC=true
node -e "
require('dotenv').config({ path: '../.env' });
const bcrypt = require('bcrypt');
const { Client } = require('pg');

const email = (process.env.SEED_ADMIN_EMAIL || 'admin@mergestars.com').toLowerCase();
const pass = process.env.SEED_ADMIN_PASSWORD;
const url = process.env.DATABASE_URL;

if (!url) { console.error('DATABASE_URL missing'); process.exit(1); }

bcrypt.hash(pass, 12).then(async (hash) => {
  const client = new Client({ connectionString: url });
  await client.connect();
  const res = await client.query(
    'UPDATE users SET password_hash = \$1 WHERE LOWER(email) = \$2 RETURNING email',
    [hash, email],
  );
  if (res.rowCount === 0) {
    console.error('No user found with email:', email);
    process.exit(1);
  }
  console.log('OK: password updated for', res.rows[0].email);
  await client.end();
}).catch((e) => { console.error(e); process.exit(1); });
"

if command -v systemctl >/dev/null 2>&1; then
  systemctl restart merge-stars-backend 2>/dev/null || true
fi

echo "Done. Log in at /admin/login"
