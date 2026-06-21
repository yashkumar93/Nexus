/**
 * @module groq-client
 * @description Initialises the Groq SDK client and exports model constants
 * used across the Nexus AI pipeline.
 */

import Groq from 'groq-sdk';

/**
 * Singleton Groq client.
 * Reads GROQ_API_KEY from the environment automatically.
 */
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/* ─── Model constants ──────────────────────────────────────────────── */

/** Fast model for real-time extraction (entity/relation parsing). */
export const FAST_MODEL = 'llama-3.1-8b-instant';

/** High-quality model for synthesis and contradiction detection. */
export const QUALITY_MODEL = 'llama-3.3-70b-versatile';

/** Model for RAG synthesis. */
export const RAG_MODEL = 'llama-3.1-8b-instant';

/** Whisper model for speech-to-text transcription. */
export const WHISPER_MODEL = 'whisper-large-v3';

export default groq;
