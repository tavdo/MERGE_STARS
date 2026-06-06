/**
 * Import users from CSV into PostgreSQL (MERGE STARS)
 * Usage: node scripts/import-users.js path/to/users.csv
 *
 * Requires DATABASE_URL in environment (load from repo root .env).
 */
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const { Client } = require('pg');

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const cols = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
    const row = {};
    headers.forEach((h, i) => {
      row[h] = cols[i] ?? '';
    });
    return row;
  });
}

function mergeId() {
  return `MERGE-${Math.floor(100000 + Math.random() * 899999)}`;
}

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: node scripts/import-users.js users.csv');
    process.exit(1);
  }

  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('Set DATABASE_URL in environment');
    process.exit(1);
  }

  const rows = parseCsv(fs.readFileSync(path.resolve(file), 'utf8'));
  const client = new Client({ connectionString: url });
  await client.connect();

  let imported = 0;
  for (const row of rows) {
    const email = (row.email || '').toLowerCase();
    if (!email || !row.password) continue;

    const exists = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rowCount) {
      console.log(`Skip existing: ${email}`);
      continue;
    }

    const hash = row.password.startsWith('$2')
      ? row.password
      : await bcrypt.hash(row.password, 12);

    const role = (row.role || 'user').toLowerCase();
    const roles = role === 'admin' ? ['admin', 'manager', 'user'] : ['user'];

    await client.query(
      `INSERT INTO users (
        email, phone, password_hash, first_name, last_name, personal_id,
        merge_id, founder_id, brand_line_id, roles, status, kyc_status,
        created_at, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'active','pending',NOW(),NOW())`,
      [
        email,
        row.phone || null,
        hash,
        row.first_name || row.firstname || 'User',
        row.last_name || row.lastname || '',
        row.personal_id || null,
        mergeId(),
        `FND-${Date.now().toString(36).toUpperCase()}`,
        `BL-${Date.now().toString(36).toUpperCase()}`,
        JSON.stringify(roles),
      ],
    );
    imported++;
    console.log(`Imported: ${email}`);
  }

  await client.end();
  console.log(`Done. Imported ${imported} users.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
