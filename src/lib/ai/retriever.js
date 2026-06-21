/**
 * @module retriever
 * @description Hybrid RAG retrieval (Mode 2 — Retriever).
 * Combines Pinecone semantic search with knowledge-graph context
 * from the in-memory store, then synthesises a cited answer via the quality model.
 */

import groq, { RAG_MODEL } from './groq-client.js';
import { searchMemoryIndex } from './pinecone.js';
import store from '../memory-store.js';

/**
 * @typedef {Object} Citation
 * @property {string} meeting_id - UUID of the source meeting
 * @property {string} timestamp  - ISO timestamp of the cited segment
 * @property {string} speaker    - Speaker attribution
 * @property {string} text       - The cited text
 */

/**
 * @typedef {Object} RetrievalResult
 * @property {string}     answer    - Synthesised answer with inline citations
 * @property {Citation[]} citations - Structured citation list
 */

/* ─── Synthesis prompt ─────────────────────────────────────────────── */

const SYNTHESIS_SYSTEM_PROMPT = `You are Nexus's Memory Retriever. You answer questions about past meetings using ONLY the provided context.

## Rules
1. Every factual claim in your answer MUST include a citation in the form [N] where N is the 1-based index of the source from the CONTEXT block.
2. If the context does not contain enough information to answer, say "I don't have enough meeting context to answer that" — never fabricate information.
3. When multiple sources agree, cite all of them: [1][3].
4. Prefer the most recent information when sources conflict and note the discrepancy.
5. Keep answers concise and actionable. Use bullet points for multi-part answers.
6. At the end of your answer, include a "Sources" section listing each [N] with meeting name and date.

## Output format
Return a JSON object with exactly these keys:
{
  "answer": "<your answer with [N] citations inline>",
  "citations": [
    {
      "meeting_id": "<uuid>",
      "timestamp": "<ISO string>",
      "speaker": "<name>",
      "text": "<relevant excerpt>"
    }
  ]
}

Return ONLY valid JSON — no markdown fences, no extra text.`;

/** Stable empty result for error paths. */
const EMPTY_RESULT = Object.freeze({ answer: '', citations: [] });

/**
 * Safely parse a JSON response from the LLM.
 * @param {string} raw
 * @returns {RetrievalResult|null}
 */
function safeParse(raw) {
  if (!raw) return null;
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  }
  try {
    const parsed = JSON.parse(cleaned);
    return {
      answer: typeof parsed.answer === 'string' ? parsed.answer : '',
      citations: Array.isArray(parsed.citations) ? parsed.citations : [],
    };
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        return {
          answer: typeof parsed.answer === 'string' ? parsed.answer : '',
          citations: Array.isArray(parsed.citations) ? parsed.citations : [],
        };
      } catch {
        return null;
      }
    }
    return null;
  }
}

/**
 * Search organisational memory and return a synthesised, cited answer.
 *
 * Pipeline:
 * 1. Semantic search via Pinecone.
 * 2. Enrich with related knowledge graph nodes from in-memory store.
 * 3. Synthesise via QUALITY_MODEL with citation requirements.
 *
 * @param {string}   queryStr - Natural-language question
 * @param {string[]} teamIds  - Team UUIDs for access scoping
 * @param {number}   [limit=5] - Max semantic chunks to retrieve
 * @returns {Promise<RetrievalResult>}
 */
