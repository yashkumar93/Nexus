/**
 * @module transcription
 * @description Audio transcription via Groq Whisper (whisper-large-v3).
 * Converts audio blobs/buffers into text with timestamped segments.
 */

import groq, { WHISPER_MODEL } from './groq-client.js';

/**
 * @typedef {Object} TranscriptSegment
 * @property {number} start  - Segment start time in seconds
 * @property {number} end    - Segment end time in seconds
 * @property {string} text   - Transcribed text for this segment
 */

/**
 * @typedef {Object} TranscriptionResult
 * @property {string} text                - Full transcribed text
 * @property {TranscriptSegment[]} segments - Timestamped segments
 */

/** Empty result returned on failure so callers always get a stable shape. */
const EMPTY_RESULT = Object.freeze({ text: '', segments: [] });

/**
 * Transcribe an audio blob/buffer using Groq Whisper.
 *
 * @param {Blob|Buffer|File} audioBlob - Audio data to transcribe.
 *   Accepted formats: mp3, mp4, mpeg, mpga, m4a, wav, webm.
 * @param {Object} [options]
 * @param {string} [options.language]   - ISO-639-1 language hint (e.g. "en").
 * @param {string} [options.prompt]     - Optional prompt to guide the model
 *   (useful for domain-specific vocabulary).
 * @returns {Promise<TranscriptionResult>}
 */
export async function transcribeAudio(audioBlob, options = {}) {
  try {
    if (!audioBlob) {
      console.warn('[transcription] No audio blob provided');
      return EMPTY_RESULT;
    }

    // Normalise into a File-like object the SDK can consume.
    let file = audioBlob;
    if (Buffer.isBuffer(audioBlob)) {
      file = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });
    } else if (audioBlob instanceof Blob && !(audioBlob instanceof File)) {
      file = new File([audioBlob], 'audio.webm', { type: audioBlob.type || 'audio/webm' });
    }

    // Request verbose_json to get segment-level timestamps.
    const response = await groq.audio.transcriptions.create({
      file,
      model: WHISPER_MODEL,
      response_format: 'verbose_json',
      ...(options.language && { language: options.language }),
      ...(options.prompt && { prompt: options.prompt }),
    });

    const text = response.text ?? '';
    const segments = (response.segments ?? []).map((seg) => ({
      start: seg.start ?? 0,
      end: seg.end ?? 0,
      text: (seg.text ?? '').trim(),
    }));

    return { text, segments };
  } catch (err) {
    console.error('[transcription] Whisper transcription failed:', err.message);
    return EMPTY_RESULT;
  }
}
