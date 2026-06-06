#!/usr/bin/env bash
# MERGE STARS — production deploy on Linux (no Docker)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

# NODE_ENV=production in .env makes npm skip devDependencies (nest, vite, tsc).
# Unset during build; systemd loads .env at runtime for the backend service.
unset NODE_ENV

export VITE_API_URL="${VITE_API_URL:-/api}"
export VITE_WS_URL="${VITE_WS_URL:-}"
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=2048}"

echo "==> Deploy MERGE STARS from $REPO_ROOT"

# nginx + systemd on first deploy (no-op if already configured)
bash "$SCRIPT_DIR/bootstrap.sh"

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

echo ""
echo "==> Deploy complete"
echo "    Commit: $(git log -1 --oneline)"
echo "    Frontend: $REPO_ROOT/frontend/dist"
echo "    Backend:  port ${PORT:-3000}"
ls -la "$REPO_ROOT/frontend/dist/index.html"
