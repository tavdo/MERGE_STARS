#!/usr/bin/env bash
# MERGE STARS — production deploy on Linux (no Docker)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

# shellcheck disable=SC1091
source "$SCRIPT_DIR/load-env.sh"

if [ -f .env ]; then
  sed -i 's/Mergestar01@gmail.com/mergestars01@gmail.com/g' .env
  sed -i 's/\r$//' .env
  # systemd EnvironmentFile: quote MAIL_FROM (spaces)
  if grep -q '^MAIL_FROM=' .env; then
    sed -i 's/^MAIL_FROM=.*/MAIL_FROM="MERGE STARS <mergestars01@gmail.com>"/' .env
  fi
  # Temporarily off until Brevo/SMTP is configured on VPS
  if ! grep -q '^EMAIL_VERIFY=' .env; then
    echo 'EMAIL_VERIFY=false' >> .env
  else
    sed -i 's/^EMAIL_VERIFY=.*/EMAIL_VERIFY=false/' .env
  fi
  if grep -q '^SMTP_PORT=' .env; then
    sed -i 's/^SMTP_PORT=.*/SMTP_PORT=587/' .env
  else
    echo 'SMTP_PORT=587' >> .env
  fi
  set -a
  load_env_file .env
  set +a
fi

# NODE_ENV=production in .env makes npm skip devDependencies (nest, vite, tsc).
# Unset during build; systemd loads .env at runtime for the backend service.
unset NODE_ENV

export VITE_API_URL="${VITE_API_URL:-/api}"
export VITE_WS_URL="${VITE_WS_URL:-}"
export VITE_EMAIL_VERIFY="${VITE_EMAIL_VERIFY:-false}"
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=2048}"

echo "==> Deploy MERGE STARS from $REPO_ROOT"

# nginx + systemd on first deploy (no-op if already configured)
bash "$SCRIPT_DIR/bootstrap.sh"

if [ -f .env ]; then
  set -a
  load_env_file .env
  set +a
fi

if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: Node.js not found. Install Node 20+ first."
  exit 1
fi
echo "    Node $(node -v) | npm $(npm -v)"
NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
if [ "$NODE_MAJOR" -lt 20 ]; then
  echo "WARNING: Node 20+ recommended (current: $(node -v)). Upgrade with NodeSource if builds fail."
fi

echo "==> Backend: install & build"
cd "$REPO_ROOT/backend"
npm ci --include=dev
npm run build
npm prune --omit=dev
test -f dist/main.js || { echo "ERROR: backend build failed - dist/main.js missing"; exit 1; }

wait_for_backend() {
  local i
  for i in $(seq 1 45); do
    if curl -sf --max-time 2 http://127.0.0.1:${PORT:-3000}/api/health >/dev/null 2>&1; then
      echo "    backend health OK"
      return 0
    fi
    sleep 2
  done
  echo "ERROR: backend did not respond on /api/health"
  if command -v journalctl >/dev/null 2>&1; then
    journalctl -u merge-stars-backend -n 40 --no-pager || true
  fi
  echo "==> Manual backend start (diagnostics, 20s)"
  cd "$REPO_ROOT/backend"
  timeout 20 node dist/main.js 2>&1 || true
  cd "$REPO_ROOT"
  return 1
}

wait_for_postgres() {
  if ! command -v pg_isready >/dev/null 2>&1; then
    return 0
  fi
  local i
  for i in $(seq 1 30); do
    if pg_isready -h 127.0.0.1 -p 5432 -q 2>/dev/null; then
      echo "    PostgreSQL ready"
      return 0
    fi
    sleep 2
  done
  echo "WARNING: PostgreSQL not ready — backend may fail to start"
  return 0
}

verify_db_connection() {
  if [ -z "${DATABASE_URL:-}" ]; then
    echo "ERROR: DATABASE_URL is not set in .env"
    grep -E '^DATABASE|^DB_' "$REPO_ROOT/.env" 2>/dev/null || true
    return 1
  fi
  echo "    DATABASE_URL host: $(echo "$DATABASE_URL" | sed -E 's|.*@([^/]+)/.*|\1|')"
  cd "$REPO_ROOT/backend"
  DATABASE_URL="$DATABASE_URL" node -e "
    const { Client } = require('pg');
    const c = new Client({ connectionString: process.env.DATABASE_URL });
    c.connect()
      .then(() => c.query('SELECT 1'))
      .then(() => { console.log('    DATABASE_URL connection OK'); return c.end(); })
      .catch((err) => { console.error('ERROR: DATABASE_URL failed:', err.message); process.exit(1); });
  "
  cd "$REPO_ROOT"
}

echo "==> Restart backend (DB schema sync)"
wait_for_postgres
verify_db_connection
if command -v systemctl >/dev/null 2>&1; then
  systemctl restart merge-stars-backend
  wait_for_backend
fi

echo "==> Import users from MySQL dump (if present)"
if [ -f "$REPO_ROOT/backend/data/users.mysql.sql" ] && [ -n "${DATABASE_URL:-}" ]; then
  cd "$REPO_ROOT/backend"
  node scripts/import-users-sql.js data/users.mysql.sql || echo "WARNING: user import failed — check DATABASE_URL and PostgreSQL"
  cd "$REPO_ROOT"
else
  echo "    (skip) backend/data/users.mysql.sql or DATABASE_URL not set"
fi

echo "==> Frontend: install & build"
cd "$REPO_ROOT/frontend"
npm ci --include=dev
npm run build
if [ ! -f dist/index.html ]; then
  echo "ERROR: frontend build failed - dist/index.html not created"
  exit 1
fi
echo "    frontend/dist OK ($(du -sh dist | cut -f1))"

echo "==> Restart backend service"
if command -v systemctl >/dev/null 2>&1; then
  systemctl restart merge-stars-backend
  wait_for_backend
  systemctl status merge-stars-backend --no-pager -l || true
else
  echo "    (skip) systemctl not found"
fi

echo "==> Reload nginx"
if command -v nginx >/dev/null 2>&1; then
  nginx -t
  systemctl reload nginx
else
  echo "    (skip) nginx not found"
fi

echo "==> SMTP verify (registration / forgot-password emails)"
ENV_FILE="$REPO_ROOT/.env"
if [ -f "$SCRIPT_DIR/test-smtp.sh" ] && [ -f "$ENV_FILE" ]; then
  cd "$REPO_ROOT"
  if ! bash "$SCRIPT_DIR/test-smtp.sh" --verify-only; then
    echo "    Retrying SMTP on port 587..."
    sed -i 's/^SMTP_PORT=.*/SMTP_PORT=587/' "$ENV_FILE"
    set -a
    load_env_file "$ENV_FILE"
    set +a
    if command -v systemctl >/dev/null 2>&1; then
      systemctl restart merge-stars-backend
      wait_for_backend || true
    fi
    if ! bash "$SCRIPT_DIR/test-smtp.sh" --verify-only; then
      echo "WARNING: SMTP still failing — add GitHub secret SMTP_PASS and ensure outbound port 587 is open"
    fi
  fi
fi

echo ""
echo "==> Deploy complete"
echo "    Commit: $(git log -1 --oneline)"
echo "    Frontend: $REPO_ROOT/frontend/dist"
echo "    Backend:  port ${PORT:-3000}"
ls -la "$REPO_ROOT/frontend/dist/index.html"
