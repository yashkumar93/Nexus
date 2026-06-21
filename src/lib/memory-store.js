/**
 * @module memory-store
 * @description In-memory data store that replaces PostgreSQL for meetings,
 * transcripts, knowledge graph nodes/edges, and user data.
 *
 * Pre-seeded with realistic mock data so the app functions fully
 * without a running Postgres instance.
 *
 * Singleton preserved across HMR via globalThis.
 */

/* ─── Constants ────────────────────────────────────────────────────── */

const DEFAULT_ORG_ID = 'd7b3b9b4-523d-4c3e-9083-d9d13dbff4d0';
const DEFAULT_TEAM_ID = 'e0c6600c-b26a-4d7a-8f12-0fbc185906ef';
const SECONDARY_TEAM_ID = 'f1ca7ece-bd1f-4b07-8e6f-5799a2fe619c';

/* ─── Mock Transcript Data ─────────────────────────────────────────── */

const MOCK_TRANSCRIPTS = {
  'meeting-001': [
    { id: 'seg-001-01', speaker: 'Priya Patel', text: 'Let\'s start with the Q2 planning. We need to finalize the payments vendor decision today. Devon, can you walk us through the options?', start: 0, end: 12 },
    { id: 'seg-001-02', speaker: 'Devon Chen', text: 'Sure. We evaluated three vendors — Vendor A, Vendor B, and Stripe Connect. Vendor A has the best scale pricing at our projected volume. Their compliance package was already approved in the May 29 finance review.', start: 12, end: 28 },
    { id: 'seg-001-03', speaker: 'Maya Singh', text: 'What about Vendor B? I thought their API was cleaner and the integration timeline was shorter.', start: 28, end: 35 },
    { id: 'seg-001-04', speaker: 'Devon Chen', text: 'Vendor B\'s API is indeed cleaner, but their compliance certification is still pending. We can\'t go live without SOC 2 Type II, and they said it could take another 6-8 weeks.', start: 35, end: 50 },
    { id: 'seg-001-05', speaker: 'Priya Patel', text: 'That\'s a dealbreaker for our timeline. We need to launch the payment integration by end of July. Let\'s go with Vendor A for now and revisit Vendor B once they have certification.', start: 50, end: 65 },
    { id: 'seg-001-06', speaker: 'Alex Rivera', text: 'Agreed. I\'ll update the project brief with Vendor A\'s contract thresholds. Devon, can you attach the pricing tier breakdown to the launch brief?', start: 65, end: 78 },
    { id: 'seg-001-07', speaker: 'Devon Chen', text: 'Will do. I\'ll have that attached by end of day tomorrow. I\'ll also set up a sandbox environment for the engineering team to start the integration work.', start: 78, end: 90 },
    { id: 'seg-001-08', speaker: 'Maya Singh', text: 'I\'ll verify whether Vendor B has the required compliance certification timeline. If they can expedite, we might want to keep them as a backup option.', start: 90, end: 105 },
    { id: 'seg-001-09', speaker: 'Priya Patel', text: 'Good plan. Now for the roadmap goals — we need to prioritize the customer onboarding flow redesign and the analytics dashboard. Both are critical for Q3.', start: 105, end: 120 },
    { id: 'seg-001-10', speaker: 'Sam Torres', text: 'The analytics dashboard has dependencies on the data pipeline refactor. I\'d suggest we prioritize onboarding first since it directly impacts conversion rates.', start: 120, end: 135 },
    { id: 'seg-001-11', speaker: 'Priya Patel', text: 'Agreed. Let\'s set onboarding redesign as P0 and analytics dashboard as P1. Devon, make sure the engineering sprint plan reflects this priority order.', start: 135, end: 150 },
  ],

  'meeting-002': [
    { id: 'seg-002-01', speaker: 'Devon Chen', text: 'Today we\'re reviewing our tech stack decisions. The main question is whether to stick with Postgres as our system of record or explore MongoDB for certain workloads.', start: 0, end: 15 },
    { id: 'seg-002-02', speaker: 'Alex Rivera', text: 'I\'ve been running benchmarks. Postgres with proper indexing handles our current query patterns well. The knowledge graph queries are complex but pgvector gives us the vector search capability we need.', start: 15, end: 30 },
    { id: 'seg-002-03', speaker: 'Sam Torres', text: 'What about the real-time transcript storage? We\'re getting bursts of 50-100 segments per minute during active meetings. Is Postgres handling that write load?', start: 30, end: 42 },
    { id: 'seg-002-04', speaker: 'Alex Rivera', text: 'The write load is fine with connection pooling. We\'re using PgBouncer with a pool of 20 connections. Average insert latency is under 5ms.', start: 42, end: 55 },
    { id: 'seg-002-05', speaker: 'Devon Chen', text: 'I looked into MongoDB as well. The document model would simplify transcript storage since each meeting\'s transcripts are naturally a document. But it means maintaining two databases.', start: 55, end: 70 },
    { id: 'seg-002-06', speaker: 'Priya Patel', text: 'Two databases means double the operational complexity. Unless there\'s a compelling performance reason, I\'d rather we keep everything in Postgres and use JSONB for flexible schemas.', start: 70, end: 85 },
    { id: 'seg-002-07', speaker: 'Alex Rivera', text: 'Agreed. Let\'s confirm Postgres as our system of record. For vector search specifically, we\'re also evaluating Pinecone as a dedicated vector database for the memory retrieval pipeline.', start: 85, end: 100 },
    { id: 'seg-002-08', speaker: 'Devon Chen', text: 'Pinecone makes sense for the embedding search. It\'s purpose-built for that workload. We can keep the relational data in Postgres and vector search in Pinecone. Best of both worlds.', start: 100, end: 115 },
    { id: 'seg-002-09', speaker: 'Priya Patel', text: 'Good. Decision made — Postgres for relational data, Pinecone for vector search. Alex, please document this in our architecture decision records.', start: 115, end: 125 },
  ],

  'meeting-003': [
    { id: 'seg-003-01', speaker: 'Maya Singh', text: 'I want to share the latest customer feedback from the checkout flow survey. We received 342 responses and the results are quite revealing.', start: 0, end: 12 },
    { id: 'seg-003-02', speaker: 'Priya Patel', text: 'Great. What are the top pain points?', start: 12, end: 16 },
    { id: 'seg-003-03', speaker: 'Maya Singh', text: 'The number one issue is the multi-step checkout — 67% of respondents said it takes too long. The second issue is the lack of saved payment methods, mentioned by 45% of users.', start: 16, end: 30 },
    { id: 'seg-003-04', speaker: 'Sam Torres', text: 'That aligns with our analytics data. We see a 34% drop-off between the cart page and payment confirmation. Most of that happens at the address entry step.', start: 30, end: 42 },
    { id: 'seg-003-05', speaker: 'Devon Chen', text: 'We should consolidate the checkout into a single-page experience. There are good patterns from Shopify and Stripe Checkout that we can reference.', start: 42, end: 55 },
    { id: 'seg-003-06', speaker: 'Maya Singh', text: 'I also want to flag the onboarding friction. New users are taking an average of 4.2 minutes to complete setup, and 28% abandon before finishing. We need to reduce this to under 2 minutes.', start: 55, end: 70 },
    { id: 'seg-003-07', speaker: 'Priya Patel', text: 'Let\'s make the single-page checkout and onboarding simplification our top priorities. Devon, can the team start on the checkout redesign next sprint?', start: 70, end: 82 },
    { id: 'seg-003-08', speaker: 'Devon Chen', text: 'Yes, we can start next sprint. I\'ll create the technical spec and have it ready for review by Friday. We should also plan for A/B testing the new flow.', start: 82, end: 95 },
    { id: 'seg-003-09', speaker: 'Alex Rivera', text: 'For the onboarding, I suggest we implement progressive profiling — only ask for essential info upfront and collect the rest over time. That should cut the setup time significantly.', start: 95, end: 110 },
    { id: 'seg-003-10', speaker: 'Priya Patel', text: 'Great idea. Let\'s go with progressive profiling for onboarding. Maya, can you define the "essential" vs "deferrable" fields based on the customer data?', start: 110, end: 122 },
  ],

  'meeting-004': [
    { id: 'seg-004-01', speaker: 'Priya Patel', text: 'This is our weekly product sync. Let\'s start with the sprint demo. Alex, you had the search feature ready?', start: 0, end: 10 },
    { id: 'seg-004-02', speaker: 'Alex Rivera', text: 'Yes, the semantic search is working end-to-end now. Users can ask natural language questions about past meetings and get cited answers. The retrieval accuracy in testing is around 85%.', start: 10, end: 25 },
    { id: 'seg-004-03', speaker: 'Devon Chen', text: 'That\'s impressive. What embedding model are we using? And how does it handle meetings with technical jargon?', start: 25, end: 35 },
    { id: 'seg-004-04', speaker: 'Alex Rivera', text: 'We\'re using a 384-dimensional embedding with FNV hashing. It\'s deterministic and fast — no external API calls needed. For technical jargon, the n-gram approach actually handles it reasonably well since technical terms have unique character patterns.', start: 35, end: 55 },
    { id: 'seg-004-05', speaker: 'Maya Singh', text: 'Can we add filters? Like "show me all decisions from last month" or "what did Devon say about the API"?', start: 55, end: 65 },
    { id: 'seg-004-06', speaker: 'Alex Rivera', text: 'The metadata filtering is already supported by Pinecone. We store speaker, meeting title, date, and team ID with each vector. I can add a filtered search mode by next sprint.', start: 65, end: 80 },
    { id: 'seg-004-07', speaker: 'Sam Torres', text: 'I\'d also like to see a "related meetings" feature — when you\'re in a meeting, it surfaces relevant past discussions automatically.', start: 80, end: 92 },
    { id: 'seg-004-08', speaker: 'Priya Patel', text: 'That\'s actually the context card feature we specced. It\'s already working in the socket pipeline. When someone speaks, it searches memory and surfaces relevant past context.', start: 92, end: 105 },
    { id: 'seg-004-09', speaker: 'Devon Chen', text: 'The contradiction detection is also live. If someone makes a statement that conflicts with a previous decision, it flags it in real-time with a confidence score.', start: 105, end: 118 },
    { id: 'seg-004-10', speaker: 'Priya Patel', text: 'Excellent progress team. Let\'s plan the demo for the board on Friday. Alex, prepare a 5-minute walkthrough of the search and context features.', start: 118, end: 130 },
  ],

  'meeting-005': [
    { id: 'seg-005-01', speaker: 'Sam Torres', text: 'I want to discuss the performance metrics from last week. The API response times have been creeping up, and I\'m seeing some concerning patterns in the error logs.', start: 0, end: 14 },
    { id: 'seg-005-02', speaker: 'Alex Rivera', text: 'The main bottleneck is the database connection pool. During peak hours we\'re maxing out the 20-connection pool and requests are queuing. Average latency goes from 5ms to 200ms.', start: 14, end: 28 },
    { id: 'seg-005-03', speaker: 'Devon Chen', text: 'We should increase the pool size to 50 and add connection timeout handling. Also, we should implement query result caching for frequently accessed data like meeting lists.', start: 28, end: 42 },
    { id: 'seg-005-04', speaker: 'Sam Torres', text: 'The caching layer is already there — the MemoryCache class with TTL-based expiration. But it\'s not being used consistently across all API routes.', start: 42, end: 55 },
    { id: 'seg-005-05', speaker: 'Alex Rivera', text: 'Right. The meeting list endpoint does a fresh DB query every time. We should cache that for 30 seconds with automatic invalidation on new meeting creation.', start: 55, end: 68 },
    { id: 'seg-005-06', speaker: 'Devon Chen', text: 'I\'ll wire up the cache layer to all read endpoints this sprint. We should also consider moving the vector search entirely to Pinecone — the pgvector queries are adding latency.', start: 68, end: 82 },
    { id: 'seg-005-07', speaker: 'Priya Patel', text: 'Agreed. Let\'s prioritize the Pinecone migration for vector search. It\'s purpose-built for this and should give us much better latency. Devon, create a migration plan.', start: 82, end: 95 },
    { id: 'seg-005-08', speaker: 'Sam Torres', text: 'One more thing — the WebSocket connections are stable but I noticed memory usage grows over time. We need to make sure we\'re properly cleaning up meeting rooms when they end.', start: 95, end: 110 },
    { id: 'seg-005-09', speaker: 'Devon Chen', text: 'The room cleanup logic is there in the socket handler. Let me audit it for memory leaks. It might be the transcript arrays growing without bounds for long meetings.', start: 110, end: 122 },
    { id: 'seg-005-10', speaker: 'Priya Patel', text: 'Good. Action items: Devon caches all read endpoints and creates Pinecone migration plan. Sam audits WebSocket memory. Alex continues the search feature polish. Let\'s reconvene Thursday.', start: 122, end: 140 },
  ],
};

