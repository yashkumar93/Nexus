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

/**
 * Transcribe an audio blob/buffer using Groq Whisper.
 *
 * @param {Blob|Buffer|File} audioBlob - Audio data to transcribe.
 *   Accepted formats: mp3, mp4, mpeg, mpga, m4a, wav, webm.
 * @param {Object} [options]
 * @param {string} [options.language]   - ISO-639-1 language hint (e.g. "en").
 * @param {string} [options.prompt]     - Optional prompt to guide the model
 *   (useful for domain-specific vocabulary).
 * @param {string} [options.fileName]   - Original upload filename.
 * @param {string} [options.mimeType]   - Original upload MIME type.
 * @returns {Promise<TranscriptionResult>}
 */
export async function transcribeAudio(audioBlob, options = {}) {
  if (!audioBlob) {
    throw new Error('No audio data was provided for transcription');
  }

  // Preserve the browser's container metadata. Whisper uses both the filename
  // and MIME type to decode uploads.
  let file = audioBlob;
  if (Buffer.isBuffer(audioBlob)) {
    file = new File(
      [audioBlob],
      options.fileName || 'audio.webm',
      { type: options.mimeType || 'audio/webm' }
    );
  } else if (audioBlob instanceof Blob && !(audioBlob instanceof File)) {
    file = new File(
      [audioBlob],
      options.fileName || 'audio.webm',
      { type: options.mimeType || audioBlob.type || 'audio/webm' }
    );
  }

  const response = await groq.audio.transcriptions.create({
    file,
    model: WHISPER_MODEL,
    response_format: 'verbose_json',
    temperature: 0,
    ...(options.language && { language: options.language }),
    ...(options.prompt && { prompt: options.prompt }),
  });

  const text = (response.text ?? '').trim();
  const segments = (response.segments ?? [])
    .map((seg) => ({
      start: Number(seg.start) || 0,
      end: Number(seg.end) || 0,
      text: (seg.text ?? '').trim(),
    }))
    .filter((segment) => segment.text);

  return { text, segments };
}
