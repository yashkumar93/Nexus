/**
 * @module contradiction
 * @description Contradiction Detector (Mode 3) — classifies new decisions
 * against the existing decision corpus to detect refinements, contradictions,
 * or consistency. Uses the quality model for accuracy.
 */

import groq, { QUALITY_MODEL } from './groq-client.js';
import { query } from '../db.js';

/**
 * @typedef {'consistent'|'refines'|'contradicts'|'unrelated'} Classification
 */

/**
 * @typedef {Object} ContradictionResult
 * @property {Classification} classification         - How the new decision relates to existing ones
 * @property {number}         confidence              - 0–1 confidence in the classification
 * @property {string}         rationale               - Human-readable explanation
 * @property {string|null}    contradicted_decision_id - ID of the contradicted/refined decision (if any)
 */

/**
 * @typedef {Object} ExistingDecision
 * @property {string} id         - Decision node UUID
 * @property {string} label      - Short label
 * @property {string} claim_text - Full decision text
 * @property {string} status     - "active" | "superseded" | "revoked"
 * @property {string} created_at - ISO timestamp
 */

/* ─── System prompt (matches PRD §12.6) ────────────────────────────── */

const CONTRADICTION_SYSTEM_PROMPT = `You are Continuum's Contradiction Detector. You compare a NEW decision against a set of EXISTING decisions and classify their relationship.

## Classification labels
- **consistent**  — The new decision is compatible with all existing decisions. No conflict.
- **refines**     — The new decision adds specificity, narrows scope, or updates an existing decision without reversing it.
- **contradicts** — The new decision directly conflicts with or reverses an existing decision.
- **unrelated**   — The new decision is on a different topic entirely and has no meaningful relationship to the existing decisions.

## Output schema (strict JSON, no markdown)
{
  "classification": "<consistent|refines|contradicts|unrelated>",
  "confidence": <0.0-1.0>,
  "rationale": "<2-3 sentence explanation of why you chose this classification>",
  "contradicted_decision_id": "<id of the most relevant existing decision, or null if consistent/unrelated>"
}

## Rules
1. Return ONLY valid JSON — no prose, no markdown fences.
2. Compare semantics, not surface wording. Two decisions can use different words but still conflict.
3. Consider temporal context: a newer decision about the same topic that changes direction is a contradiction; one that adds detail is a refinement.
4. If multiple existing decisions are relevant, focus on the one with the strongest conflict/refinement relationship.
5. "contradicted_decision_id" should be null for "consistent" and "unrelated" classifications.
6. Be conservative: only classify as "contradicts" when there is a genuine reversal, not just a difference in emphasis.`;

/** Stable empty/default result. */
const DEFAULT_RESULT = Object.freeze({
  classification: 'unrelated',
  confidence: 0,
  rationale: 'Unable to perform contradiction analysis.',
  contradicted_decision_id: null,
});

/**
 * Safely parse JSON from LLM output.
 * @param {string} raw
 * @returns {ContradictionResult|null}
 */
function safeParse(raw) {
  if (!raw) return null;
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  }
  try {
    const parsed = JSON.parse(cleaned);
    const validClassifications = ['consistent', 'refines', 'contradicts', 'unrelated'];
    return {
      classification: validClassifications.includes(parsed.classification)
        ? parsed.classification
        : 'unrelated',
      confidence: typeof parsed.confidence === 'number'
        ? Math.max(0, Math.min(1, parsed.confidence))
        : 0,
      rationale: typeof parsed.rationale === 'string'
        ? parsed.rationale
        : '',
      contradicted_decision_id: parsed.contradicted_decision_id ?? null,
    };
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return safeParse(match[0]); // recurse once on extracted object
      } catch {
        return null;
      }
    }
    return null;
  }
}

/* ─── Public API ───────────────────────────────────────────────────── */

/**
 * Find active decisions in the knowledge graph that share a topic
 * with the given entity label.
 *
 * @param {string}   entityLabel - Topic or entity to search for
 * @param {string[]} teamIds     - Team UUIDs for access scoping
 * @returns {Promise<ExistingDecision[]>}
 */
export async function findRelatedDecisions(entityLabel, teamIds) {
  try {
    if (!entityLabel?.trim() || !teamIds?.length) {
      return [];
    }

    // Find decisions connected to the matching entity, or decisions whose
    // label / properties mention the entity label (fuzzy).
    const result = await query(
      `SELECT DISTINCT ON (kn.id)
         kn.id,
         kn.label,
         kn.properties->>'claim_text' AS claim_text,
         kn.status,
         kn.created_at
       FROM knowledge_nodes kn
       WHERE kn.team_id = ANY($1::uuid[])
         AND kn.type = 'decision'
         AND kn.status = 'active'
         AND (
           kn.label ILIKE '%' || $2 || '%'
           OR kn.properties->>'claim_text' ILIKE '%' || $2 || '%'
           OR kn.id IN (
             SELECT ke.source_id FROM knowledge_edges ke
             JOIN knowledge_nodes kn2 ON kn2.id = ke.target_id
             WHERE kn2.label ILIKE '%' || $2 || '%'
             UNION
             SELECT ke.target_id FROM knowledge_edges ke
             JOIN knowledge_nodes kn2 ON kn2.id = ke.source_id
             WHERE kn2.label ILIKE '%' || $2 || '%'
           )
         )
       ORDER BY kn.id, kn.created_at DESC
       LIMIT 20`,
      [teamIds, entityLabel.trim()]
    );

    return result.rows.map((row) => ({
      id: row.id,
      label: row.label,
      claim_text: row.claim_text || row.label,
      status: row.status,
      created_at: row.created_at,
    }));
  } catch (err) {
    console.error('[contradiction] findRelatedDecisions failed:', err.message);
    return [];
  }
}