/* ─── Mock Knowledge Nodes ─────────────────────────────────────────── */

const MOCK_KNOWLEDGE_NODES = [
  {
    id: 'kn-001', orgId: DEFAULT_ORG_ID, teamId: DEFAULT_TEAM_ID,
    type: 'decision', label: 'Vendor A selected for payments',
    claim_text: 'Vendor A was selected because their scale pricing and compliance package were already approved in the May 29 finance review.',
    status: 'active', created_at: '2026-06-18T10:30:00Z',
    properties: { claim_text: 'Vendor A was selected because their scale pricing and compliance package were already approved in the May 29 finance review.', speaker: 'Priya Patel' },
    created_from_meeting_id: 'meeting-001',
  },
  {
    id: 'kn-002', orgId: DEFAULT_ORG_ID, teamId: DEFAULT_TEAM_ID,
    type: 'decision', label: 'Postgres as system of record',
    claim_text: 'Confirmed Postgres as the system of record for relational data, with Pinecone for vector search.',
    status: 'active', created_at: '2026-06-15T14:00:00Z',
    properties: { claim_text: 'Confirmed Postgres as the system of record for relational data, with Pinecone for vector search.', speaker: 'Priya Patel' },
    created_from_meeting_id: 'meeting-002',
  },
  {
    id: 'kn-003', orgId: DEFAULT_ORG_ID, teamId: DEFAULT_TEAM_ID,
    type: 'decision', label: 'Single-page checkout redesign',
    claim_text: 'Consolidate checkout into a single-page experience to reduce the 34% drop-off rate.',
    status: 'active', created_at: '2026-06-12T11:00:00Z',
    properties: { claim_text: 'Consolidate checkout into a single-page experience to reduce the 34% drop-off rate.', speaker: 'Devon Chen' },
    created_from_meeting_id: 'meeting-003',
  },
  {
    id: 'kn-004', orgId: DEFAULT_ORG_ID, teamId: DEFAULT_TEAM_ID,
    type: 'decision', label: 'Progressive profiling for onboarding',
    claim_text: 'Implement progressive profiling — only ask for essential info upfront and collect the rest over time to reduce setup time under 2 minutes.',
    status: 'active', created_at: '2026-06-12T11:15:00Z',
    properties: { claim_text: 'Implement progressive profiling for onboarding to reduce setup time from 4.2 minutes to under 2 minutes.', speaker: 'Priya Patel' },
    created_from_meeting_id: 'meeting-003',
  },
  {
    id: 'kn-005', orgId: DEFAULT_ORG_ID, teamId: DEFAULT_TEAM_ID,
    type: 'decision', label: 'Onboarding redesign is P0, analytics dashboard P1',
    claim_text: 'Customer onboarding flow redesign is P0 priority, analytics dashboard is P1 for Q3.',
    status: 'active', created_at: '2026-06-18T10:45:00Z',
    properties: { claim_text: 'Customer onboarding flow redesign is P0 priority, analytics dashboard is P1 for Q3.', speaker: 'Priya Patel' },
    created_from_meeting_id: 'meeting-001',
  },
  {
    id: 'kn-006', orgId: DEFAULT_ORG_ID, teamId: DEFAULT_TEAM_ID,
    type: 'decision', label: 'Migrate vector search to Pinecone',
    claim_text: 'Prioritize moving vector search entirely to Pinecone for better latency. Create migration plan.',
    status: 'active', created_at: '2026-06-10T09:30:00Z',
    properties: { claim_text: 'Migrate vector search to Pinecone for better latency.', speaker: 'Priya Patel' },
    created_from_meeting_id: 'meeting-005',
  },
  // Entities
  {
    id: 'kn-010', orgId: DEFAULT_ORG_ID, teamId: DEFAULT_TEAM_ID,
    type: 'person', label: 'Priya Patel', status: 'active',
    properties: { role: 'Product Lead' }, created_at: '2026-06-01T00:00:00Z',
  },
  {
    id: 'kn-011', orgId: DEFAULT_ORG_ID, teamId: DEFAULT_TEAM_ID,
    type: 'person', label: 'Devon Chen', status: 'active',
    properties: { role: 'Engineering Lead' }, created_at: '2026-06-01T00:00:00Z',
  },
  {
    id: 'kn-012', orgId: DEFAULT_ORG_ID, teamId: DEFAULT_TEAM_ID,
    type: 'person', label: 'Maya Singh', status: 'active',
    properties: { role: 'Customer Success' }, created_at: '2026-06-01T00:00:00Z',
  },
  {
    id: 'kn-013', orgId: DEFAULT_ORG_ID, teamId: DEFAULT_TEAM_ID,
    type: 'person', label: 'Alex Rivera', status: 'active',
    properties: { role: 'Senior Engineer' }, created_at: '2026-06-01T00:00:00Z',
  },
  {
    id: 'kn-014', orgId: DEFAULT_ORG_ID, teamId: DEFAULT_TEAM_ID,
    type: 'person', label: 'Sam Torres', status: 'active',
    properties: { role: 'DevOps Engineer' }, created_at: '2026-06-01T00:00:00Z',
  },
  {
    id: 'kn-020', orgId: DEFAULT_ORG_ID, teamId: DEFAULT_TEAM_ID,
    type: 'project', label: 'Payment Integration', status: 'active',
    properties: { description: 'Integrate Vendor A for payment processing' }, created_at: '2026-06-01T00:00:00Z',
  },
  {
    id: 'kn-021', orgId: DEFAULT_ORG_ID, teamId: DEFAULT_TEAM_ID,
    type: 'project', label: 'Checkout Redesign', status: 'active',
    properties: { description: 'Single-page checkout flow' }, created_at: '2026-06-01T00:00:00Z',
  },
  {
    id: 'kn-022', orgId: DEFAULT_ORG_ID, teamId: DEFAULT_TEAM_ID,
    type: 'project', label: 'Onboarding Flow', status: 'active',
    properties: { description: 'Progressive profiling onboarding' }, created_at: '2026-06-01T00:00:00Z',
  },
  {
    id: 'kn-030', orgId: DEFAULT_ORG_ID, teamId: DEFAULT_TEAM_ID,
    type: 'tool', label: 'Postgres', status: 'active',
    properties: { usage: 'System of record' }, created_at: '2026-06-01T00:00:00Z',
  },
  {
    id: 'kn-031', orgId: DEFAULT_ORG_ID, teamId: DEFAULT_TEAM_ID,
    type: 'tool', label: 'Pinecone', status: 'active',
    properties: { usage: 'Vector search database' }, created_at: '2026-06-01T00:00:00Z',
  },
  {
    id: 'kn-032', orgId: DEFAULT_ORG_ID, teamId: DEFAULT_TEAM_ID,
    type: 'tool', label: 'Vendor A', status: 'active',
    properties: { usage: 'Payments vendor' }, created_at: '2026-06-01T00:00:00Z',
  },
  {
    id: 'kn-033', orgId: DEFAULT_ORG_ID, teamId: DEFAULT_TEAM_ID,
    type: 'customer', label: 'Vendor B', status: 'active',
    properties: { usage: 'Alternative payments vendor, pending SOC 2' }, created_at: '2026-06-01T00:00:00Z',
  },
];

