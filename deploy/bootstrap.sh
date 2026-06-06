#!/usr/bin/env bash
# Idempotent server setup — safe to run on every deploy (GitHub Actions calls this).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DEPLOY_DIR="${DEPLOY_DIR:-$REPO_ROOT}"
DEPLOY_USER="${DEPLOY_USER:-$(whoami)}"

domain_from_env() {
  local url="${FRONTEND_URL:-}"
  url="${url#https://}"
  url="${url#http://}"
  url="${url%%/*}"
  if [ -n "$url" ] && [ "$url" != "yourdomain.com" ]; then
    echo "$url"
  else
    echo "_"
  fi
}

echo "==> Bootstrap server (dir: $DEPLOY_DIR, user: $DEPLOY_USER)"

if [ ! -f "$DEPLOY_DIR/.env" ]; then
  echo "    Creating .env from .env.example"
  cp "$DEPLOY_DIR/.env.example" "$DEPLOY_DIR/.env"
fi

# shellcheck disable=SC1091
source "$DEPLOY_DIR/.env" 2>/dev/null || true
DOMAIN="$(domain_from_env)"

echo "    nginx server_name: $DOMAIN"

if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: Node.js not found. On the server run once:"
  echo "  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -"
  echo "  apt-get install -y nodejs"
  exit 1
fi

if ! command -v nginx >/dev/null 2>&1; then
  echo "    Installing nginx..."
  apt-get update -qq
  apt-get install -y nginx
fi

echo "==> systemd: merge-stars-backend"
sed \
  -e "s|__DEPLOY_DIR__|$DEPLOY_DIR|g" \
  -e "s|__DEPLOY_USER__|$DEPLOY_USER|g" \
  "$SCRIPT_DIR/systemd/merge-stars-backend.service" \
  | tee /etc/systemd/system/merge-stars-backend.service >/dev/null

systemctl daemon-reload
systemctl enable merge-stars-backend

echo "==> nginx: merge-stars site"
sed \
  -e "s|__DEPLOY_DIR__|$DEPLOY_DIR|g" \
  -e "s|__DOMAIN__|$DOMAIN|g" \
  "$SCRIPT_DIR/nginx/merge-stars.conf" \
  | tee /etc/nginx/sites-available/merge-stars.conf >/dev/null

ln -sf /etc/nginx/sites-available/merge-stars.conf /etc/nginx/sites-enabled/merge-stars.conf
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true

systemctl enable nginx
echo "    Bootstrap done."
