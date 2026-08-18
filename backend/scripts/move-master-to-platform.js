const { Client } = require('pg')
const bcrypt = require('bcrypt')
const crypto = require('crypto')

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()
  const hash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10)

  let owner = await client.query(
    `select id from users where merge_id = 'MERGE-PLATFORM' or email = 'platform-catalog@mergestars.com' limit 1`,
  )
  let ownerId
  if (owner.rows[0]) {
    ownerId = owner.rows[0].id
    await client.query(
      `update users
       set first_name = 'MERGE', last_name = 'STARS', status = 'system',
           roles = '["platform"]'::jsonb, brand_line_id = 'MERGE-STARS',
           kyc_status = 'verified'
       where id = $1`,
      [ownerId],
    )
  } else {
    const ins = await client.query(
      `insert into users (
         email, phone, password_hash, first_name, last_name, personal_id,
         merge_id, founder_id, brand_line_id, roles, status, kyc_status
       ) values (
         'platform-catalog@mergestars.com', null, $1, 'MERGE', 'STARS', null,
         'MERGE-PLATFORM', null, 'MERGE-STARS', '["platform"]'::jsonb, 'system', 'verified'
       ) returning id`,
      [hash],
    )
    ownerId = ins.rows[0].id
  }

  const moved = await client.query(
    `update catalog_collections
     set user_id = $1, title = 'MERGE Master Catalog',
         description = 'Official MERGE STARS catalog. One product, many Brand Rooms.'
     where is_master = true
     returning id`,
    [ownerId],
  )

  await client.query(
    `update catalog_items
     set ownership = 'MASTER_CATALOG'
     where collection_id in (select id from catalog_collections where is_master = true)`,
  )

  console.log(JSON.stringify({ ownerId, collections: moved.rows.length }))
  await client.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