/* ─── Mock Knowledge Edges ─────────────────────────────────────────── */

const MOCK_KNOWLEDGE_EDGES = [
  { id: 'ke-001', source_id: 'kn-010', target_id: 'kn-001', relation_type: 'decided_by', source_meeting_id: 'meeting-001' },
  { id: 'ke-002', source_id: 'kn-011', target_id: 'kn-001', relation_type: 'owns', source_meeting_id: 'meeting-001' },
  { id: 'ke-003', source_id: 'kn-032', target_id: 'kn-001', relation_type: 'related_to', source_meeting_id: 'meeting-001' },
  { id: 'ke-004', source_id: 'kn-010', target_id: 'kn-002', relation_type: 'decided_by', source_meeting_id: 'meeting-002' },
  { id: 'ke-005', source_id: 'kn-030', target_id: 'kn-002', relation_type: 'related_to', source_meeting_id: 'meeting-002' },
  { id: 'ke-006', source_id: 'kn-031', target_id: 'kn-002', relation_type: 'related_to', source_meeting_id: 'meeting-002' },
  { id: 'ke-007', source_id: 'kn-011', target_id: 'kn-003', relation_type: 'owns', source_meeting_id: 'meeting-003' },
  { id: 'ke-008', source_id: 'kn-021', target_id: 'kn-003', relation_type: 'related_to', source_meeting_id: 'meeting-003' },
  { id: 'ke-009', source_id: 'kn-010', target_id: 'kn-004', relation_type: 'decided_by', source_meeting_id: 'meeting-003' },
  { id: 'ke-010', source_id: 'kn-022', target_id: 'kn-004', relation_type: 'related_to', source_meeting_id: 'meeting-003' },
  { id: 'ke-011', source_id: 'kn-020', target_id: 'kn-032', relation_type: 'related_to', source_meeting_id: 'meeting-001' },
  { id: 'ke-012', source_id: 'kn-010', target_id: 'kn-005', relation_type: 'decided_by', source_meeting_id: 'meeting-001' },
  { id: 'ke-013', source_id: 'kn-010', target_id: 'kn-006', relation_type: 'decided_by', source_meeting_id: 'meeting-005' },
  { id: 'ke-014', source_id: 'kn-031', target_id: 'kn-006', relation_type: 'related_to', source_meeting_id: 'meeting-005' },
];

