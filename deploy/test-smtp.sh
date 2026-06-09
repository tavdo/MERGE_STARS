#!/usr/bin/env bash
# Test Gmail SMTP from the VPS — run: bash deploy/test-smtp.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
# shellcheck source=load-env.sh
source "$SCRIPT_DIR/load-env.sh"
load_env_file "$REPO_ROOT/.env"

cd "$REPO_ROOT/backend"

VERIFY_ONLY=0
SEND_TO=""
for arg in "$@"; do
  case "$arg" in
    --verify-only) VERIFY_ONLY=1 ;;
    *@*) SEND_TO="$arg" ;;
  esac
done

VERIFY_ONLY="$VERIFY_ONLY" SEND_TO="$SEND_TO" node -e "
require('dotenv').config({ path: '../.env' });
const nodemailer = require('nodemailer');
const user = (process.env.SMTP_USER || '').trim().toLowerCase();
const pass = (process.env.SMTP_PASS || '').trim();
const port = Number(process.env.SMTP_PORT || 465);

if (!user || !pass) {
  console.error('FAIL: SMTP_USER and SMTP_PASS must be set in .env');
  process.exit(1);
}

const t = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port,
  secure: port === 465,
  requireTLS: port === 587,
  auth: { user, pass },
});

(async () => {
  console.log('SMTP_USER:', user);
  console.log('SMTP_PORT:', port);
  await t.verify();
  console.log('OK: Gmail SMTP login successful');
  const verifyOnly = process.env.VERIFY_ONLY === '1';
  const to = process.env.SEND_TO || '';
  if (verifyOnly || !to) {
    if (!verifyOnly) console.log('(skip send — pass an email to send a test message)');
    return;
  }
  const info = await t.sendMail({
    from: process.env.MAIL_FROM || user,
    to,
    subject: 'MERGE STARS — SMTP test',
    text: 'If you see this, server SMTP is working.',
  });
  console.log('OK: test email sent to', to, '—', info.messageId);
})().catch((err) => {
  console.error('FAIL:', err.message);
  process.exit(1);
});
"
