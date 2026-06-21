#!/usr/bin/env node

/**
 * Seed Pinecone with mock meeting transcript data.
 *
 * Uses Pinecone's integrated embedding model (llama-text-embed-v2)
 * so we pass raw text and Pinecone generates embeddings server-side.
 *
 * Usage:
 *   npm run seed:pinecone
 *
 * Requires PINECONE_API_KEY and PINECONE_INDEX in .env.local
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { Pinecone } from '@pinecone-database/pinecone';
import { chunkText } from '../src/lib/ai/embeddings.js';

const apiKey = process.env.PINECONE_API_KEY;
const indexName = process.env.PINECONE_INDEX || 'nexus';

if (!apiKey || apiKey.startsWith('your-')) {
  console.error('[seed] PINECONE_API_KEY not configured. Set it in .env.local');
  process.exit(1);
}

const DEFAULT_TEAM_ID = 'e0c6600c-b26a-4d7a-8f12-0fbc185906ef';
const BATCH_SIZE = 96; // Max records per upsertRecords call for integrated models

/* ─── Mock data ────────────────────────────────────────────────────── */

const MEETINGS = [
  {
    meetingId: 'meeting-001',
    meetingTitle: 'Q2 Planning Session',
    teamId: DEFAULT_TEAM_ID,
    segments: [
      { id: 'seg-001-01', speaker: 'Priya Patel', text: 'Let\'s start with the Q2 planning. We need to finalize the payments vendor decision today. Devon, can you walk us through the options?', start: 0, end: 12, capturedAt: '2026-06-18T10:00:00Z' },
      { id: 'seg-001-02', speaker: 'Devon Chen', text: 'Sure. We evaluated three vendors — Vendor A, Vendor B, and Stripe Connect. Vendor A has the best scale pricing at our projected volume. Their compliance package was already approved in the May 29 finance review.', start: 12, end: 28, capturedAt: '2026-06-18T10:01:00Z' },
      { id: 'seg-001-03', speaker: 'Maya Singh', text: 'What about Vendor B? I thought their API was cleaner and the integration timeline was shorter.', start: 28, end: 35, capturedAt: '2026-06-18T10:02:00Z' },
      { id: 'seg-001-04', speaker: 'Devon Chen', text: 'Vendor B\'s API is indeed cleaner, but their compliance certification is still pending. We can\'t go live without SOC 2 Type II, and they said it could take another 6-8 weeks.', start: 35, end: 50, capturedAt: '2026-06-18T10:03:00Z' },
      { id: 'seg-001-05', speaker: 'Priya Patel', text: 'That\'s a dealbreaker for our timeline. We need to launch the payment integration by end of July. Let\'s go with Vendor A for now and revisit Vendor B once they have certification.', start: 50, end: 65, capturedAt: '2026-06-18T10:04:00Z' },
      { id: 'seg-001-06', speaker: 'Alex Rivera', text: 'Agreed. I\'ll update the project brief with Vendor A\'s contract thresholds. Devon, can you attach the pricing tier breakdown to the launch brief?', start: 65, end: 78, capturedAt: '2026-06-18T10:05:00Z' },
      { id: 'seg-001-07', speaker: 'Devon Chen', text: 'Will do. I\'ll have that attached by end of day tomorrow. I\'ll also set up a sandbox environment for the engineering team to start the integration work.', start: 78, end: 90, capturedAt: '2026-06-18T10:06:00Z' },
      { id: 'seg-001-08', speaker: 'Maya Singh', text: 'I\'ll verify whether Vendor B has the required compliance certification timeline. If they can expedite, we might want to keep them as a backup option.', start: 90, end: 105, capturedAt: '2026-06-18T10:07:00Z' },
      { id: 'seg-001-09', speaker: 'Priya Patel', text: 'Good plan. Now for the roadmap goals — we need to prioritize the customer onboarding flow redesign and the analytics dashboard. Both are critical for Q3.', start: 105, end: 120, capturedAt: '2026-06-18T10:08:00Z' },
      { id: 'seg-001-10', speaker: 'Sam Torres', text: 'The analytics dashboard has dependencies on the data pipeline refactor. I\'d suggest we prioritize onboarding first since it directly impacts conversion rates.', start: 120, end: 135, capturedAt: '2026-06-18T10:09:00Z' },
      { id: 'seg-001-11', speaker: 'Priya Patel', text: 'Agreed. Let\'s set onboarding redesign as P0 and analytics dashboard as P1. Devon, make sure the engineering sprint plan reflects this priority order.', start: 135, end: 150, capturedAt: '2026-06-18T10:10:00Z' },
    ],
  },
  {
    meetingId: 'meeting-002',
    meetingTitle: 'Tech Stack Review',
    teamId: DEFAULT_TEAM_ID,
    segments: [
      { id: 'seg-002-01', speaker: 'Devon Chen', text: 'Today we\'re reviewing our tech stack decisions. The main question is whether to stick with Postgres as our system of record or explore MongoDB for certain workloads.', start: 0, end: 15, capturedAt: '2026-06-15T14:00:00Z' },
      { id: 'seg-002-02', speaker: 'Alex Rivera', text: 'I\'ve been running benchmarks. Postgres with proper indexing handles our current query patterns well. The knowledge graph queries are complex but pgvector gives us the vector search capability we need.', start: 15, end: 30, capturedAt: '2026-06-15T14:01:00Z' },
      { id: 'seg-002-03', speaker: 'Sam Torres', text: 'What about the real-time transcript storage? We\'re getting bursts of 50-100 segments per minute during active meetings. Is Postgres handling that write load?', start: 30, end: 42, capturedAt: '2026-06-15T14:02:00Z' },
      { id: 'seg-002-04', speaker: 'Alex Rivera', text: 'The write load is fine with connection pooling. We\'re using PgBouncer with a pool of 20 connections. Average insert latency is under 5ms.', start: 42, end: 55, capturedAt: '2026-06-15T14:03:00Z' },
      { id: 'seg-002-05', speaker: 'Devon Chen', text: 'I looked into MongoDB as well. The document model would simplify transcript storage since each meeting\'s transcripts are naturally a document. But it means maintaining two databases.', start: 55, end: 70, capturedAt: '2026-06-15T14:04:00Z' },
      { id: 'seg-002-06', speaker: 'Priya Patel', text: 'Two databases means double the operational complexity. Unless there\'s a compelling performance reason, I\'d rather we keep everything in Postgres and use JSONB for flexible schemas.', start: 70, end: 85, capturedAt: '2026-06-15T14:05:00Z' },
      { id: 'seg-002-07', speaker: 'Alex Rivera', text: 'Agreed. Let\'s confirm Postgres as our system of record. For vector search specifically, we\'re also evaluating Pinecone as a dedicated vector database for the memory retrieval pipeline.', start: 85, end: 100, capturedAt: '2026-06-15T14:06:00Z' },
      { id: 'seg-002-08', speaker: 'Devon Chen', text: 'Pinecone makes sense for the embedding search. It\'s purpose-built for that workload. We can keep the relational data in Postgres and vector search in Pinecone. Best of both worlds.', start: 100, end: 115, capturedAt: '2026-06-15T14:07:00Z' },
      { id: 'seg-002-09', speaker: 'Priya Patel', text: 'Good. Decision made — Postgres for relational data, Pinecone for vector search. Alex, please document this in our architecture decision records.', start: 115, end: 125, capturedAt: '2026-06-15T14:08:00Z' },
    ],
  },
  {
    meetingId: 'meeting-003',
    meetingTitle: 'Customer Feedback Sync',
    teamId: DEFAULT_TEAM_ID,
    segments: [
      { id: 'seg-003-01', speaker: 'Maya Singh', text: 'I want to share the latest customer feedback from the checkout flow survey. We received 342 responses and the results are quite revealing.', start: 0, end: 12, capturedAt: '2026-06-12T11:00:00Z' },
      { id: 'seg-003-02', speaker: 'Priya Patel', text: 'Great. What are the top pain points?', start: 12, end: 16, capturedAt: '2026-06-12T11:01:00Z' },
      { id: 'seg-003-03', speaker: 'Maya Singh', text: 'The number one issue is the multi-step checkout — 67% of respondents said it takes too long. The second issue is the lack of saved payment methods, mentioned by 45% of users.', start: 16, end: 30, capturedAt: '2026-06-12T11:02:00Z' },
      { id: 'seg-003-04', speaker: 'Sam Torres', text: 'That aligns with our analytics data. We see a 34% drop-off between the cart page and payment confirmation. Most of that happens at the address entry step.', start: 30, end: 42, capturedAt: '2026-06-12T11:03:00Z' },
      { id: 'seg-003-05', speaker: 'Devon Chen', text: 'We should consolidate the checkout into a single-page experience. There are good patterns from Shopify and Stripe Checkout that we can reference.', start: 42, end: 55, capturedAt: '2026-06-12T11:04:00Z' },
      { id: 'seg-003-06', speaker: 'Maya Singh', text: 'I also want to flag the onboarding friction. New users are taking an average of 4.2 minutes to complete setup, and 28% abandon before finishing. We need to reduce this to under 2 minutes.', start: 55, end: 70, capturedAt: '2026-06-12T11:05:00Z' },
      { id: 'seg-003-07', speaker: 'Priya Patel', text: 'Let\'s make the single-page checkout and onboarding simplification our top priorities. Devon, can the team start on the checkout redesign next sprint?', start: 70, end: 82, capturedAt: '2026-06-12T11:06:00Z' },
      { id: 'seg-003-08', speaker: 'Devon Chen', text: 'Yes, we can start next sprint. I\'ll create the technical spec and have it ready for review by Friday. We should also plan for A/B testing the new flow.', start: 82, end: 95, capturedAt: '2026-06-12T11:07:00Z' },
      { id: 'seg-003-09', speaker: 'Alex Rivera', text: 'For the onboarding, I suggest we implement progressive profiling — only ask for essential info upfront and collect the rest over time. That should cut the setup time significantly.', start: 95, end: 110, capturedAt: '2026-06-12T11:08:00Z' },
      { id: 'seg-003-10', speaker: 'Priya Patel', text: 'Great idea. Let\'s go with progressive profiling for onboarding. Maya, can you define the "essential" vs "deferrable" fields based on the customer data?', start: 110, end: 122, capturedAt: '2026-06-12T11:09:00Z' },
    ],
  },
  {
    meetingId: 'meeting-004',
    meetingTitle: 'Product Sync — Search Demo',
    teamId: DEFAULT_TEAM_ID,
    segments: [
      { id: 'seg-004-01', speaker: 'Priya Patel', text: 'This is our weekly product sync. Let\'s start with the sprint demo. Alex, you had the search feature ready?', start: 0, end: 10, capturedAt: '2026-06-19T15:00:00Z' },
      { id: 'seg-004-02', speaker: 'Alex Rivera', text: 'Yes, the semantic search is working end-to-end now. Users can ask natural language questions about past meetings and get cited answers. The retrieval accuracy in testing is around 85%.', start: 10, end: 25, capturedAt: '2026-06-19T15:01:00Z' },
      { id: 'seg-004-03', speaker: 'Devon Chen', text: 'That\'s impressive. What embedding model are we using? And how does it handle meetings with technical jargon?', start: 25, end: 35, capturedAt: '2026-06-19T15:02:00Z' },
      { id: 'seg-004-04', speaker: 'Alex Rivera', text: 'We\'re using a 384-dimensional embedding with FNV hashing. It\'s deterministic and fast — no external API calls needed. For technical jargon, the n-gram approach actually handles it reasonably well since technical terms have unique character patterns.', start: 35, end: 55, capturedAt: '2026-06-19T15:03:00Z' },
      { id: 'seg-004-05', speaker: 'Maya Singh', text: 'Can we add filters? Like "show me all decisions from last month" or "what did Devon say about the API"?', start: 55, end: 65, capturedAt: '2026-06-19T15:04:00Z' },
      { id: 'seg-004-06', speaker: 'Alex Rivera', text: 'The metadata filtering is already supported by Pinecone. We store speaker, meeting title, date, and team ID with each vector. I can add a filtered search mode by next sprint.', start: 65, end: 80, capturedAt: '2026-06-19T15:05:00Z' },
      { id: 'seg-004-07', speaker: 'Sam Torres', text: 'I\'d also like to see a "related meetings" feature — when you\'re in a meeting, it surfaces relevant past discussions automatically.', start: 80, end: 92, capturedAt: '2026-06-19T15:06:00Z' },
      { id: 'seg-004-08', speaker: 'Priya Patel', text: 'That\'s actually the context card feature we specced. It\'s already working in the socket pipeline. When someone speaks, it searches memory and surfaces relevant past context.', start: 92, end: 105, capturedAt: '2026-06-19T15:07:00Z' },
      { id: 'seg-004-09', speaker: 'Devon Chen', text: 'The contradiction detection is also live. If someone makes a statement that conflicts with a previous decision, it flags it in real-time with a confidence score.', start: 105, end: 118, capturedAt: '2026-06-19T15:08:00Z' },
      { id: 'seg-004-10', speaker: 'Priya Patel', text: 'Excellent progress team. Let\'s plan the demo for the board on Friday. Alex, prepare a 5-minute walkthrough of the search and context features.', start: 118, end: 130, capturedAt: '2026-06-19T15:09:00Z' },
    ],
  },
  {
    meetingId: 'meeting-005',
    meetingTitle: 'Performance & Reliability Review',
    teamId: DEFAULT_TEAM_ID,
    segments: [
      { id: 'seg-005-01', speaker: 'Sam Torres', text: 'I want to discuss the performance metrics from last week. The API response times have been creeping up, and I\'m seeing some concerning patterns in the error logs.', start: 0, end: 14, capturedAt: '2026-06-10T09:00:00Z' },
      { id: 'seg-005-02', speaker: 'Alex Rivera', text: 'The main bottleneck is the database connection pool. During peak hours we\'re maxing out the 20-connection pool and requests are queuing. Average latency goes from 5ms to 200ms.', start: 14, end: 28, capturedAt: '2026-06-10T09:01:00Z' },
      { id: 'seg-005-03', speaker: 'Devon Chen', text: 'We should increase the pool size to 50 and add connection timeout handling. Also, we should implement query result caching for frequently accessed data like meeting lists.', start: 28, end: 42, capturedAt: '2026-06-10T09:02:00Z' },
      { id: 'seg-005-04', speaker: 'Sam Torres', text: 'The caching layer is already there — the MemoryCache class with TTL-based expiration. But it\'s not being used consistently across all API routes.', start: 42, end: 55, capturedAt: '2026-06-10T09:03:00Z' },
      { id: 'seg-005-05', speaker: 'Alex Rivera', text: 'Right. The meeting list endpoint does a fresh DB query every time. We should cache that for 30 seconds with automatic invalidation on new meeting creation.', start: 55, end: 68, capturedAt: '2026-06-10T09:04:00Z' },
      { id: 'seg-005-06', speaker: 'Devon Chen', text: 'I\'ll wire up the cache layer to all read endpoints this sprint. We should also consider moving the vector search entirely to Pinecone — the pgvector queries are adding latency.', start: 68, end: 82, capturedAt: '2026-06-10T09:05:00Z' },
      { id: 'seg-005-07', speaker: 'Priya Patel', text: 'Agreed. Let\'s prioritize the Pinecone migration for vector search. It\'s purpose-built for this and should give us much better latency. Devon, create a migration plan.', start: 82, end: 95, capturedAt: '2026-06-10T09:06:00Z' },
      { id: 'seg-005-08', speaker: 'Sam Torres', text: 'One more thing — the WebSocket connections are stable but I noticed memory usage grows over time. We need to make sure we\'re properly cleaning up meeting rooms when they end.', start: 95, end: 110, capturedAt: '2026-06-10T09:07:00Z' },
      { id: 'seg-005-09', speaker: 'Devon Chen', text: 'The room cleanup logic is there in the socket handler. Let me audit it for memory leaks. It might be the transcript arrays growing without bounds for long meetings.', start: 110, end: 122, capturedAt: '2026-06-10T09:08:00Z' },
      { id: 'seg-005-10', speaker: 'Priya Patel', text: 'Good. Action items: Devon caches all read endpoints and creates Pinecone migration plan. Sam audits WebSocket memory. Alex continues the search feature polish. Let\'s reconvene Thursday.', start: 122, end: 140, capturedAt: '2026-06-10T09:09:00Z' },
    ],
  },
];

