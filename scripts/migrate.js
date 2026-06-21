/**
 * Nexus — Database Migration Script
 * Run with: node scripts/migrate.js
 * Requires DATABASE_URL in .env.local
 */

const fs = require('fs');
const path = require('path');

// Manually load .env.local
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

const { Pool } = require('pg');

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

console.log('[migrate] Connecting with DATABASE_URL:', process.env.DATABASE_URL);

async function migrate() {
  const client = await pool.connect();
  try {
    const existingSchema = await client.query(
      "SELECT to_regclass('public.meetings') AS meetings"
    );
    if (existingSchema.rows[0].meetings) {
      console.log('[migrate] Nexus schema already exists; nothing to do.');
      return;
    }

    console.log('[migrate] Reading schema.sql...');
    const schemaPath = path.join(__dirname, '../db/schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('[migrate] Executing schema...');
    await client.query(sql);
    console.log('[migrate] Migration completed successfully.');
  } catch (err) {
    console.error('[migrate] Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
