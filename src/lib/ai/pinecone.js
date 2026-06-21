/**
 * @module pinecone
 * @description Pinecone client integration for Nexus.
 *
 * The 'nexus' index uses Pinecone's integrated embedding model
 * (llama-text-embed-v2, 1024-d). We upsert raw text records and
 * Pinecone generates embeddings server-side — no local embedding needed.
 *
 * For search, we pass query text directly and Pinecone handles
 * embedding + similarity search in one call.
 */

import { Pinecone } from '@pinecone-database/pinecone';
import { chunkText } from './embeddings.js';

const apiKey = process.env.PINECONE_API_KEY;
const indexName = process.env.PINECONE_INDEX || 'nexus';

let pinecone = null;
let index = null;
let isConfigured = false;

if (apiKey && apiKey !== 'your-pinecone-api-key' && !apiKey.startsWith('your-')) {
  try {
    pinecone = new Pinecone({ apiKey });
    index = pinecone.index(indexName);
    isConfigured = true;
    console.log(`[pinecone] Client initialized (integrated embeddings). Index: ${indexName}`);
  } catch (err) {
    console.error('[pinecone] Client initialization failed:', err.message);
  }
} else {
  console.warn('[pinecone] PINECONE_API_KEY is not set or using placeholder. Fallback mode enabled.');
}

/**
 * Check if Pinecone is configured and ready.
 * @returns {boolean}
 */
export function isPineconeActive() {
  return isConfigured;
}

/* ─── Batch upsert helper ──────────────────────────────────────────── */

const BATCH_SIZE = 96; // Pinecone max per integrated-embed upsert is 96

/**
 * Batch-upsert records to Pinecone using integrated embeddings.
 * Each record has { id, text, metadata } — Pinecone embeds the text server-side.
 *
 * @param {Array<{id: string, text: string, metadata: Object}>} records
 * @returns {Promise<number>} Number of records upserted
 */
async function batchUpsertRecords(records) {
  if (!isConfigured || !index || records.length === 0) return 0;

  let upserted = 0;
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    if (batch.length === 0) continue;

    await index.upsertRecords({
      records: batch.map(r => ({
        _id: r.id,
        text: r.text,
        ...r.metadata,
      })),
    });
    upserted += batch.length;
  }
  return upserted;
}

/* ─── Transcript segment indexing ──────────────────────────────────── */

/**
 * Index a transcript segment to Pinecone.
 * If the text is long, it's chunked into overlapping windows and each
 * chunk is stored as a separate record.
 *
 * @param {Object} segment - The transcript segment object.
 * @param {string} segment.id - UUID of the transcript segment.
 * @param {string} segment.meetingId - UUID of the meeting.
 * @param {string} segment.text - Text content.
 * @param {string} segment.speaker - Speaker name.
 * @param {number} segment.start - Start time in seconds.
 * @param {number} segment.end - End time in seconds.
 * @param {string} [segment.capturedAt] - ISO timestamp.
 * @param {string} teamId - Team UUID for access filtering.
 * @param {string} [meetingTitle] - Meeting title for metadata context.
 * @returns {Promise<boolean>} Success status.
 */
export async function upsertTranscriptSegment(segment, teamId, meetingTitle = 'Meeting') {
  try {
    if (!segment || !segment.text || !segment.id) {
      console.warn('[pinecone] Skip indexing: segment missing required fields');
      return false;
    }

    if (!isConfigured || !index) {
      console.warn('[pinecone] Not configured — skipping upsert for segment:', segment.id);
      return false;
    }

    const baseMetadata = {
      meetingId: segment.meetingId,
      meetingTitle: meetingTitle,
      speaker: segment.speaker || 'Unknown',
      start: segment.start || 0,
      end: segment.end || 0,
      capturedAt: segment.capturedAt || new Date().toISOString(),
      teamId: teamId,
    };

    // Chunk long text into overlapping windows
    const chunks = chunkText(segment.text, 200, 40);
    if (chunks.length === 0) return false;

    const records = chunks.map((chunkText, i) => ({
      id: chunks.length === 1 ? segment.id : `${segment.id}_chunk_${i}`,
      text: chunkText,
      metadata: {
        ...baseMetadata,
        chunkIndex: i,
        totalChunks: chunks.length,
      },
    }));

    const count = await batchUpsertRecords(records);
    console.log(`[pinecone] Upserted ${count} record(s) for segment ${segment.id}`);
    return true;
  } catch (err) {
    console.error('[pinecone] Error upserting transcript segment:', err.message);
    return false;
  }
}

