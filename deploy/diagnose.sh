#!/usr/bin/env bash
# Quick server check — run on VPS: ./deploy/diagnose.sh
set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "=== MERGE STARS server diagnose ==="
echo "Repo: $REPO_ROOT"
echo ""

fail=0
warn() { echo "  ⚠ $1"; }
ok() { echo "  ✓ $1"; }
err() { echo "  ✗ $1"; fail=1; }

echo "-- Tools --"
if command -v node >/dev/null 2>&1; then
  ok "Node $(node -v)"
else
  err "Node.js not installed"
fi
if command -v npm >/dev/null 2>&1; then
  ok "npm $(npm -v)"
else
  err "npm not installed"
fi
if command -v nginx >/dev/null 2>&1; then
  ok "nginx installed"
else
  warn "nginx not installed"
fi
echo ""

echo "-- Git --"
if [ -d "$REPO_ROOT/.git" ]; then
  ok "git repo OK"
  (cd "$REPO_ROOT" && git log -1 --oneline)
else
  err "Not a git repo — clone MERGE_STARS first"
fi
echo ""

echo "-- Frontend dist --"
DIST="$REPO_ROOT/frontend/dist"
if [ -f "$DIST/index.html" ]; then
  ok "frontend/dist/index.html exists"
  echo "  Size: $(du -sh "$DIST" 2>/dev/null | cut -f1)"
  echo "  Assets:"
  ls -la "$DIST/assets/" 2>/dev/null | head -5 || true
else
  err "frontend/dist missing — run: ./deploy/deploy.sh"
fi
echo ""

echo "-- Backend --"
if [ -f "$REPO_ROOT/backend/dist/main.js" ]; then
  ok "backend/dist/main.js exists"
else
  warn "backend not built yet"
fi
if systemctl is-active merge-stars-backend &>/dev/null; then
  ok "merge-stars-backend service running"
elif systemctl list-unit-files merge-stars-backend.service &>/dev/null 2>&1; then
  warn "merge-stars-backend installed but not running"
else
  warn "merge-stars-backend service not installed — run deploy/install-server.sh"
fi
echo ""

echo "-- Nginx --"
if [ -f /etc/nginx/sites-enabled/merge-stars.conf ]; then
  ok "nginx site merge-stars.conf enabled"
  grep -E "^\s*root\s" /etc/nginx/sites-enabled/merge-stars.conf 2>/dev/null || true
else
  warn "nginx merge-stars.conf not found — run deploy/install-server.sh"
fi
echo ""

echo "-- .env --"
if [ -f "$REPO_ROOT/.env" ]; then
  ok ".env exists"
  grep -E "^FRONTEND_URL=" "$REPO_ROOT/.env" 2>/dev/null || warn "FRONTEND_URL not set in .env"
else
  warn ".env missing — cp .env.example .env"
fi
echo ""

if [ "$fail" -eq 0 ]; then
  echo "=== OK (or warnings only) ==="
else
  echo "=== FIX ERRORS ABOVE, then run: ==="
  echo "  cd $REPO_ROOT && ./deploy/deploy.sh"
fi
exit "$fail"
