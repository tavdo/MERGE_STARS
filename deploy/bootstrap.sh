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

echo "==> PostgreSQL (idempotent)"
DB_USER="${DB_USER:-merge_stars}"
DB_NAME="${DB_NAME:-merge_stars}"
DB_PASSWORD="${DB_PASSWORD:-merge_stars}"
export DB_USER DB_NAME DB_PASSWORD
bash "$SCRIPT_DIR/postgres-setup.sh"

ENV_FILE="$DEPLOY_DIR/.env"
if ! grep -q '^DATABASE_URL=' "$ENV_FILE" 2>/dev/null || grep -q 'CHANGE_ME' "$ENV_FILE" 2>/dev/null; then
  echo "    Updating .env database placeholders"
  sed -i "s|^DATABASE_URL=.*|DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@127.0.0.1:5432/${DB_NAME}|" "$ENV_FILE"
  sed -i "s|^DB_PASSWORD=.*|DB_PASSWORD=${DB_PASSWORD}|" "$ENV_FILE"
fi
if grep -q 'change-this-to-a-long-random-string' "$ENV_FILE" 2>/dev/null; then
  JWT_GEN="$(openssl rand -hex 32 2>/dev/null || head -c 32 /dev/urandom | xxd -p -c 64)"
  sed -i "s|^JWT_SECRET=.*|JWT_SECRET=${JWT_GEN}|" "$ENV_FILE"
  echo "    Generated JWT_SECRET in .env"
fi

echo "    Bootstrap done."
