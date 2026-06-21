/**
 * In-memory TTL cache for hot meeting data.
 *
 * Stores active meeting transcripts, recently extracted entities,
 * and graph nodes with automatic time-based expiration.
 */

/** @type {number} Default TTL — 5 minutes */
const DEFAULT_TTL_MS = 5 * 60 * 1000;

/** @type {number} Sweep interval — runs every 60 s */
const SWEEP_INTERVAL_MS = 60 * 1000;

/* ---------- CacheEntry ---------- */

/**
 * @typedef {Object} CacheEntry
 * @property {any}    value     - Stored value
 * @property {number} expiresAt - Unix‑ms timestamp when the entry expires
 */

/* ---------- MemoryCache ---------- */

class MemoryCache {
  constructor() {
    /** @type {Map<string, CacheEntry>} */
    this._store = new Map();

    /** @type {Map<string, Promise<any>>} In-flight fetch deduplication */
    this._pending = new Map();

    // Periodic sweep of expired keys
    this._sweepTimer = setInterval(() => this._sweep(), SWEEP_INTERVAL_MS);

    // Allow the process to exit even if the timer is still running
    if (this._sweepTimer.unref) {
      this._sweepTimer.unref();
    }
  }

  /* ---- core API ---- */

  /**
   * Retrieve a value by key. Returns `undefined` if missing or expired.
   *
   * @param {string} key
   * @returns {any | undefined}
   */
  get(key) {
    const entry = this._store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this._store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  /**
   * Store a value with an optional TTL.
   *
   * @param {string} key
   * @param {any}    value
   * @param {number} [ttlMs=DEFAULT_TTL_MS] - Time-to-live in milliseconds
   */
  set(key, value, ttlMs = DEFAULT_TTL_MS) {
    this._store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  /**
   * Delete a key from the cache.
   *
   * @param {string} key
   * @returns {boolean} true if the key existed
   */
  delete(key) {
    this._pending.delete(key);
    return this._store.delete(key);
  }

  /**
   * Get a value from the cache, or fetch it if missing / expired.
   *
   * Concurrent calls for the same key while a fetch is in-flight are
   * deduplicated — only one `fetchFn` execution runs at a time per key.
   *
   * @template T
   * @param {string}              key
   * @param {() => Promise<T>}    fetchFn - Async factory invoked on cache miss
   * @param {number}              [ttlMs=DEFAULT_TTL_MS]
   * @returns {Promise<T>}
   */
  async getOrFetch(key, fetchFn, ttlMs = DEFAULT_TTL_MS) {
    const cached = this.get(key);
    if (cached !== undefined) return cached;

    // Deduplicate in-flight fetches
    if (this._pending.has(key)) {
      return this._pending.get(key);
    }

    const promise = fetchFn()
      .then((value) => {
        this.set(key, value, ttlMs);
        return value;
      })
      .finally(() => {
        this._pending.delete(key);
      });

    this._pending.set(key, promise);
    return promise;
  }

  /**
   * Check whether a non-expired entry exists for the key.
   *
   * @param {string} key
   * @returns {boolean}
   */
  has(key) {
    return this.get(key) !== undefined;
  }

  /**
   * Return the number of entries (including not-yet-swept expired ones).
   *
   * @returns {number}
   */
  get size() {
    return this._store.size;
  }

  /**
   * Remove all entries.
   */
  clear() {
    this._store.clear();
    this._pending.clear();
  }

  /* ---- meeting-scoped helpers ---- */

  /**
   * Return a lightweight scoped interface whose keys are automatically
   * namespaced under `meeting:<meetingId>:`.
   *
   * @param {string} meetingId
   * @returns {ScopedCache}
   */
  getMeetingCache(meetingId) {
    return new ScopedCache(this, `meeting:${meetingId}`);
  }

  /**
   * Evict every key that begins with `meeting:<meetingId>:`.
   * Useful when a meeting ends.
   *
   * @param {string} meetingId
   * @returns {number} Count of keys removed
   */
  clearMeeting(meetingId) {
    const prefix = `meeting:${meetingId}:`;
    let removed = 0;
    for (const key of this._store.keys()) {
      if (key.startsWith(prefix)) {
        this._store.delete(key);
        removed++;
      }
    }
    return removed;
  }

  /* ---- internal ---- */

  /** Remove all expired entries. */
  _sweep() {
    const now = Date.now();
    for (const [key, entry] of this._store) {
      if (now > entry.expiresAt) {
        this._store.delete(key);
      }
    }
  }

  /** Stop the sweep timer (for tests / graceful shutdown). */
  destroy() {
    clearInterval(this._sweepTimer);
    this.clear();
  }
}

/* ---------- ScopedCache ---------- */

/**
 * A thin wrapper that prefixes every key with a namespace.
 */
class ScopedCache {
  /**
   * @param {MemoryCache} parent
   * @param {string}      namespace
   */
  constructor(parent, namespace) {
    this._parent = parent;
    this._ns = namespace;
  }

  /** @private */
  _key(key) {
    return `${this._ns}:${key}`;
  }

  /** @param {string} key */
  get(key) {
    return this._parent.get(this._key(key));
  }

  /**
   * @param {string} key
   * @param {any}    value
   * @param {number} [ttlMs]
   */
  set(key, value, ttlMs) {
    this._parent.set(this._key(key), value, ttlMs);
  }

  /** @param {string} key */
  delete(key) {
    return this._parent.delete(this._key(key));
  }

  /**
   * @template T
   * @param {string}           key
   * @param {() => Promise<T>} fetchFn
   * @param {number}           [ttlMs]
   * @returns {Promise<T>}
   */
  getOrFetch(key, fetchFn, ttlMs) {
    return this._parent.getOrFetch(this._key(key), fetchFn, ttlMs);
  }

  /** @param {string} key */
  has(key) {
    return this._parent.has(this._key(key));
  }
}

/* ---------- singleton ---------- */

/** @type {MemoryCache} */
const cache = globalThis.__nexusCache ?? new MemoryCache();

// Preserve the singleton across HMR in development
if (process.env.NODE_ENV !== 'production') {
  globalThis.__nexusCache = cache;
}

export { MemoryCache, ScopedCache };
export default cache;
