'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

/**
 * Speaker color palette – deterministic mapping from speakerId to a color.
 * Ensures each speaker gets a consistent, visually distinct hue.
 */
const SPEAKER_COLORS = [
  '#6C8EEF', // periwinkle
  '#E879A8', // rose
  '#5CD4B0', // teal
  '#E8A855', // amber
  '#B57CED', // violet
  '#5BB8E8', // sky
  '#EC6D5F', // coral
  '#82D465', // lime
];

function getSpeakerColor(speakerId, speakerIndex) {
  if (!speakerId) return SPEAKER_COLORS[speakerIndex % SPEAKER_COLORS.length];
  let hash = 0;
  for (let i = 0; i < speakerId.length; i++) {
    hash = speakerId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return SPEAKER_COLORS[Math.abs(hash) % SPEAKER_COLORS.length];
}

/**
 * Format seconds into mm:ss (or h:mm:ss if >= 1 hour).
 */
function formatTimestamp(seconds) {
  if (seconds == null) return '';
  const totalSecs = Math.floor(seconds);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format an ISO date string to a human-readable date.
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * MeetingTranscriptViewer – Premium, read-only viewer for ended meetings.
 *
 * @param {Object} props
 * @param {string} props.meetingId
 */
export default function MeetingTranscriptViewer({ meetingId }) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, getAuthHeaders } = useAuth();

  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const transcriptRef = useRef(null);

  // ── Fetch meeting data ────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;

    const fetchMeeting = async () => {
      setLoading(true);
      setError(null);
      try {
        const headers = getAuthHeaders();
        const res = await fetch(`/api/meeting/${meetingId}`, { headers });

        if (!res.ok) {
          throw new Error(res.status === 404 ? 'Meeting not found' : `Failed to load meeting (${res.status})`);
        }

        const data = await res.json();
        setMeeting(data);
      } catch (err) {
        console.error('[MeetingTranscriptViewer] Failed to fetch meeting:', err);
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchMeeting();
  }, [meetingId, authLoading, getAuthHeaders]);

  // ── Build speaker index for consistent coloring ───────────────
  const speakerMap = {};
  let speakerIdx = 0;
  if (meeting?.transcript) {
    for (const seg of meeting.transcript) {
      const key = seg.speakerId || seg.speaker || 'unknown';
      if (!(key in speakerMap)) {
        speakerMap[key] = {
          index: speakerIdx,
          color: getSpeakerColor(seg.speakerId, speakerIdx),
        };
        speakerIdx++;
      }
    }
  }

  // ── Loading state ─────────────────────────────────────────────
  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#070708] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-border" />
            <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-transparent border-t-accent animate-spin" />
          </div>
          <p className="text-sm text-text-3 font-[family-name:var(--font-mono)]">Loading transcript…</p>
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-[#070708] flex items-center justify-center">
        <div className="bg-[#0e0e11] border border-border rounded-2xl p-8 max-w-md text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-danger/10 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-danger">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-text-1 mb-2">Unable to load meeting</h2>
          <p className="text-sm text-text-3 mb-6">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-5 py-2.5 rounded-xl bg-surface-3 border border-border text-sm font-semibold text-text-2 hover:text-text-1 hover:bg-surface-2 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const transcript = meeting?.transcript || [];

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#070708] text-text-1">
      {/* Background gradient overlay */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/3 w-[600px] h-[400px] bg-accent/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[350px] bg-accent/[0.02] rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* ── Header ─────────────────────────────────────────── */}
        <header className="mb-8">
          {/* Back button */}
          <button
            onClick={() => router.push('/dashboard')}
            className="group flex items-center gap-2 text-sm text-text-3 hover:text-text-1 transition-colors mb-6"
          >
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className="transition-transform group-hover:-translate-x-0.5"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span className="font-semibold">Dashboard</span>
          </button>

          {/* Title row */}
          <div className="bg-[#0e0e11] border border-border rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
              {/* Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-text-1 font-[family-name:var(--font-display)] truncate">
                  {meeting?.title || 'Untitled Meeting'}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-text-3">
                  {meeting?.date && (
                    <span className="flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      {formatDate(meeting.date)}
                    </span>
                  )}
                  {transcript.length > 0 && (
                    <span className="flex items-center gap-1.5 font-[family-name:var(--font-mono)]">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {formatTimestamp(transcript[transcript.length - 1]?.end || transcript[transcript.length - 1]?.start || 0)} total
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 font-[family-name:var(--font-mono)]">
                    {transcript.length} segment{transcript.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2 shrink-0">
                {meeting?.platform && (
                  <span className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-surface-3 border border-border text-text-2">
                    {meeting.platform}
                  </span>
                )}
                <span className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-text-3/10 text-text-3 border border-border">
                  {meeting?.status || 'ended'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* ── Summary Section ────────────────────────────────── */}
        {meeting?.summary && (
          <section className="mb-8 animate-[fadeIn_0.4s_ease-out]">
            <div className="bg-[#0e0e11] border border-border rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                <span className="text-xs font-bold uppercase tracking-wider text-text-2">Meeting Summary</span>
              </div>
              <div className="px-6 py-5">
                <p className="text-sm text-text-2 leading-relaxed whitespace-pre-wrap">
                  {meeting.summary}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ── Transcript Section ─────────────────────────────── */}
        <section className="animate-[fadeIn_0.5s_ease-out]">
          <div className="bg-[#0e0e11] border border-border rounded-2xl overflow-hidden">
            {/* Section header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span className="text-xs font-bold uppercase tracking-wider text-text-2">Full Transcript</span>
              </div>
              {/* Speaker legend */}
              {Object.keys(speakerMap).length > 0 && (
                <div className="hidden sm:flex items-center gap-3">
                  {Object.entries(speakerMap).map(([key, { color }]) => {
                    const displayName = meeting.transcript.find(
                      (s) => (s.speakerId || s.speaker || 'unknown') === key
                    )?.speaker || key;
                    return (
                      <span key={key} className="flex items-center gap-1.5 text-[10px] text-text-3">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        {displayName}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Transcript content */}
            {transcript.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-20 text-text-3">
                <svg
                  width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="1.5" className="mb-4 opacity-30"
                >
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
                <p className="text-sm font-[family-name:var(--font-mono)]">No transcript available</p>
                <p className="text-xs text-text-3/60 mt-1">This meeting has no recorded segments.</p>
              </div>
            ) : (
              /* Transcript list */
              <div ref={transcriptRef} className="max-h-[600px] overflow-y-auto">
                <div className="divide-y divide-border/50">
                  {transcript.map((seg, idx) => {
                    const speakerKey = seg.speakerId || seg.speaker || 'unknown';
                    const speaker = speakerMap[speakerKey] || { index: 0, color: SPEAKER_COLORS[0] };
                    const isEvenSpeaker = speaker.index % 2 === 0;

                    return (
                      <div
                        key={seg.id || idx}
                        className={`group px-6 py-4 transition-colors hover:bg-white/[0.02] ${
                          isEvenSpeaker ? 'bg-transparent' : 'bg-[#070708]/50'
                        }`}
                        style={{
                          animationDelay: `${Math.min(idx * 30, 600)}ms`,
                        }}
                      >
                        <div className="flex items-start gap-3">
                          {/* Speaker avatar */}
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                            style={{
                              backgroundColor: `${speaker.color}15`,
                              color: speaker.color,
                              border: `1px solid ${speaker.color}30`,
                            }}
                          >
                            {(seg.speaker || '?')[0].toUpperCase()}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className="text-sm font-semibold"
                                style={{ color: speaker.color }}
                              >
                                {seg.speaker || 'Unknown'}
                              </span>
                              <span className="text-[10px] font-[family-name:var(--font-mono)] text-text-3 opacity-60 group-hover:opacity-100 transition-opacity">
                                {formatTimestamp(seg.start)}
                                {seg.end != null && seg.end > seg.start && ` – ${formatTimestamp(seg.end)}`}
                              </span>
                            </div>
                            <p className="text-sm text-text-2 leading-relaxed">
                              {seg.text}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── Footer spacer ──────────────────────────────────── */}
        <div className="h-12" />
      </div>

      {/* Inline keyframe for fade-in animation */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
