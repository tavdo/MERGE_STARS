#!/usr/bin/env bash
# Test Resend HTTPS API — run: bash deploy/test-resend.sh [email]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
# shellcheck source=load-env.sh
source "$SCRIPT_DIR/load-env.sh"
load_env_file "$REPO_ROOT/.env"

KEY="${RESEND_API_KEY:-}"
if [ -z "$KEY" ]; then
  echo "FAIL: RESEND_API_KEY not set in .env"
  exit 1
fi

SEND_TO=""
for arg in "$@"; do
  case "$arg" in
    --verify-only) ;;
    *@*) SEND_TO="$arg" ;;
  esac
done

FROM="${RESEND_FROM:-MERGE STARS <onboarding@resend.dev>}"
echo "Resend API key: configured"
echo "From: $FROM"

if [ -z "$SEND_TO" ]; then
  echo "OK: RESEND_API_KEY is set (pass an email to send a test message)"
  exit 0
fi

cd "$REPO_ROOT/backend"
RESEND_API_KEY="$KEY" RESEND_FROM="$FROM" SEND_TO="$SEND_TO" node -e "
const key = process.env.RESEND_API_KEY.trim();
const from = process.env.RESEND_FROM.trim();
const to = process.env.SEND_TO;
fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    from,
    to: [to],
    subject: 'MERGE STARS — Resend test',
    text: 'If you see this, Resend is working on the server.',
  }),
}).then(async (r) => {
  const body = await r.text();
  if (!r.ok) throw new Error('HTTP ' + r.status + ': ' + body.slice(0, 300));
  console.log('OK: test email sent to', to, '—', body.slice(0, 120));
}).catch((e) => { console.error('FAIL:', e.message); process.exit(1); });
"
