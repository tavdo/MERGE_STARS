#!/usr/bin/env bash
# Diagnose email delivery on production server
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
# shellcheck source=../load-env.sh
source "$SCRIPT_DIR/../load-env.sh"

if [ -f "$REPO_ROOT/.env" ]; then
  load_env_file "$REPO_ROOT/.env"
fi

TEST_EMAIL="${1:-temotavdgiridze1226@gmail.com}"
KEY="${BREVO_API_KEY:-}"

echo "==> Mail config"
echo "    mail mode (health): $(curl -sf http://127.0.0.1:3000/api/health | grep -o '"mail":"[^"]*"' || echo unknown)"
echo "    EMAIL_VERIFY=${EMAIL_VERIFY:-unset}"
echo "    VITE_EMAIL_VERIFY=${VITE_EMAIL_VERIFY:-unset}"
echo "    MAIL_FROM=${MAIL_FROM:-unset}"
echo "echo "    BREVO_API_KEY=${KEY:+configured}${KEY:-MISSING}""

echo "==> User lookup: $TEST_EMAIL"
if [ -n "${DATABASE_URL:-}" ]; then
  COUNT="$(psql "$DATABASE_URL" -t -A -c "SELECT count(*) FROM users WHERE lower(email) = lower('${TEST_EMAIL}');")"
  echo "    registered: $COUNT"
else
  echo "    (skip) DATABASE_URL not set"
fi

if [ -n "$KEY" ]; then
  echo "==> Brevo account"
  ACCOUNT_HTTP="$(curl -s -o /tmp/brevo-account.json -w '%{http_code}' -H "api-key: $KEY" https://api.brevo.com/v3/account)"
  echo "    account HTTP: $ACCOUNT_HTTP"

  echo "==> Brevo senders"
  curl -s -H "api-key: $KEY" https://api.brevo.com/v3/senders | head -c 600
  echo

  echo "==> Brevo recent transactional emails"
  curl -s -H "api-key: $KEY" "https://api.brevo.com/v3/smtp/emails?limit=5&sort=desc" | head -c 1200
  echo
fi

echo "==> API: forgot-password"
node -e "
fetch('http://127.0.0.1:3000/api/auth/forgot-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: process.argv[1] }),
}).then(async (r) => {
  console.log('    status', r.status, await r.text());
}).catch((e) => { console.error(e); process.exit(1); });
" "$TEST_EMAIL"

sleep 2
echo "==> Backend logs (last 2 min)"
journalctl -u merge-stars-backend --since '2 min ago' --no-pager | grep -iE 'mail|brevo|failed|reset|error' || echo "    (no mail errors)"
