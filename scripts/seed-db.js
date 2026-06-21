/**
 * Run db/seed.sql against Neon Database
 */
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Manually load .env.local (overwrite mode)
try {
  const envPath = path.join(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const index = trimmed.indexOf('=');
      if (index === -1) return;
      const key = trimmed.slice(0, index).trim();
      const val = trimmed.slice(index + 1).trim();
      process.env[key] = val;
    });
  }
} catch (e) {
  console.warn('Could not manually load .env.local file:', e.message);
}

console.log('[seed-db] Connecting with DATABASE_URL:', process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function seed() {
  const client = await pool.connect();
  try {
    const seedPath = path.join(__dirname, '../db/seed.sql');
    const sql = fs.readFileSync(seedPath, 'utf8');

    console.log('[seed-db] Running seed.sql...');
    await client.query(sql);
    console.log('[seed-db] Seeding completed successfully.');
  } catch (error) {
    console.error('[seed-db] Seeding failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
