#!/usr/bin/env bash
# One command on the VPS:  bash deploy/fix-vps-now.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

# shellcheck disable=SC1091
source "$SCRIPT_DIR/load-env.sh"
# shellcheck disable=SC1091
source "$SCRIPT_DIR/harden-production-env.sh"

echo "==> Fix password reset loop (MERGE STARS)"
echo "    Directory: $REPO_ROOT"

if [ -d .git ]; then
  git pull origin main || echo "WARNING: git pull failed — continuing with local files"
fi

if [ ! -f .env ]; then
  echo "ERROR: .env not found in $REPO_ROOT"
  exit 1
fi

harden_production_env .env
echo "    Done. Safe flags:"
grep -E '^(SEED_ADMIN_SYNC|IMPORT_USERS_SYNC|IMPORT_USERS_UPDATE|DB_SYNC|DB_MIGRATE)=' .env 2>/dev/null || true

echo ""
echo "==> Deploy (rebuild + restart)"
bash "$SCRIPT_DIR/deploy.sh"

echo ""
echo "==> OK — users should set password once via Forgot password, then it will stick."
