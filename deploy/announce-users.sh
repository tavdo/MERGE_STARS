#!/usr/bin/env bash
# Announce new platform to all registered users via Brevo.
#
# Usage:
#   bash deploy/announce-users.sh --dry-run          # list recipients
#   bash deploy/announce-users.sh --test you@mail.com  # one test email
#   bash deploy/announce-users.sh --yes              # send to all active users
#   bash deploy/announce-users.sh --yes --skip-sent  # skip emails in deploy/data/announce-sent.log
#   bash deploy/announce-users.sh --yes --limit 50  # first 50 only
#
# Optional .env:
#   ANNOUNCE_LANG=ka|en
#   ANNOUNCE_EMAIL_DELAY_MS=600   (pause between sends)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
# shellcheck source=load-env.sh
source "$SCRIPT_DIR/load-env.sh"

if [ -f "$REPO_ROOT/.env" ]; then
  load_env_file "$REPO_ROOT/.env"
fi

KEY="${BREVO_API_KEY:-}"
if [ -z "$KEY" ]; then
  echo "FAIL: BREVO_API_KEY not set in .env"
  exit 1
fi

echo "==> Brevo account check"
ACCOUNT_HTTP="$(curl -s -o /tmp/brevo-account.json -w '%{http_code}' \
  -H "api-key: $KEY" https://api.brevo.com/v3/account)"
if [ "$ACCOUNT_HTTP" != "200" ]; then
  echo "FAIL: Brevo HTTP $ACCOUNT_HTTP"
  cat /tmp/brevo-account.json 2>/dev/null || true
  exit 1
fi
echo "    Brevo OK"

mkdir -p "$REPO_ROOT/deploy/data"

cd "$REPO_ROOT/backend"
if [ ! -d node_modules/pg ]; then
  echo "FAIL: backend/node_modules/pg missing — run: cd backend && npm ci"
  exit 1
fi
export NODE_PATH="$REPO_ROOT/backend/node_modules${NODE_PATH:+:$NODE_PATH}"
node "$REPO_ROOT/deploy/scripts/announce-users.mjs" "$@"