/* ─── Bulk seeding ─────────────────────────────────────────────────── */

/**
 * Seed Pinecone with transcript data in bulk.
 * Used by the seed script to index all mock meeting data.
 *
 * @param {Array<{meetingId: string, meetingTitle: string, teamId: string, segments: Array}>} meetingsData
 * @returns {Promise<number>} Total records upserted
 */
export async function seedTranscripts(meetingsData) {
  if (!isConfigured || !index) {
    console.error('[pinecone] Cannot seed — Pinecone is not configured');
    return 0;
  }

  let totalRecords = 0;

  for (const { meetingId, meetingTitle, teamId, segments } of meetingsData) {
    const records = [];

    for (const segment of segments) {
      const chunks = chunkText(segment.text, 200, 40);

      for (let i = 0; i < chunks.length; i++) {
        records.push({
          id: chunks.length === 1 ? segment.id : `${segment.id}_chunk_${i}`,
          text: chunks[i],
          metadata: {
            meetingId,
            meetingTitle,
            speaker: segment.speaker || 'Unknown',
            start: segment.start || 0,
            end: segment.end || 0,
            capturedAt: segment.capturedAt || new Date().toISOString(),
            teamId,
            chunkIndex: i,
            totalChunks: chunks.length,
          },
        });
      }
    }

    if (records.length > 0) {
      const count = await batchUpsertRecords(records);
      totalRecords += count;
      console.log(`[pinecone] Seeded meeting "${meetingTitle}" — ${count} records`);
    }
  }

  return totalRecords;
}

/* ─── Memory search ────────────────────────────────────────────────── */

/**
 * Search across meeting memory via Pinecone's integrated search.
 * Pinecone handles embedding the query text server-side.
 *
 * @param {string} queryText - Search text.
 * @param {string[]} teamIds - Scoped team IDs.
 * @param {number} [limit=10] - Number of results to return.
 * @returns {Promise<Array>} Results matching retriever format.
 */
export async function searchMemoryIndex(queryText, teamIds, limit = 10) {
  try {
    if (!queryText || !teamIds || teamIds.length === 0) {
      return [];
    }

    if (!isConfigured || !index) {
      console.warn('[pinecone] Not configured — returning empty search results');
      return [];
    }

    console.log(`[pinecone] Searching index '${indexName}' for: "${queryText.slice(0, 40)}..."`);

    const response = await index.searchRecords({
      query: {
        topK: limit,
        inputs: { text: queryText },
        filter: {
          teamId: { $in: teamIds },
        },
      },
    });

    if (response && response.result && response.result.hits) {
      return response.result.hits.map((hit) => {
        const fields = hit.fields || {};
        return {
          id: hit._id,
          source_type: 'transcript_segment',
          source_id: hit._id,
          content: fields.text || '',
          meeting_id: fields.meetingId || '',
          similarity: hit._score || 0,
          metadata: {
            meeting_title: fields.meetingTitle || 'Meeting',
            speaker: fields.speaker || 'Unknown',
            timestamp: fields.capturedAt || '',
            start: fields.start || 0,
            end: fields.end || 0,
          },
        };
      });
    }

    return [];
  } catch (err) {
    console.error('[pinecone] Search failed:', err.message);
    return [];
  }
}
