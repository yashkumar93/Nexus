const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_dr9yFaObE3CM@ep-young-thunder-atjzahlz-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});
async function test() {
  console.log('Connecting...');
  try {
    const res = await pool.query('SELECT 1 + 1 AS result');
    console.log('Success! Result:', res.rows[0].result);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}
test();
