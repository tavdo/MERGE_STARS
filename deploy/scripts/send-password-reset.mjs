/**
 * Bulk email: ask users to reset password via /forgot-password.
 * Run via: bash deploy/send-password-reset.sh
 */
import { readFileSync, appendFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '../..');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const skipSent = args.includes('--skip-sent');
const yes = args.includes('--yes');
const testIdx = args.indexOf('--test');
const testEmail = testIdx >= 0 ? args[testIdx + 1] : null;
const lang = (process.env.ANNOUNCE_LANG || 'ka').toLowerCase();

const key = (process.env.BREVO_API_KEY || process.env['BREVO_API-KEY'] || '').trim();
const siteUrl = (process.env.FRONTEND_URL || 'https://mergestars.com').replace(/\/$/, '');
const delayMs = Number(process.env.ANNOUNCE_EMAIL_DELAY_MS || 600);
const logPath = resolve(REPO_ROOT, 'deploy/data/password-reset-sent.log');
const usersFile = process.env.PASSWORD_RESET_USERS_FILE;

if (!key) {
  console.error('FAIL: BREVO_API_KEY not set in .env');
  process.exit(1);
}

const rawFrom = (process.env.MAIL_FROM || 'MERGE STARS <noreply@mergestars.com>').trim();
const fromEmail = (rawFrom.match(/<([^>]+)>/) || [])[1] || rawFrom;
const fromName = (rawFrom.match(/^(.+?)\s*</) || [])[1]?.trim() || 'MERGE STARS';

function loadSent() {
  if (!existsSync(logPath)) return new Set();
  const lines = readFileSync(logPath, 'utf8').split('\n').filter(Boolean);
  return new Set(lines.map((l) => l.trim().toLowerCase()));
}

function markSent(email) {
  appendFileSync(logPath, `${email.toLowerCase()}\n`);
}

function emailShell(body) {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#080808;font-family:sans-serif">
<div style="max-width:520px;margin:0 auto;padding:32px 24px;border:1px solid rgba(201,168,76,0.25);background:#0a0a0a">
  <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.25em;color:#c9a84c;font-weight:700">MERGE STARS</p>
  ${body}
  <p style="margin:24px 0 0;font-size:11px;color:#666">© MERGE STARS · <a href="${siteUrl}" style="color:#c9a84c">${siteUrl.replace('https://', '')}</a></p>
</div></body></html>`;
}

function buildContent(firstName) {
  const name = firstName?.trim() || 'Member';
  const forgot = `${siteUrl}/forgot-password`;
  const login = `${siteUrl}/login`;

  if (lang === 'en') {
    return {
      subject: 'MERGE STARS — Reset your password',
      text: `Hello ${name},

For security, please reset your password on MERGE STARS.

Reset password: ${forgot}
Sign in: ${login}

If you did not request this, you can ignore this message.

MERGE STARS
${siteUrl}`,
      html: emailShell(`
        <h1 style="color:#fff;font-size:20px;margin:0 0 16px">Reset your password</h1>
        <p style="color:#ccc;line-height:1.6;font-size:14px">Hello <strong>${name}</strong>,</p>
        <p style="color:#aaa;line-height:1.6;font-size:14px">For security, please reset your password. Click the button below and request your reset code.</p>
        <p style="margin:24px 0"><a href="${forgot}" style="display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#c9a84c,#f0d78a);color:#1a1408;text-decoration:none;font-weight:800;font-size:13px;letter-spacing:0.08em;border-radius:6px">RESET PASSWORD</a></p>
        <p style="color:#888;font-size:13px;line-height:1.5">If you did not request this, ignore this email. You can always sign in at <a href="${login}" style="color:#c9a84c">${login}</a>.</p>
      `),
    };
  }

  return {
    subject: 'MERGE STARS — პაროლის განახლება',
    text: `გამარჯობა ${name},

უსაფრთხოებისთვის გთხოვთ განაახლოთ MERGE STARS-ის პაროლი.

პაროლის აღდგენა: ${forgot}
შესვლა: ${login}

თუ ეს თქვენ არ გითხოვიათ, უბრალოდ დააიგნორეთ.

MERGE STARS
${siteUrl}`,
    html: emailShell(`
      <h1 style="color:#fff;font-size:20px;margin:0 0 16px">განაახლეთ პაროლი</h1>
      <p style="color:#ccc;line-height:1.6;font-size:14px">გამარჯობა <strong>${name}</strong>,</p>
      <p style="color:#aaa;line-height:1.6;font-size:14px">უსაფრთხოებისთვის გთხოვთ განაახლოთ პაროლი. დააჭირეთ ღილაკს და მოითხოვეთ აღდგენის კოდი.</p>
      <p style="margin:24px 0"><a href="${forgot}" style="display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#c9a84c,#f0d78a);color:#1a1408;text-decoration:none;font-weight:800;font-size:13px;letter-spacing:0.08em;border-radius:6px">პაროლის აღდგენა</a></p>
      <p style="color:#888;font-size:13px;line-height:1.5">თუ ეს თქვენ არ გითხოვიათ, უბრალოდ დააიგნორეთ. შესვლა: <a href="${login}" style="color:#c9a84c">${login}</a></p>
    `),
  };
}

async function sendBrevo(to, firstName, lastName) {
  const { subject, html, text } = buildContent(firstName || lastName);
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': key, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender: { name: fromName, email: fromEmail },
      to: [{ email: to, name: [firstName, lastName].filter(Boolean).join(' ') || undefined }],
      subject,
      htmlContent: html,
      textContent: text,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HTTP ${res.status}: ${body.slice(0, 200)}`);
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function loadUsers() {
  if (!usersFile || !existsSync(usersFile)) {
    console.error('FAIL: user list missing (PASSWORD_RESET_USERS_FILE)');
    process.exit(1);
  }
  const raw = readFileSync(usersFile, 'utf8').trim();
  if (!raw) return [];
  return JSON.parse(raw);
}

async function main() {
  const sent = skipSent ? loadSent() : new Set();
  let users;

  if (testEmail) {
    users = [{ email: testEmail, first_name: 'Test', last_name: 'User' }];
    console.log(`Test mode → ${testEmail}`);
  } else {
    users = loadUsers();
    users = users.filter((u) => u.email && !sent.has(u.email.toLowerCase()));
    console.log(`Found ${users.length} recipient(s)${skipSent ? ' (excluding already sent)' : ''}`);
  }

  if (dryRun) {
    users.slice(0, 20).forEach((u) => console.log(' ', u.email));
    if (users.length > 20) console.log(`  … and ${users.length - 20} more`);
    console.log(`Dry run — no emails sent. Use --yes to send.`);
    return;
  }

  if (!testEmail && !yes) {
    console.error('Refusing to send without --yes (use --dry-run or --test email@ first)');
    process.exit(1);
  }

  let ok = 0;
  let fail = 0;

  for (const u of users) {
    const email = u.email.trim().toLowerCase();
    try {
      await sendBrevo(email, u.first_name, u.last_name);
      if (!testEmail) markSent(email);
      ok++;
      console.log(`OK  ${email}`);
    } catch (err) {
      fail++;
      console.error(`FAIL ${email}: ${(err && err.message) ? err.message : String(err)}`);
    }
    if (users.length > 1) await sleep(delayMs);
  }

  console.log(`\nDone: ${ok} sent, ${fail} failed`);
  if (fail > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

