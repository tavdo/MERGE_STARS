/**
 * Ask users without a phone number to add it on their profile.
 * Run via: bash deploy/request-phone.sh
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
const logPath = resolve(REPO_ROOT, 'deploy/data/request-phone-sent.log');
const usersFile = process.env.REQUEST_PHONE_USERS_FILE;

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

function buildContent(firstName) {
  const name = firstName?.trim() || 'Member';
  const login = `${siteUrl}/login`;
  const profile = `${siteUrl}/dashboard/profile`;

  if (lang === 'en') {
    return {
      subject: 'MERGE STARS — Please add your phone number',
      text: `Hello ${name},

Please sign in and add your mobile phone number to your profile. This helps us verify your account and reach you about orders and deliveries.

Sign in: ${login}
Profile: ${profile}

It only takes a minute — open Profile, enter your number, and save.

Thank you,
MERGE STARS
${siteUrl}`,
      html: emailHtmlEn(name, login, profile),
    };
  }

  return {
    subject: 'MERGE STARS — გთხოვთ, დაამატოთ ტელეფონის ნომერი',
    text: `გამარჯობა ${name},

გთხოვთ, შედით თქვენს ანგარიშში და პროფილში დაამატოთ მობილური ტელეფონის ნომერი. ეს გვეხმარება ანგარიშის დადასტურებასა და შეკვეთებთან დაკავშირებულ შეტყობინებებში.

შესვლა: ${login}
პროფილი: ${profile}

გახსენით „ჩემი პროფილი“, შეიყვანეთ ნომერი და დააჭირეთ „შენახვა“.

მადლობა,
MERGE STARS
${siteUrl}`,
    html: emailHtmlKa(name, login, profile),
  };
}

function emailShell(body) {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#080808;font-family:sans-serif">
<div style="max-width:520px;margin:0 auto;padding:32px 24px;border:1px solid rgba(201,168,76,0.25);background:#0a0a0a">
  <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.25em;color:#c9a84c;font-weight:700">MERGE STARS</p>
  ${body}
  <p style="margin:24px 0 0;font-size:11px;color:#666">© MERGE STARS · <a href="${siteUrl}" style="color:#c9a84c">${siteUrl.replace('https://', '')}</a></p>
</div></body></html>`;
}

function emailHtmlKa(name, login, profile) {
  return emailShell(`
    <h1 style="color:#fff;font-size:20px;margin:0 0 16px">დაამატეთ ტელეფონის ნომერი</h1>
    <p style="color:#ccc;line-height:1.6;font-size:14px">გამარჯობა <strong>${name}</strong>,</p>
    <p style="color:#aaa;line-height:1.6;font-size:14px">პლატფორმის განახლების შემდეგ გთხოვთ, თქვენს პროფილში მიუთითოთ მობილური ტელეფონის ნომერი. ეს საჭიროა ანგარიშის დასადასტურებლად და მნიშვნელოვან შეტყობინებებზე დასაკავშირებლად.</p>
    <ol style="color:#aaa;font-size:14px;line-height:1.8;padding-left:20px;margin:16px 0">
      <li>შედით საიტზე თქვენი ელფოსტით</li>
      <li>გახსენით <strong style="color:#ccc">ჩემი პროფილი</strong></li>
      <li>შეიყვანეთ ტელეფონის ნომერი და დააჭირეთ <strong style="color:#ccc">შენახვა</strong></li>
    </ol>
    <p style="margin:24px 0"><a href="${profile}" style="display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#c9a84c,#f0d78a);color:#1a1408;text-decoration:none;font-weight:800;font-size:13px;letter-spacing:0.08em;border-radius:6px">პროფილის გახსნა</a></p>
    <p style="color:#888;font-size:13px">შესვლა: <a href="${login}" style="color:#c9a84c">${login}</a></p>
    <hr style="border:none;border-top:1px solid #222;margin:24px 0">
    <p style="color:#666;font-size:12px;line-height:1.5">English: Add your phone at <a href="${profile}" style="color:#c9a84c">your profile</a>.</p>
  `);
}

function emailHtmlEn(name, login, profile) {
  return emailShell(`
    <h1 style="color:#fff;font-size:20px;margin:0 0 16px">Add your phone number</h1>
    <p style="color:#ccc;line-height:1.6;font-size:14px">Hello <strong>${name}</strong>,</p>
    <p style="color:#aaa;line-height:1.6;font-size:14px">After our platform update, please add your mobile phone number to your profile. This is required for account verification and important notifications about your orders.</p>
    <ol style="color:#aaa;font-size:14px;line-height:1.8;padding-left:20px;margin:16px 0">
      <li>Sign in with your email</li>
      <li>Open <strong style="color:#ccc">My profile</strong></li>
      <li>Enter your phone number and click <strong style="color:#ccc">Save</strong></li>
    </ol>
    <p style="margin:24px 0"><a href="${profile}" style="display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#c9a84c,#f0d78a);color:#1a1408;text-decoration:none;font-weight:800;font-size:13px;letter-spacing:0.08em;border-radius:6px">OPEN PROFILE</a></p>
    <p style="color:#888;font-size:13px">Sign in: <a href="${login}" style="color:#c9a84c">${login}</a></p>
  `);
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
    console.error('FAIL: user list missing (REQUEST_PHONE_USERS_FILE)');
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
    console.log(`Found ${users.length} recipient(s) without phone${skipSent ? ' (excluding already sent)' : ''}`);
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
      console.error(`FAIL ${email}: ${err.message}`);
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
