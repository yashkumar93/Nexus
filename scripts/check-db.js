/**
 * Verify the configured PostgreSQL connection and required schema.
 * Run with: npm run db:check
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    if (!process.env[key]) process.env[key] = trimmed.slice(separator + 1).trim();
  }
}

async function checkDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 3000,
    ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : false,
  });

  try {
    const { rows } = await pool.query(`
      SELECT
        current_database() AS database,
        current_user AS "user",
        to_regclass('public.meetings') IS NOT NULL AS schema_ready
    `);
    const status = rows[0];
    if (!status.schema_ready) {
      throw new Error('Connected, but the Nexus schema is missing. Run npm run db:migrate.');
    }
    console.log(`[db:check] Connected to ${status.database} as ${status.user}; schema is ready.`);
  } catch (error) {
    console.error(`[db:check] ${error.message}`);
    console.error('[db:check] Start it with npm run db:start, then run npm run db:check.');
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

checkDatabase();
