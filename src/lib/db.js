import pg from 'pg';

const { Pool } = pg;

/**
 * Postgres connection pool.
 * Reads DATABASE_URL from process.env. Falls back to individual PG* env vars.
 * @type {pg.Pool}
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: parseInt(process.env.PG_POOL_MAX ?? '20', 10),
  idleTimeoutMillis: parseInt(process.env.PG_IDLE_TIMEOUT ?? '30000', 10),
  connectionTimeoutMillis: parseInt(process.env.PG_CONNECT_TIMEOUT ?? '5000', 10),
  ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : false,
});

/* ---------- connection lifecycle logging ---------- */

pool.on('connect', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[db] new client connected to pool');
  }
});

pool.on('error', (err) => {
  console.error('[db] unexpected pool error:', err.message);
  // In production a monitoring layer should capture this; we avoid crashing
  // the process because the pool can recover from transient errors.
});

/* ---------- helpers ---------- */

/**
 * Execute a parameterised SQL query against the pool.
 *
 * @param {string}   text   - SQL statement (use $1, $2 … for params)
 * @param {any[]}    [params] - Bind parameters
 * @returns {Promise<pg.QueryResult>} The query result
 *
 * @example
 * const { rows } = await query('SELECT * FROM users WHERE id = $1', [userId]);
 */
export async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'production') {
      console.log('[db] query executed', {
        text: text.slice(0, 80),
        duration: `${duration}ms`,
        rows: result.rowCount,
      });
    }
    return result;
  } catch (err) {
    console.error('[db] query error', { text: text.slice(0, 80), error: err.message });
    throw err;
  }
}

/**
 * Acquire a dedicated client from the pool for transactions.
 *
 * Always release the client in a `finally` block.
 *
 * @returns {Promise<pg.PoolClient>}
 *
 * @example
 * const client = await getClient();
 * try {
 *   await client.query('BEGIN');
 *   await client.query('INSERT INTO …');
 *   await client.query('COMMIT');
 * } catch (e) {
 *   await client.query('ROLLBACK');
 *   throw e;
 * } finally {
 *   client.release();
 * }
 */
export async function getClient() {
  const client = await pool.connect();
  return client;
}

/**
 * Run a callback inside a database transaction.
 * Automatically handles BEGIN / COMMIT / ROLLBACK and client release.
 *
 * @template T
 * @param {(client: pg.PoolClient) => Promise<T>} callback
 * @returns {Promise<T>}
 */
export async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Test the database connection. Useful at startup to fail fast.
 *
 * @returns {Promise<boolean>} true if the connection succeeds
 */
export async function testConnection() {
  try {
    const { rows } = await pool.query('SELECT NOW() AS now');
    console.log('[db] connection verified at', rows[0].now);
    return true;
  } catch (err) {
    console.error('[db] connection test failed:', err.message);
    return false;
  }
}

/**
 * Gracefully shut down the pool. Call during process exit.
 *
 * @returns {Promise<void>}
 */
export async function closePool() {
  console.log('[db] draining pool …');
  await pool.end();
  console.log('[db] pool closed');
}

// Graceful shutdown on SIGTERM / SIGINT (idempotent — pool.end is safe to call twice)
const shutdown = () => {
  closePool().finally(() => process.exit(0));
};
process.once('SIGTERM', shutdown);
process.once('SIGINT', shutdown);

export { pool };
export default pool;
