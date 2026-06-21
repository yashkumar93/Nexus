/**
 * @module summarizer
 * @description Generates meeting summaries from transcript segments using Groq LLM.
 * Reads transcripts from Supabase, falls back to memory-store, then calls
 * the quality model for a structured summary with decisions and action items.
 */

import groq, { QUALITY_MODEL } from './groq-client.js';
import supabase from '../supabase.js';
import store from '../memory-store.js';

/* ─── System prompt ──────────────────────────────────────────────────── */

const SUMMARY_SYSTEM_PROMPT = `You are Nexus's Meeting Summarizer. Given a meeting transcript, produce a concise, actionable summary.

## Rules
1. Summarise the key discussion points in 2–4 paragraphs.
2. Extract every explicit DECISION made during the meeting.
3. Extract every ACTION ITEM with the responsible person (if mentioned).
4. Do NOT fabricate information. Only include what was said in the transcript.
5. Use professional, third-person language.

## Output format
Return ONLY valid JSON with these keys:
{
  "summary": "<narrative summary of the meeting>",
  "decisions": ["<decision 1>", "<decision 2>"],
  "actionItems": ["<person> will <action>", "<person> will <action>"]
}

Return ONLY valid JSON — no markdown fences, no extra text.`;

/**
 * Safely parse a JSON response from the LLM.
 * @param {string} raw
 * @returns {{ summary: string, decisions: string[], actionItems: string[] } | null}
 */
function safeParse(raw) {
  if (!raw) return null;
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  }
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

/**
 * Fetch all transcript segments for a meeting.
 * Tries Supabase first, then falls back to memory-store.
 *
 * @param {string} meetingId
 * @returns {Promise<Array<{ speaker: string, text: string, start: number }>>}
 */
async function fetchTranscript(meetingId) {
  // 1. Try Supabase
  try {
    const { data, error } = await supabase
      .from('transcript_segments')
      .select('speaker_name, text, start_ts')
      .eq('meeting_id', meetingId)
      .order('start_ts', { ascending: true });

    if (!error && data && data.length > 0) {
      return data.map((row) => ({
        speaker: row.speaker_name || 'Unknown',
        text: row.text,
        start: row.start_ts ?? 0,
      }));
    }
  } catch (err) {
    console.warn('[summarizer] Supabase transcript fetch failed:', err.message);
  }

  // 2. Fall back to memory-store
  try {
    const transcripts = store.getTranscripts(meetingId);
    if (transcripts && transcripts.length > 0) {
      return transcripts.map((t) => ({
        speaker: t.speaker || 'Unknown',
        text: t.text,
        start: t.start ?? 0,
      }));
    }
  } catch {
    // Silently ignore memory-store errors
  }

  return [];
}

/**
 * Format transcript segments into a readable text block for the LLM.
 * @param {Array<{ speaker: string, text: string, start: number }>} segments
 * @returns {string}
 */
function formatTranscriptForLLM(segments) {
  return segments
    .map((seg) => {
      const mins = Math.floor(seg.start / 60);
      const secs = Math.floor(seg.start % 60);
      const ts = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      return `[${ts}] ${seg.speaker}: ${seg.text}`;
    })
    .join('\n');
}

/**
 * Generate a meeting summary using Groq LLM.
 *
 * @param {string} meetingId - UUID of the meeting
 * @param {{ orgId?: string }} [context={}] - Additional context
 * @returns {Promise<{ summary: string, decisions: string[], actionItems: string[] }>}
 */
export async function generateMeetingSummary(meetingId, context = {}) {
  const segments = await fetchTranscript(meetingId);

  if (segments.length === 0) {
    console.warn(`[summarizer] No transcript segments found for meeting ${meetingId}`);
    return {
      summary: 'No transcript was captured for this meeting.',
      decisions: [],
      actionItems: [],
    };
  }

  const transcriptText = formatTranscriptForLLM(segments);

  // Fetch meeting title for context
  let meetingTitle = 'Meeting';
  try {
    const { data } = await supabase
      .from('meetings')
      .select('title')
      .eq('id', meetingId)
      .single();
    if (data?.title) meetingTitle = data.title;
  } catch {
    try {
      const meeting = store.getMeeting(meetingId);
      if (meeting?.title) meetingTitle = meeting.title;
    } catch {
      // Silently ignore
    }
  }

  const userPrompt = `## Meeting: ${meetingTitle}
## Transcript (${segments.length} segments)

${transcriptText}`;

  try {
    const response = await groq.chat.completions.create({
      model: QUALITY_MODEL,
      messages: [
        { role: 'system', content: SUMMARY_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 2048,
      response_format: { type: 'json_object' },
    });

    const raw = response.choices?.[0]?.message?.content ?? '';
    const parsed = safeParse(raw);

    if (!parsed) {
      console.warn('[summarizer] Failed to parse LLM output:', raw.slice(0, 300));
      return {
        summary: raw || 'Summary generation failed.',
        decisions: [],
        actionItems: [],
      };
    }

    return {
      summary: typeof parsed.summary === 'string' ? parsed.summary : '',
      decisions: Array.isArray(parsed.decisions) ? parsed.decisions : [],
      actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : [],
    };
  } catch (err) {
    console.error('[summarizer] Groq API call failed:', err.message);
    return {
      summary: 'Summary generation encountered an error. Please try again.',
      decisions: [],
      actionItems: [],
    };
  }
}