/* ─── Main ─────────────────────────────────────────────────────────── */

async function main() {
  console.log('[seed] Initializing Pinecone client...');
  const pinecone = new Pinecone({ apiKey });
  const index = pinecone.index(indexName);

  console.log(`[seed] Target index: ${indexName} (integrated embeddings: llama-text-embed-v2)`);
  console.log(`[seed] Processing ${MEETINGS.length} meetings...\n`);

  let totalRecords = 0;

  for (const { meetingId, meetingTitle, teamId, segments } of MEETINGS) {
    const records = [];

    for (const segment of segments) {
      const chunks = chunkText(segment.text, 200, 40);

      for (let i = 0; i < chunks.length; i++) {
        const chunkId = chunks.length === 1 ? segment.id : `${segment.id}_chunk_${i}`;
        records.push({
          _id: chunkId,
          text: chunks[i],
          meetingId,
          meetingTitle,
          speaker: segment.speaker,
          start: segment.start,
          end: segment.end,
          capturedAt: segment.capturedAt,
          teamId,
          chunkIndex: i,
          totalChunks: chunks.length,
        });
      }
    }

    // Batch upsert using integrated embeddings
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE);
      if (batch.length > 0) {
        await index.upsertRecords({ records: batch });
      }
    }

    totalRecords += records.length;
    console.log(`  ✓ ${meetingTitle} — ${segments.length} segments → ${records.length} records`);
  }

  console.log(`\n[seed] ✅ Done! Seeded ${totalRecords} records across ${MEETINGS.length} meetings.`);
  console.log(`[seed] Index: ${indexName}`);
  console.log(`[seed] Pinecone will generate embeddings server-side using llama-text-embed-v2.`);
}

main().catch((err) => {
  console.error('[seed] Fatal error:', err);
  process.exit(1);
});
