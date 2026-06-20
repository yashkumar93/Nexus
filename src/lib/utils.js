import { v4 as uuidv4 } from 'uuid';

/* ================================================================
   ID generation
   ================================================================ */

/**
 * Generate a random UUID v4.
 *
 * @returns {string} e.g. `"9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"`
 */
export function generateId() {
  return uuidv4();
}

/* ================================================================
   Date / time
   ================================================================ */

/**
 * Format a timestamp into a human-readable string.
 *
 * Accepts anything `new Date()` understands — ISO strings, epoch‑ms, Date objects.
 * Returns `"Invalid date"` for unparseable input rather than throwing.
 *
 * @param {string | number | Date} ts
 * @returns {string} e.g. `"Jun 20, 2026, 2:33 PM"`
 */
export function formatTimestamp(ts) {
  if (ts === null || ts === undefined) return 'Invalid date';
  const date = ts instanceof Date ? ts : new Date(ts);
  if (Number.isNaN(date.getTime())) return 'Invalid date';

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

/* ================================================================
   Text helpers
   ================================================================ */

/**
 * Truncate text to `maxLen` characters, appending "…" when truncated.
 * Returns the original string if it's already within the limit.
 *
 * @param {string} text
 * @param {number} [maxLen=100]
 * @returns {string}
 */
export function truncateText(text, maxLen = 100) {
  if (typeof text !== 'string') return '';
  if (text.length <= maxLen) return text;
  // Avoid cutting in the middle of a word when possible
  const trimmed = text.slice(0, maxLen);
  const lastSpace = trimmed.lastIndexOf(' ');
  const breakpoint = lastSpace > maxLen * 0.6 ? lastSpace : maxLen;
  return trimmed.slice(0, breakpoint).trimEnd() + '…';
}

/* ---------- stop words for keyword extraction ---------- */

const STOP_WORDS = new Set([
  'a','about','above','after','again','against','all','am','an','and','any',
  'are','aren\'t','as','at','be','because','been','before','being','below',
  'between','both','but','by','can','can\'t','cannot','could','couldn\'t',
  'did','didn\'t','do','does','doesn\'t','doing','don\'t','down','during',
  'each','few','for','from','further','get','got','had','hadn\'t','has',
  'hasn\'t','have','haven\'t','having','he','he\'d','he\'ll','he\'s','her',
  'here','here\'s','hers','herself','him','himself','his','how','how\'s',
  'i','i\'d','i\'ll','i\'m','i\'ve','if','in','into','is','isn\'t','it',
  'it\'s','its','itself','just','let','let\'s','like','ll','me','might',
  'more','most','mustn\'t','my','myself','no','nor','not','of','off','on',
  'once','only','or','other','ought','our','ours','ourselves','out','over',
  'own','re','s','same','say','shan\'t','she','she\'d','she\'ll','she\'s',
  'should','shouldn\'t','so','some','such','t','than','that','that\'s','the',
  'their','theirs','them','themselves','then','there','there\'s','these',
  'they','they\'d','they\'ll','they\'re','they\'ve','this','those','through',
  'to','too','under','until','up','ve','very','was','wasn\'t','we','we\'d',
  'we\'ll','we\'re','we\'ve','were','weren\'t','what','what\'s','when',
  'when\'s','where','where\'s','which','while','who','who\'s','whom','why',
  'why\'s','will','with','won\'t','would','wouldn\'t','you','you\'d',
  'you\'ll','you\'re','you\'ve','your','yours','yourself','yourselves',
  'also','already','still','really','well','much','many','even','back',
  'going','make','way','know','think','good','new','now','old','see',
  'time','want','come','use','used','using',
]);

/**
 * Extract significant keywords from a block of text.
 *
 * Removes stop words, short tokens (≤ 2 chars), and numbers.
 * Returns unique keywords sorted by frequency (most frequent first).
 *
 * @param {string} text
 * @returns {string[]}
 */
export function extractKeywords(text) {
  if (typeof text !== 'string' || text.length === 0) return [];

  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t) && !/^\d+$/.test(t));

  // Count frequency
  /** @type {Map<string, number>} */
  const freq = new Map();
  for (const token of tokens) {
    freq.set(token, (freq.get(token) ?? 0) + 1);
  }

  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word);
}

/* ================================================================
   Vector math
   ================================================================ */

/**
 * Compute the cosine similarity between two numeric vectors.
 *
 * Returns `0` for zero-length or mismatched vectors rather than `NaN`.
 *
 * @param {number[]} vecA
 * @param {number[]} vecB
 * @returns {number} Similarity in the range [-1, 1]
 */
export function cosineSimilarity(vecA, vecB) {
  if (
    !Array.isArray(vecA) ||
    !Array.isArray(vecB) ||
    vecA.length === 0 ||
    vecA.length !== vecB.length
  ) {
    return 0;
  }

  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    magA += vecA[i] * vecA[i];
    magB += vecB[i] * vecB[i];
  }

  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

/* ================================================================
   Function helpers
   ================================================================ */

/**
 * Return a debounced version of `fn` that delays invocation until
 * `delayMs` milliseconds have passed since the last call.
 *
 * The debounced function exposes a `.cancel()` method.
 *
 * @template {(...args: any[]) => any} T
 * @param {T}      fn
 * @param {number} delayMs
 * @returns {T & { cancel: () => void }}
 */
export function debounce(fn, delayMs) {
  /** @type {ReturnType<typeof setTimeout> | null} */
  let timer = null;

  /** @type {any} */
  const debounced = (...args) => {
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, delayMs);
  };

  debounced.cancel = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  return debounced;
}

/* ================================================================
   URL / slug
   ================================================================ */

/**
 * Convert arbitrary text into a URL-safe slug.
 *
 * @param {string} text
 * @returns {string} e.g. `"my-meeting-title"`
 */
export function slugify(text) {
  if (typeof text !== 'string') return '';
  return text
    .toString()
    .normalize('NFD')                   // decompose accented chars
    .replace(/[\u0300-\u036f]/g, '')    // strip diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')      // remove non-alphanumeric
    .replace(/[\s_]+/g, '-')           // spaces / underscores → hyphens
    .replace(/-+/g, '-')               // collapse repeated hyphens
    .replace(/^-|-$/g, '');            // trim leading / trailing hyphens
}