/* ─── Store class ──────────────────────────────────────────────────── */

class MemoryStore {
  constructor() {
    /** @type {Map<string, Object>} */
    this.meetings = new Map();
    /** @type {Map<string, Array>} meetingId → transcript segments */
    this.transcripts = new Map();
    /** @type {Array<Object>} */
    this.knowledgeNodes = [];
    /** @type {Array<Object>} */
    this.knowledgeEdges = [];

    this._seed();
  }

  /* ─── Seeding ────────────────────────────────────────────────────── */

  _seed() {
    // Meetings
    const meetingSeed = [
      {
        id: 'meeting-001', title: 'Q2 Planning Session',
        team_id: DEFAULT_TEAM_ID,
        started_at: '2026-06-18T10:00:00Z', ended_at: '2026-06-18T11:30:00Z',
        status: 'ended', platform: 'manual',
        summary: 'Chose Vendor A for payments (compliance approved). Prioritized onboarding redesign (P0) and analytics dashboard (P1) for Q3 roadmap.',
        created_at: '2026-06-18T10:00:00Z',
      },
      {
        id: 'meeting-002', title: 'Tech Stack Review',
        team_id: DEFAULT_TEAM_ID,
        started_at: '2026-06-15T14:00:00Z', ended_at: '2026-06-15T15:15:00Z',
        status: 'ended', platform: 'manual',
        summary: 'Confirmed Postgres as system of record. Evaluated MongoDB but decided against dual-database complexity. Chose Pinecone for vector search.',
        created_at: '2026-06-15T14:00:00Z',
      },
      {
        id: 'meeting-003', title: 'Customer Feedback Sync',
        team_id: DEFAULT_TEAM_ID,
        started_at: '2026-06-12T11:00:00Z', ended_at: '2026-06-12T12:00:00Z',
        status: 'ended', platform: 'manual',
        summary: 'Reviewed checkout flow survey (342 responses). 67% want faster checkout. Decided on single-page checkout and progressive profiling for onboarding.',
        created_at: '2026-06-12T11:00:00Z',
      },
      {
        id: 'meeting-004', title: 'Product Sync — Search Demo',
        team_id: DEFAULT_TEAM_ID,
        started_at: '2026-06-19T15:00:00Z', ended_at: '2026-06-19T15:45:00Z',
        status: 'ended', platform: 'manual',
        summary: 'Demoed semantic search with 85% retrieval accuracy. Contradiction detection is live. Planning board demo for Friday.',
        created_at: '2026-06-19T15:00:00Z',
      },
      {
        id: 'meeting-005', title: 'Performance & Reliability Review',
        team_id: DEFAULT_TEAM_ID,
        started_at: '2026-06-10T09:00:00Z', ended_at: '2026-06-10T10:00:00Z',
        status: 'ended', platform: 'manual',
        summary: 'API latency spiking during peak hours due to DB pool exhaustion. Decided to cache read endpoints, migrate vector search to Pinecone, and audit WebSocket memory.',
        created_at: '2026-06-10T09:00:00Z',
      },
    ];

    for (const m of meetingSeed) {
      this.meetings.set(m.id, m);
    }

    // Transcripts
    for (const [meetingId, segments] of Object.entries(MOCK_TRANSCRIPTS)) {
      this.transcripts.set(meetingId, segments.map(s => ({
        ...s,
        meetingId,
        speakerId: null,
        capturedAt: this.meetings.get(meetingId)?.started_at || new Date().toISOString(),
      })));
    }

    // Knowledge graph
    this.knowledgeNodes = [...MOCK_KNOWLEDGE_NODES];
    this.knowledgeEdges = [...MOCK_KNOWLEDGE_EDGES];
  }