export async function searchMemory(queryStr, teamIds, limit = 5) {
  try {
    if (!queryStr?.trim() || !teamIds?.length) {
      return EMPTY_RESULT;
    }

    /* ── Step 1: Semantic search via Pinecone ─────────────────────── */
    const semanticHits = await searchMemoryIndex(queryStr, teamIds, limit);

    if (semanticHits.length === 0) {
      return {
        answer: "I don't have enough meeting context to answer that.",
        citations: [],
      };
    }

    /* ── Step 2: Enrich with knowledge graph nodes ───────────────── */
    const meetingIds = [...new Set(semanticHits.map((h) => h.meeting_id).filter(Boolean))];

    let graphNodes = [];
    if (meetingIds.length > 0) {
      try {
        const db = await import('../db.js');
        const nodesResult = await db.query(
          `SELECT DISTINCT kn.*
           FROM knowledge_nodes kn
           LEFT JOIN knowledge_edges ke ON ke.from_node_id = kn.id OR ke.to_node_id = kn.id
           WHERE (kn.created_from_meeting_id = ANY($1) OR ke.source_meeting_id = ANY($1))
             AND (kn.team_id IS NULL OR kn.team_id = ANY($2))
           LIMIT 20`,
          [meetingIds, teamIds]
        );
        graphNodes = nodesResult.rows;
      } catch (dbErr) {
        console.warn('[retriever] Postgres knowledge nodes query failed, falling back to memory store:', dbErr.message);
        try {
          graphNodes = store.getRelatedKnowledgeNodes(meetingIds, teamIds);
        } catch {}
      }
    }

    /* ── Step 3: Build context block ─────────────────────────────── */
    const contextParts = semanticHits.map((hit, idx) => {
      const meta = hit.metadata || {};
      const speaker = meta.speaker || 'Unknown';
      const timestamp = meta.timestamp || 'Unknown time';
      const meetingName = meta.meeting_title || hit.meeting_id || 'Unknown meeting';
      return `[${idx + 1}] Meeting: ${meetingName} | Speaker: ${speaker} | Time: ${timestamp}\n${hit.content}`;
    });

    let contextBlock = '## CONTEXT\n\n' + contextParts.join('\n\n');

    if (graphNodes.length > 0) {
      const graphBlock = graphNodes
        .map((n) => `- ${n.type}: ${n.label} (status: ${n.status || 'active'})`)
        .join('\n');
      contextBlock += '\n\n## RELATED KNOWLEDGE NODES\n' + graphBlock;
    }

    /* ── Step 4: Synthesise answer ───────────────────────────────── */
    const response = await groq.chat.completions.create({
      model: RAG_MODEL,
      messages: [
        { role: 'system', content: SYNTHESIS_SYSTEM_PROMPT },
        { role: 'user', content: `## Question\n${queryStr}\n\n${contextBlock}` },
      ],
      temperature: 0.2,
      max_tokens: 2048,
      response_format: { type: 'json_object' },
    });

    const raw = response.choices?.[0]?.message?.content ?? '';
    const parsed = safeParse(raw);

    if (!parsed) {
      console.warn('[retriever] Failed to parse synthesis output:', raw.slice(0, 300));
      // Fall back to returning the raw answer with basic citations.
      return {
        answer: raw || "I couldn't synthesise an answer from the available context.",
        citations: semanticHits.map((h) => ({
          meeting_id: h.meeting_id,
          timestamp: h.metadata?.timestamp || '',
          speaker: h.metadata?.speaker || 'Unknown',
          text: h.content?.slice(0, 200) || '',
        })),
      };
    }

    return parsed;
  } catch (err) {
    console.error('[retriever] Memory search failed:', err.message);
    return EMPTY_RESULT;
  }
}

/**
 * Socket.IO helper for proactive context cards from live transcript chunks.
 *
 * @param {string} text
 * @param {{ teamIds?: string[], orgId?: string, meetingId?: string }} context
 * @returns {Promise<Array>}
 */
export async function retrieveContext(text, context = {}) {
  const teamIds = Array.isArray(context.teamIds) ? context.teamIds : [];
  if (!text?.trim() || teamIds.length === 0) {
    return [];
  }

  const result = await searchMemory(text, teamIds, 3);
  if (!result.answer) return [];

  return [{
    id: `context_${Date.now()}`,
    claim: result.answer,
    source_meeting: result.citations?.[0]?.meeting_id || 'Organizational memory',
    source_date: result.citations?.[0]?.timestamp || '',
    speaker: result.citations?.[0]?.speaker || '',
    full_context: result.citations?.map((citation) => citation.text).filter(Boolean).join('\n\n'),
  }];
}
