const { Client } = require('pg')
;(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL })
  await c.connect()
  const r = await c.query(
    `update catalog_items set lifecycle = 'DRAFT' where ownership = 'MASTER_CATALOG'`,
  )
  console.log('drafted', r.rowCount)
  await c.end()
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