  /* ─── Meetings ───────────────────────────────────────────────────── */

  /**
   * Get all meetings, newest first.
   * @returns {Array<Object>}
   */
  getMeetings() {
    return Array.from(this.meetings.values())
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map(m => ({
        id: m.id,
        title: m.title,
        date: m.started_at ? new Date(m.started_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        participants: (this.transcripts.get(m.id) || [])
          .reduce((speakers, s) => { speakers.add(s.speaker); return speakers; }, new Set()).size || 1,
        status: m.status,
        summary: m.summary,
        decisions: this.knowledgeNodes.filter(n => n.type === 'decision' && n.created_from_meeting_id === m.id).length,
      }));
  }

  /**
   * Get a single meeting by ID.
   * @param {string} id
   * @returns {Object|null}
   */
  getMeeting(id) {
    return this.meetings.get(id) || null;
  }

  /**
   * Create a new meeting.
   * @param {Object} meeting
   * @returns {Object}
   */
  createMeeting(meeting) {
    const now = new Date().toISOString();
    const m = {
      id: meeting.id || crypto.randomUUID(),
      title: meeting.title,
      team_id: meeting.teamId || DEFAULT_TEAM_ID,
      started_at: now,
      ended_at: null,
      status: 'live',
      platform: 'manual',
      summary: null,
      created_at: now,
    };
    this.meetings.set(m.id, m);
    this.transcripts.set(m.id, []);
    return m;
  }

  /**
   * End a meeting.
   * @param {string} id
   * @returns {boolean}
   */
  endMeeting(id) {
    const m = this.meetings.get(id);
    if (!m) return false;
    m.status = 'ended';
    m.ended_at = new Date().toISOString();
    return true;
  }

  /**
   * Delete a meeting.
   * @param {string} id
   * @returns {boolean}
   */
  deleteMeeting(id) {
    this.transcripts.delete(id);
    return this.meetings.delete(id);
  }

  /* ─── Transcripts ────────────────────────────────────────────────── */

  /**
   * Get transcripts for a meeting.
   * @param {string} meetingId
   * @returns {Array}
   */
  getTranscripts(meetingId) {
    return this.transcripts.get(meetingId) || [];
  }

  /**
   * Add a transcript segment.
   * @param {Object} segment
   */
  addTranscript(segment) {
    const meetingId = segment.meetingId;
    if (!this.transcripts.has(meetingId)) {
      this.transcripts.set(meetingId, []);
    }
    this.transcripts.get(meetingId).push(segment);
  }

  /**
   * Get all transcripts across all meetings (for seeding).
   * @returns {Array<{meetingId: string, meetingTitle: string, segments: Array}>}
   */
  getAllTranscriptsWithMeetings() {
    const result = [];
    for (const [meetingId, segments] of this.transcripts.entries()) {
      const meeting = this.meetings.get(meetingId);
      if (meeting && segments.length > 0) {
        result.push({
          meetingId,
          meetingTitle: meeting.title,
          teamId: meeting.team_id || DEFAULT_TEAM_ID,
          segments,
        });
      }
    }
    return result;
  }

  /* ─── Knowledge Graph ────────────────────────────────────────────── */

  /**
   * Get knowledge nodes related to given meeting IDs and team IDs.
   * @param {string[]} meetingIds
   * @param {string[]} teamIds
   * @returns {Array}
   */
  getRelatedKnowledgeNodes(meetingIds, teamIds) {
    if (!meetingIds?.length && !teamIds?.length) return [];

    const relatedNodeIds = new Set();

    // Nodes directly created from these meetings
    for (const node of this.knowledgeNodes) {
      if (meetingIds.includes(node.created_from_meeting_id)) {
        relatedNodeIds.add(node.id);
      }
    }

    // Nodes connected via edges to meetings
    for (const edge of this.knowledgeEdges) {
      if (meetingIds.includes(edge.source_meeting_id)) {
        relatedNodeIds.add(edge.source_id);
        relatedNodeIds.add(edge.target_id);
      }
    }

    return this.knowledgeNodes
      .filter(n => relatedNodeIds.has(n.id) && (!teamIds?.length || teamIds.includes(n.teamId)))
      .slice(0, 20);
  }

  /**
   * Find active decisions matching a label/topic.
   * @param {string} entityLabel
   * @param {string[]} teamIds
   * @returns {Array}
   */
  findDecisions(entityLabel, teamIds) {
    if (!entityLabel?.trim() || !teamIds?.length) return [];

    const lower = entityLabel.toLowerCase();

    return this.knowledgeNodes
      .filter(n => {
        if (n.type !== 'decision' || n.status !== 'active') return false;
        if (!teamIds.includes(n.teamId)) return false;
        const labelMatch = n.label.toLowerCase().includes(lower);
        const claimMatch = (n.claim_text || '').toLowerCase().includes(lower);
        const propMatch = (n.properties?.claim_text || '').toLowerCase().includes(lower);
        return labelMatch || claimMatch || propMatch;
      })
      .map(n => ({
        id: n.id,
        label: n.label,
        claim_text: n.claim_text || n.properties?.claim_text || n.label,
        status: n.status,
        created_at: n.created_at,
      }))
      .slice(0, 20);
  }

  /**
   * Get all knowledge nodes for the explorer graph view.
   * @param {string[]} teamIds
   * @returns {{ nodes: Array, edges: Array }}
   */
  getKnowledgeGraph(teamIds) {
    const nodes = this.knowledgeNodes
      .filter(n => !teamIds?.length || teamIds.includes(n.teamId))
      .map(n => ({
        id: n.id,
        label: n.label,
        type: n.type,
        status: n.status,
        properties: n.properties,
      }));

    const nodeIdSet = new Set(nodes.map(n => n.id));

    const edges = this.knowledgeEdges
      .filter(e => nodeIdSet.has(e.source_id) && nodeIdSet.has(e.target_id))
      .map(e => ({
        id: e.id,
        source: e.source_id,
        target: e.target_id,
        type: e.relation_type,
      }));

    return { nodes, edges };
  }
}

/* ─── Singleton ────────────────────────────────────────────────────── */

/** @type {MemoryStore} */
const store = globalThis.__nexusMemoryStore ?? new MemoryStore();

// Preserve across HMR
if (process.env.NODE_ENV !== 'production') {
  globalThis.__nexusMemoryStore = store;
}

export { MemoryStore };
export default store;
