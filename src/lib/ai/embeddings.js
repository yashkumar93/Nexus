/**
 * @module embeddings
 * @description Embedding generation, storage, and similarity search.
 *
 * For the hackathon we use a deterministic character-level hashing approach
 * to produce 384-dimensional vectors from text content.  This avoids an
 * external embedding API while still providing meaningful semantic grouping
 * (texts with similar character n-gram distributions will have similar vectors).
 *
 * Vectors are stored in the `embeddings` table via pgvector for cosine
 * similarity search, pre-filtered by team_ids.
 */

import pool, { query } from '../db.js';

const EMBEDDING_DIM = 384;

/* ─── Deterministic embedding generation ───────────────────────────── */

/**
 * Generate a 384-dimensional embedding vector from text using
 * character-level n-gram hashing.
 *
 * Algorithm:
 * 1. Normalise text to lowercase, collapse whitespace.
 * 2. Extract character bigrams and trigrams.
 * 3. Hash each n-gram into a bucket (0..383) and accumulate weights.
 * 4. Apply L2 normalisation so cosine similarity works correctly.
 *
 * @param {string} text - Input text to embed.
 * @returns {Promise<Float32Array>} 384-d unit vector.
 */
export async function generateEmbedding(text) {
  const vec = new Float32Array(EMBEDDING_DIM);

  if (!text || text.trim().length === 0) {
    return vec; // zero vector for empty input
  }

  const normalised = text.toLowerCase().replace(/\s+/g, ' ').trim();

  // Seed constants for FNV-1a inspired hashing.
  const FNV_OFFSET = 2166136261;
  const FNV_PRIME = 16777619;

  /**
   * Hash a short string into a uint32.
   * @param {string} s
   * @returns {number}
   */
  function hashStr(s) {
    let h = FNV_OFFSET;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, FNV_PRIME) >>> 0;
    }
    return h;
  }

  // Bigrams (weight 1.0)
  for (let i = 0; i < normalised.length - 1; i++) {
    const gram = normalised.slice(i, i + 2);
    const h = hashStr(gram);
    const bucket = h % EMBEDDING_DIM;
    // Use a second hash to decide sign (+1 / -1) for more even distribution.
    const sign = (hashStr(gram + '_s') & 1) === 0 ? 1 : -1;
    vec[bucket] += sign * 1.0;
  }

  // Trigrams (weight 1.5 — captures more semantic signal)
  for (let i = 0; i < normalised.length - 2; i++) {
    const gram = normalised.slice(i, i + 3);
    const h = hashStr(gram);
    const bucket = h % EMBEDDING_DIM;
    const sign = (hashStr(gram + '_s') & 1) === 0 ? 1 : -1;
    vec[bucket] += sign * 1.5;
  }

  // Word-level unigrams (weight 2.0 — captures topic identity)
  const words = normalised.split(/\s+/).filter((w) => w.length > 2);
  for (const word of words) {
    const h = hashStr(word);
    const bucket = h % EMBEDDING_DIM;
    const sign = (hashStr(word + '_s') & 1) === 0 ? 1 : -1;
    vec[bucket] += sign * 2.0;
  }

  // L2 normalisation
  let norm = 0;
  for (let i = 0; i < EMBEDDING_DIM; i++) {
    norm += vec[i] * vec[i];
  }
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < EMBEDDING_DIM; i++) {
      vec[i] /= norm;
    }
  }

  return vec;
}

/* ─── Storage ──────────────────────────────────────────────────────── */

/**
 * Format a Float32Array as a pgvector literal `[0.1,0.2,...]`.
 * @param {Float32Array} vec
 * @returns {string}
 */
function toPgVector(vec) {
  return `[${Array.from(vec).join(',')}]`;
}

/**
 * Store an embedding in the `embeddings` table.
 *
 * @param {string} sourceType  - E.g. "transcript_chunk", "decision", "entity"
 * @param {string} sourceId    - UUID of the source record
 * @param {string} content     - Original text that was embedded
 * @param {string} teamId      - Team UUID for access filtering
 * @param {string} meetingId   - Meeting UUID this content originated from
 * @param {Object} [metadata]  - Arbitrary JSON metadata (speaker, timestamp…)
 * @returns {Promise<string>} The inserted embedding row's id.
 */
export async function storeEmbedding(sourceType, sourceId, content, teamId, meetingId, metadata = {}) {
  try {
    const embedding = await generateEmbedding(content);
    const pgVec = toPgVector(embedding);

    const result = await query(
      `INSERT INTO embeddings (source_type, source_id, content, vector, team_id, meeting_id, metadata)
       VALUES ($1, $2, $3, $4::vector, $5, $6, $7)
       RETURNING id`,
      [sourceType, sourceId, content, pgVec, teamId, meetingId, JSON.stringify(metadata)]
    );

    return result.rows[0].id;
  } catch (err) {
    console.error('[embeddings] Failed to store embedding:', err.message);
    throw err;
  }
}

/* ─── Similarity search ────────────────────────────────────────────── */

/**
 * Search for semantically similar content using cosine distance.
 *
 * @param {string}   queryText - Natural-language query
 * @param {string[]} teamIds   - Team UUIDs to scope the search
 * @param {number}   [limit=10] - Max results to return
 * @returns {Promise<Array<{id: string, source_type: string, source_id: string,
 *   content: string, meeting_id: string, metadata: Object, similarity: number}>>}
 */
export async function searchSimilar(queryText, teamIds, limit = 10) {
  try {
    if (!queryText || !teamIds?.length) {
      return [];
    }

    const queryEmbedding = await generateEmbedding(queryText);
    const pgVec = toPgVector(queryEmbedding);

    // Use pgvector's cosine distance operator (<=>). Convert distance to
    // similarity (1 - distance) so higher = more similar.
    const result = await query(
      `SELECT
         id,
         source_type,
         source_id,
         content,
         meeting_id,
         metadata,
         1 - (vector <=> $1::vector) AS similarity
       FROM embeddings
       WHERE team_id = ANY($2::uuid[])
       ORDER BY vector <=> $1::vector
       LIMIT $3`,
      [pgVec, teamIds, limit]
    );

    return result.rows.map((row) => ({
      ...row,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
      similarity: parseFloat(row.similarity),
    }));
  } catch (err) {
    console.error('[embeddings] Similarity search failed:', err.message);
    return [];
  }
}
