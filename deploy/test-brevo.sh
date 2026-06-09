#!/usr/bin/env bash
# Test Brevo HTTPS API — run: bash deploy/test-brevo.sh [email]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
# shellcheck source=load-env.sh
source "$SCRIPT_DIR/load-env.sh"
if [ -f "$REPO_ROOT/.env" ]; then
  load_env_file "$REPO_ROOT/.env"
fi
if [ -z "${BREVO_API_KEY:-}" ] && [ -f "$REPO_ROOT/backend/.env" ]; then
  load_env_file "$REPO_ROOT/backend/.env"
fi

KEY="${BREVO_API_KEY:-}"
if [ -z "$KEY" ]; then
  echo "FAIL: BREVO_API_KEY not set in .env"
  exit 1
fi

SEND_TO=""
for arg in "$@"; do
  case "$arg" in
    --verify-only) ;;
    *@*) SEND_TO="$arg" ;;
  esac
done

echo "Brevo API key: configured"
ACCOUNT_HTTP="$(curl -s -o /tmp/brevo-account.json -w '%{http_code}' \
  -H "api-key: $KEY" https://api.brevo.com/v3/account)"
if [ "$ACCOUNT_HTTP" != "200" ]; then
  echo "FAIL: Brevo account check HTTP $ACCOUNT_HTTP"
  cat /tmp/brevo-account.json 2>/dev/null || true
  exit 1
fi
echo "OK: Brevo account authenticated"

if [ -z "$SEND_TO" ]; then
  echo "(skip send — pass an email to send a test message)"
  exit 0
fi

cd "$REPO_ROOT/backend"
BREVO_API_KEY="$KEY" SEND_TO="$SEND_TO" node -e "
require('dotenv').config({ path: '../.env' });
const key = process.env.BREVO_API_KEY.trim();
const to = process.env.SEND_TO;
const fromEmail = (process.env.SMTP_USER || 'mergestars01@gmail.com').trim().toLowerCase();
fetch('https://api.brevo.com/v3/smtp/email', {
  method: 'POST',
  headers: { 'api-key': key, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sender: { name: 'MERGE STARS', email: fromEmail },
    to: [{ email: to }],
    subject: 'MERGE STARS — Brevo test',
    textContent: 'If you see this, Brevo is working on the server.',
  }),
}).then(async (r) => {
  const body = await r.text();
  if (!r.ok) throw new Error('HTTP ' + r.status + ': ' + body.slice(0, 200));
  console.log('OK: test email sent to', to);
}).catch((e) => { console.error('FAIL:', e.message); process.exit(1); });
"
