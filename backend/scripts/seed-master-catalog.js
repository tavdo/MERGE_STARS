const { Client } = require('pg')
const crypto = require('crypto')

const houses = [
  ['jewelry', 'Jewelry Star Pendant'],
  ['watch', 'Merge Signature Watch'],
  ['fashion', 'House Fashion Capsule'],
  ['beauty', 'Beauty Ritual Set'],
  ['perfume', 'Signature Perfume Vessel'],
  ['luxury', 'Luxury Heritage Object'],
  ['automotive', 'Automotive Emblem'],
  ['moto', 'Moto Club Mark'],
  ['yacht', 'Marine House Mark'],
  ['travel', 'Travel Companion Piece'],
  ['sports', 'Sports House Medal'],
  ['football', 'Club Crest Collection'],
  ['gaming', 'Esports Trophy Mark'],
  ['toys', 'Collectible Figure'],
  ['kids', 'Kids House Charm'],
  ['home', 'Interior House Object'],
  ['architecture', 'Architecture Line Object'],
  ['office', 'Office Desk Piece'],
  ['garden', 'Garden House Accent'],
  ['pet', 'Pet House Tag'],
  ['corporate', 'Corporate Gift Object'],
  ['hotel', 'Hospitality House Amenity'],
  ['restaurant', 'Cafe House Piece'],
  ['technology', 'Tech House Object'],
  ['music', 'Artist House Mark'],
  ['film', 'Film House Object'],
  ['art', 'Art House Edition'],
  ['events', 'Wedding House Object'],
  ['gifts', 'Gift House Souvenir'],
  ['creator', 'Creator House Piece'],
]

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()
  const admin = await client.query(
    `select id from users where roles::text ilike '%admin%' order by created_at asc limit 1`,
  )
  if (!admin.rows[0]) throw new Error('no admin user')
  const userId = admin.rows[0].id
  let col = await client.query(`select id from catalog_collections where is_master = true limit 1`)
  let collectionId
  if (col.rows[0]) {
    collectionId = col.rows[0].id
  } else {
    const slug = 'merge-master-catalog-' + crypto.randomBytes(3).toString('hex')
    const ins = await client.query(
      `insert into catalog_collections (id, user_id, title, description, slug, visibility, category, is_master, created_at, updated_at)
       values (gen_random_uuid(), $1, 'MERGE Master Catalog',
         'Central MERGE product catalog. One product, many Brand Rooms.',
         $2, 'PUBLIC', 'more', true, now(), now())
       returning id`,
      [userId, slug],
    )
    collectionId = ins.rows[0].id
  }
  let added = 0
  for (const [house, title] of houses) {
    const exists = await client.query(
      `select 1 from catalog_items where ownership = 'MASTER_CATALOG' and house = $1 limit 1`,
      [house],
    )
    if (exists.rows[0]) continue
    await client.query(
      `insert into catalog_items
        (id, collection_id, title, description, metal_type, status, house, lifecycle, ownership, created_at, updated_at)
       values
        (gen_random_uuid(), $1, $2, $3, null, 'ACTIVE', $4, 'ACTIVE', 'MASTER_CATALOG', now(), now())`,
      [
        collectionId,
        title,
        `Master Catalog starter product for the ${house} house. Select it into any Brand Room — the product is not copied.`,
        house,
      ],
    )
    added += 1
  }
  const total = await client.query(
    `select count(*)::int as n from catalog_items where ownership = 'MASTER_CATALOG'`,
  )
  console.log(JSON.stringify({ userId, collectionId, added, total: total.rows[0].n }))
  await client.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
