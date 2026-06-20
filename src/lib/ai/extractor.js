/**
 * @module extractor
 * @description Real-Time Listener (Mode 1) — extracts entities, relations,
 * and decision candidates from live transcript chunks using the fast model.
 */

import groq, { FAST_MODEL } from './groq-client.js';

/**
 * @typedef {'person'|'project'|'decision'|'customer'|'tool'|'topic'} EntityType
 */

/**
 * @typedef {Object} ExtractedEntity
 * @property {EntityType} type       - Category of the entity
 * @property {string}     label      - Canonical name
 * @property {number}     confidence - 0–1 confidence score
 */

/**
 * @typedef {Object} ExtractedRelation
 * @property {string} from - Source entity label
 * @property {string} to   - Target entity label
 * @property {string} type - Relationship type (e.g. "works_on", "depends_on")
 */

/**
 * @typedef {Object} DecisionCandidate
 * @property {string} claim_text  - The decision/claim as stated
 * @property {number} confidence  - 0–1 confidence this is actually a decision
 * @property {string} speaker     - Attributed speaker (if identifiable)
 */

/**
 * @typedef {Object} ExtractionResult
 * @property {ExtractedEntity[]}    entities  - Extracted entities
 * @property {ExtractedRelation[]}  relations - Extracted relationships
 * @property {DecisionCandidate[]}  decisions - Decision candidates
 */

/* ─── System prompt ────────────────────────────────────────────────── */

const SYSTEM_PROMPT = `You are Continuum's real-time entity extraction engine. Your job is to parse meeting transcript chunks and output structured JSON.

## Entity types you MUST recognise
- **person**   — any named individual mentioned or speaking
- **project**  — product names, codenames, initiatives
- **decision** — explicit choices, agreements, or commitments
- **customer** — company names, client references
- **tool**     — software, frameworks, services mentioned
- **topic**    — abstract themes or agenda items

## Output schema (strict JSON, no markdown)
{
  "entities": [
    { "type": "<entity_type>", "label": "<canonical_name>", "confidence": <0.0-1.0> }
  ],
  "relations": [
    { "from": "<source_label>", "to": "<target_label>", "type": "<relation_type>" }
  ],
  "decisions": [
    { "claim_text": "<the decision as stated>", "confidence": <0.0-1.0>, "speaker": "<name or unknown>" }
  ]
}

## Relation types to use
- works_on, owns, depends_on, blocks, mentions, decided, assigned_to, related_to, uses, replaces

## Rules
1. Return ONLY valid JSON — no prose, no markdown fences.
2. Normalise entity labels to title-case (e.g. "John Smith", "Project Aurora").
3. Only include entities with confidence ≥ 0.4.
4. A "decision" is any statement where someone commits to an action, chooses between options, or explicitly agrees/disagrees. Look for phrases like "let's go with", "we decided", "I'll", "we should", "the plan is".
5. If the chunk is too short or contains no extractable information, return empty arrays.
6. Never fabricate entities that aren't in the transcript.`;

/** Fallback returned when extraction fails. */
const EMPTY_RESULT = Object.freeze({
  entities: [],
  relations: [],
  decisions: [],
});

/**
 * Attempt to parse JSON from an LLM response that may contain markdown
 * fences or trailing text.
 * @param {string} raw - Raw LLM output
 * @returns {ExtractionResult|null}
 */
function safeParse(raw) {
  if (!raw) return null;

  // Strip markdown code fences if present.
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  }

  try {
    const parsed = JSON.parse(cleaned);
    return {
      entities: Array.isArray(parsed.entities) ? parsed.entities : [],
      relations: Array.isArray(parsed.relations) ? parsed.relations : [],
      decisions: Array.isArray(parsed.decisions) ? parsed.decisions : [],
    };
  } catch {
    // Try to extract the first JSON object from the string.
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        return {
          entities: Array.isArray(parsed.entities) ? parsed.entities : [],
          relations: Array.isArray(parsed.relations) ? parsed.relations : [],
          decisions: Array.isArray(parsed.decisions) ? parsed.decisions : [],
        };
      } catch {
        return null;
      }
    }
    return null;
  }
}

/**
 * Extract entities, relations, and decision candidates from a transcript chunk.
 *
 * @param {string} transcriptChunk - Raw transcript text from the current buffer.
 * @param {Object} [meetingContext]
 * @param {string} [meetingContext.meetingTitle]  - Title / topic of the meeting
 * @param {string} [meetingContext.participants]  - Comma-separated participant names
 * @param {string} [meetingContext.priorEntities] - Previously extracted entity labels
 *   (helps the model stay consistent with naming).
 * @returns {Promise<ExtractionResult>}
 */
export async function extractEntities(transcriptChunk, meetingContext = {}) {
  try {
    if (!transcriptChunk || transcriptChunk.trim().length < 5) {
      return EMPTY_RESULT;
    }

    // Build a user prompt with optional context.
    const contextParts = [];
    if (meetingContext.meetingTitle) {
      contextParts.push(`Meeting: ${meetingContext.meetingTitle}`);
    }
    if (meetingContext.participants) {
      contextParts.push(`Participants: ${meetingContext.participants}`);
    }
    if (meetingContext.priorEntities) {
      contextParts.push(`Previously seen entities: ${meetingContext.priorEntities}`);
    }

    const userPrompt = [
      ...(contextParts.length > 0 ? ['## Context', ...contextParts, ''] : []),
      '## Transcript chunk',
      transcriptChunk,
    ].join('\n');

    const response = await groq.chat.completions.create({
      model: FAST_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.1,
      max_tokens: 2048,
      response_format: { type: 'json_object' },
    });

    const raw = response.choices?.[0]?.message?.content ?? '';
    const parsed = safeParse(raw);

    if (!parsed) {
      console.warn('[extractor] Failed to parse LLM output:', raw.slice(0, 300));
      return EMPTY_RESULT;
    }

    return parsed;
  } catch (err) {
    console.error('[extractor] Entity extraction failed:', err.message);
    return EMPTY_RESULT;
  }
}
