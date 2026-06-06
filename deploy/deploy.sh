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

export NODE_ENV="${NODE_ENV:-production}"
export VITE_API_URL="${VITE_API_URL:-/api}"
export VITE_WS_URL="${VITE_WS_URL:-}"

# Helpful on small VPS during Vite build
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=2048}"

echo "==> Deploy MERGE STARS from $REPO_ROOT"

if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: Node.js not found. Install Node 20+ first."
  exit 1
fi
echo "    Node $(node -v) | npm $(npm -v)"

echo "==> Backend: install & build"
cd "$REPO_ROOT/backend"
npm ci --omit=dev
npm run build
test -f dist/main.js || { echo "ERROR: backend build failed — dist/main.js missing"; exit 1; }

echo "==> Frontend: install & build"
cd "$REPO_ROOT/frontend"
npm ci
npm run build
if [ ! -f dist/index.html ]; then
  echo "ERROR: frontend build failed — dist/index.html not created"
  exit 1
fi
echo "    frontend/dist OK ($(du -sh dist | cut -f1))"

echo "==> Restart backend service"
if command -v systemctl >/dev/null 2>&1 && systemctl cat merge-stars-backend.service &>/dev/null; then
  sudo systemctl restart merge-stars-backend
  sudo systemctl status merge-stars-backend --no-pager -l || true
else
  echo "    (skip) merge-stars-backend.service not installed — run deploy/install-server.sh once"
fi

echo "==> Reload nginx"
if command -v nginx >/dev/null 2>&1; then
  sudo nginx -t
  sudo systemctl reload nginx
else
  echo "    (skip) nginx not found"
fi

echo ""
echo "==> Deploy complete"
echo "    Commit: $(git log -1 --oneline)"
echo "    Frontend: $REPO_ROOT/frontend/dist"
echo "    Backend:  port ${PORT:-3000}"
ls -la "$REPO_ROOT/frontend/dist/index.html"