/**
 * Detect whether a new decision contradicts, refines, or is consistent
 * with existing decisions.
 *
 * @param {Object}             newDecision       - The new decision to evaluate
 * @param {string}             newDecision.claim_text - Full decision text
 * @param {string}             [newDecision.speaker]  - Speaker who made it
 * @param {ExistingDecision[]} existingDecisions - Corpus of existing decisions
 * @returns {Promise<ContradictionResult>}
 */
export async function detectContradiction(newDecision, existingDecisions) {
  try {
    if (!newDecision?.claim_text?.trim()) {
      return DEFAULT_RESULT;
    }

    if (!existingDecisions || existingDecisions.length === 0) {
      return {
        classification: 'consistent',
        confidence: 1.0,
        rationale: 'No existing decisions found to compare against. The new decision is consistent by default.',
        contradicted_decision_id: null,
      };
    }

    // Format existing decisions for the prompt.
    const existingBlock = existingDecisions
      .map((d, i) => {
        const created = d.created_at
          ? new Date(d.created_at).toISOString().split('T')[0]
          : 'unknown date';
        return `[${i + 1}] ID: ${d.id}\n    Label: ${d.label}\n    Decision: ${d.claim_text}\n    Status: ${d.status}\n    Date: ${created}`;
      })
      .join('\n\n');

    const userPrompt = `## NEW DECISION
Speaker: ${newDecision.speaker || 'Unknown'}
Decision: ${newDecision.claim_text}

## EXISTING DECISIONS
${existingBlock}`;

    const response = await groq.chat.completions.create({
      model: QUALITY_MODEL,
      messages: [
        { role: 'system', content: CONTRADICTION_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.1,
      max_tokens: 1024,
      response_format: { type: 'json_object' },
    });

    const raw = response.choices?.[0]?.message?.content ?? '';
    const parsed = safeParse(raw);

    if (!parsed) {
      console.warn('[contradiction] Failed to parse LLM output:', raw.slice(0, 300));
      return DEFAULT_RESULT;
    }

    // Validate that contradicted_decision_id actually matches one of the
    // provided decisions (prevent hallucinated IDs).
    if (parsed.contradicted_decision_id) {
      const validIds = new Set(existingDecisions.map((d) => d.id));
      if (!validIds.has(parsed.contradicted_decision_id)) {
        // Try to find the closest match by index reference.
        const idxMatch = parsed.rationale?.match(/\[(\d+)\]/);
        if (idxMatch) {
          const idx = parseInt(idxMatch[1], 10) - 1;
          if (idx >= 0 && idx < existingDecisions.length) {
            parsed.contradicted_decision_id = existingDecisions[idx].id;
          } else {
            parsed.contradicted_decision_id = null;
          }
        } else {
          parsed.contradicted_decision_id = null;
        }
      }
    }

    return parsed;
  } catch (err) {
    console.error('[contradiction] Detection failed:', err.message);
    return DEFAULT_RESULT;
  }
}

/**
 * Socket.IO helper: infer a decision candidate from a transcript chunk,
 * compare it with active decisions, and shape sidebar cards.
 *
 * @param {string} text
 * @param {{ teamIds?: string[], speaker?: string, meetingId?: string }} context
 * @returns {Promise<Array>}
 */
export async function detectContradictions(text, context = {}) {
  if (!text?.trim()) return [];

  const decisionSignals = [
    "let's ",
    'we should ',
    'we will ',
    'we decided',
    'the plan is',
    'go with',
    'commit',
  ];

  const lower = text.toLowerCase();
  if (!decisionSignals.some((signal) => lower.includes(signal))) {
    return [];
  }

  const teamIds = Array.isArray(context.teamIds) ? context.teamIds : [];
  if (teamIds.length === 0) return [];

  const topic = lower.includes('vendor') || lower.includes('payment')
    ? 'payments vendor'
    : text.split(/\s+/).slice(0, 5).join(' ');

  const existing = await findRelatedDecisions(topic, teamIds);
  const result = await detectContradiction(
    { claim_text: text, speaker: context.speaker || 'Unknown' },
    existing
  );

  if (result.classification !== 'contradicts' || result.confidence < 0.7) {
    return [];
  }

  const stored = existing.find((decision) => decision.id === result.contradicted_decision_id) || existing[0];

  return [{
    id: `contradiction_${Date.now()}`,
    confidence: result.confidence,
    rationale: result.rationale,
    statement_a: stored?.claim_text || stored?.label || 'Existing active decision',
    statement_b: text,
    sources: [
      { label: stored?.label || 'Stored decision', date: stored?.created_at },
      { label: 'Live meeting', date: new Date().toISOString() },
    ],
  }];
}
