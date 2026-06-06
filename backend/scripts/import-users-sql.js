/**
 * Import users from phpMyAdmin MySQL dump into PostgreSQL.
 *
 * Usage (from backend/):
 *   DATABASE_URL=postgresql://... node scripts/import-users-sql.js
 *   DATABASE_URL=postgresql://... node scripts/import-users-sql.js data/users.mysql.sql
 */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const DEFAULT_SQL = path.join(__dirname, '..', 'data', 'users.mysql.sql');

/** Parse one SQL VALUES tuple: (1, 'name', 'email', ...) */
function parseSqlTuple(raw) {
  const values = [];
  let i = 0;
  const s = raw.trim().replace(/^\(/, '').replace(/\)\s*,?\s*$/, '');

  while (i < s.length) {
    while (i < s.length && (s[i] === ' ' || s[i] === ',')) i++;

    if (i >= s.length) break;

    if (s[i] === "'") {
      i++;
      let val = '';
      while (i < s.length) {
        if (s[i] === '\\') {
          val += s[i + 1] ?? '';
          i += 2;
          continue;
        }
        if (s[i] === "'") {
          if (s[i + 1] === "'") {
            val += "'";
            i += 2;
            continue;
          }
          i++;
          break;
        }
        val += s[i++];
      }
      values.push(val);
      continue;
    }

    if (s.slice(i, i + 4).toUpperCase() === 'NULL') {
      values.push(null);
      i += 4;
      continue;
    }

    let token = '';
    while (i < s.length && s[i] !== ',') token += s[i++];
    values.push(token.trim());
  }

  return values;
}

function splitInsertRows(sql) {
  const match = sql.match(/INSERT INTO `users`[\s\S]*?VALUES\s*([\s\S]*?);/i);
  if (!match) throw new Error('No INSERT INTO users found in SQL dump');

  const block = match[1];
  const rows = [];
  let depth = 0;
  let start = -1;

  for (let i = 0; i < block.length; i++) {
    const ch = block[i];
    if (ch === '(') {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === ')') {
      depth--;
      if (depth === 0 && start >= 0) {
        rows.push(block.slice(start, i + 1));
        start = -1;
      }
    }
  }

  return rows;
}

function splitName(full) {
  const trimmed = (full || '').trim();
  const idx = trimmed.indexOf(' ');
  if (idx === -1) return { firstName: trimmed, lastName: '' };
  return {
    firstName: trimmed.slice(0, idx).trim(),
    lastName: trimmed.slice(idx + 1).trim(),
  };
}

function mapRoles(role) {
  const n = Number(role);
  // MySQL dump: 0 = admin, 1 = regular user (default)
  if (n === 0) return ['admin', 'manager', 'user'];
  return ['user'];
}

function normalizePassword(hash) {
  if (!hash) return hash;
  return hash.replace(/^\$2y\$/, '$2a$');
}

function parseUsersFromSql(sql) {
  return splitInsertRows(sql).map((row) => {
    const [
      legacyId,
      name,
      email,
      personalId,
      emailVerifiedAt,
      password,
      role,
      ,
      createdAt,
      updatedAt,
    ] = parseSqlTuple(row);

    const { firstName, lastName } = splitName(name);

    return {
      legacyId: Number(legacyId),
      firstName,
      lastName,
      email: String(email).toLowerCase(),
      personalId: personalId || null,
      passwordHash: normalizePassword(password),
      roles: mapRoles(role),
      kycStatus: emailVerifiedAt ? 'verified' : 'pending',
      mergeId: `MERGE-${String(legacyId).padStart(6, '0')}`,
      founderId: `FND-${String(legacyId).padStart(6, '0')}`,
      brandLineId: `BL-${String(legacyId).padStart(6, '0')}`,
      createdAt: createdAt || new Date().toISOString(),
      updatedAt: updatedAt || createdAt || new Date().toISOString(),
    };
  });
}

async function main() {
  const sqlPath = path.resolve(process.argv[2] || DEFAULT_SQL);
  const url = process.env.DATABASE_URL;

  if (!url) {
    console.error('Set DATABASE_URL (postgresql://...)');
    process.exit(1);
  }
  if (!fs.existsSync(sqlPath)) {
    console.error(`SQL file not found: ${sqlPath}`);
    process.exit(1);
  }

  const users = parseUsersFromSql(fs.readFileSync(sqlPath, 'utf8'));
  console.log(`Parsed ${users.length} users from ${sqlPath}`);

  const client = new Client({ connectionString: url });
  await client.connect();

  let imported = 0;
  let updated = 0;
  let skipped = 0;

  for (const u of users) {
    const existing = await client.query(
      'SELECT id, email, merge_id FROM users WHERE email = $1 OR merge_id = $2',
      [u.email, u.mergeId],
    );

    if (existing.rowCount > 0) {
      await client.query(
        `UPDATE users SET
          password_hash = $1,
          first_name = $2,
          last_name = $3,
          personal_id = $4,
          roles = $5::jsonb,
          kyc_status = $6,
          updated_at = $7::timestamptz
        WHERE email = $8`,
        [
          u.passwordHash,
          u.firstName,
          u.lastName,
          u.personalId,
          JSON.stringify(u.roles),
          u.kycStatus,
          u.updatedAt,
          u.email,
        ],
      );
      updated++;
      console.log(`Updated: ${u.email} (${u.mergeId})`);
      continue;
    }

    await client.query(
      `INSERT INTO users (
        email, phone, password_hash, first_name, last_name, personal_id,
        merge_id, founder_id, brand_line_id, roles, status, kyc_status,
        created_at, updated_at
      ) VALUES ($1, NULL, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, 'active', $10, $11::timestamptz, $12::timestamptz)`,
      [
        u.email,
        u.passwordHash,
        u.firstName,
        u.lastName,
        u.personalId,
        u.mergeId,
        u.founderId,
        u.brandLineId,
        JSON.stringify(u.roles),
        u.kycStatus,
        u.createdAt,
        u.updatedAt,
      ],
    );
    imported++;
    console.log(`Imported: ${u.email} (${u.mergeId}, roles: ${u.roles.join(',')})`);
  }

  await client.end();
  console.log(`\nDone. imported=${imported} updated=${updated} skipped=${skipped}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
