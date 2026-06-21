'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LiveMeetingRoom from '@/components/meeting/LiveMeetingRoom';
import MeetingTranscriptViewer from '@/components/meeting/MeetingTranscriptViewer';

/**
 * Dynamic route page for meetings.
 * Determines the meeting status and renders the appropriate component:
 *  - 'live'  → LiveMeetingRoom
 *  - 'ended' → MeetingTranscriptViewer
 */
export default function MeetingPage() {
  const { id } = useParams();
  const { isLoading: authLoading, getAuthHeaders } = useAuth();

  const [status, setStatus] = useState(null); // 'live' | 'ended' | null
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading || !id) return;

    const fetchStatus = async () => {
      setLoading(true);
      setError(null);
      try {
        const headers = getAuthHeaders();
        const res = await fetch(`/api/meeting/${id}`, { headers });

        if (!res.ok) {
          throw new Error(
            res.status === 404
              ? 'Meeting not found'
              : `Failed to load meeting (${res.status})`
          );
        }

        const data = await res.json();
        setStatus(data.status || 'ended');

        // Set page title
        if (data.title) {
          document.title = `${data.title} — Nexus`;
        }
      } catch (err) {
        console.error('[MeetingPage] Failed to determine meeting status:', err);
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [id, authLoading, getAuthHeaders]);

  // ── Loading state ─────────────────────────────────────────────
  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#070708] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-border" />
            <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-transparent border-t-accent animate-spin" />
          </div>
          <p className="text-sm text-text-3 font-[family-name:var(--font-mono)]">
            Joining meeting…
          </p>
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
            <svg
              width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" className="text-danger"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-text-1 mb-2">
            Unable to load meeting
          </h2>
          <p className="text-sm text-text-3 mb-6">{error}</p>
        </div>
      </div>
    );
  }

  // ── Route to the correct component ────────────────────────────
  if (status === 'live') {
    return <LiveMeetingRoom meetingId={id} />;
  }

  return <MeetingTranscriptViewer meetingId={id} />;
}
