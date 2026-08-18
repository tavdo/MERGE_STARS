/* One-off deploy check: earnings wallet column + latest migrations. */
const { Client } = require('pg');

const client = new Client({ connectionString: process.env.DATABASE_URL });

client
  .connect()
  .then(() =>
    client.query(
      `select column_name from information_schema.columns
       where table_name = 'users' and column_name = 'wallet_activated_at'`,
    ),
  )
  .then((res) => {
    console.log('COLUMN:', JSON.stringify(res.rows));
    return client.query('select name from migrations order by id desc limit 3');
  })
  .then((res) => {
    console.log('MIGRATIONS:', JSON.stringify(res.rows));
    return client.end();
  })
  .catch((err) => {
    console.error('FAILED:', err.message);
    process.exit(1);
  });
