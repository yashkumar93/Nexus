/**
 * @module embeddings
 * @description Embedding generation and text chunking utilities.
 *
 * For the hackathon we use a deterministic character-level hashing approach
 * to produce 384-dimensional vectors from text content.  This avoids an
 * external embedding API while still providing meaningful semantic grouping
 * (texts with similar character n-gram distributions will have similar vectors).
 *
 * Vectors are stored in Pinecone for similarity search.
 */

export const EMBEDDING_DIM = 384;

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

/* ─── Text chunking ────────────────────────────────────────────────── */

/**
 * Split text into overlapping chunks for embedding.
 *
 * @param {string}  text      - Input text to chunk
 * @param {number}  [maxWords=200] - Maximum words per chunk
 * @param {number}  [overlap=40]   - Number of overlapping words between chunks
 * @returns {string[]} Array of text chunks
 */
export function chunkText(text, maxWords = 200, overlap = 40) {
  if (!text || text.trim().length === 0) return [];

  const words = text.split(/\s+/).filter(Boolean);

  // If text is short enough, return as single chunk
  if (words.length <= maxWords) {
    return [words.join(' ')];
  }

  const chunks = [];
  let start = 0;

  while (start < words.length) {
    const end = Math.min(start + maxWords, words.length);
    chunks.push(words.slice(start, end).join(' '));

    if (end >= words.length) break;
    start += maxWords - overlap;
  }

  return chunks;
}
