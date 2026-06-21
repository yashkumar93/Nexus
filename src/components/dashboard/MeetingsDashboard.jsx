'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function MeetingsDashboard() {
  const { user, getAuthHeaders } = useAuth();
  const router = useRouter();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchMeetings = async () => {
    try {
      const res = await fetch('/api/meeting', {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setMeetings(data);
      }
    } catch (err) {
      console.error('[MeetingsDashboard] Failed to fetch meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleStartMeeting = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/meeting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ title: newTitle.trim() }),
      });
      if (res.ok) {
        const meeting = await res.json();
        router.push(`/meeting/${meeting.id}`);
      }
    } catch (err) {
      console.error('[MeetingsDashboard] Failed to create meeting:', err);
    } finally {
      setCreating(false);
      setShowModal(false);
      setNewTitle('');
    }
  };

  // Derive stats
  const totalMeetings = meetings.length;
  const activeMeetings = meetings.filter((m) => m.status === 'live').length;
  const endedMeetings = meetings.filter((m) => m.status === 'ended').length;

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 animate-fade-in text-text-1">
      {/* ── Welcome Header ─────────────────────────────────────────── */}
      <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-text-1">
            Welcome back, {user?.name || 'User'}
          </h1>
          <p className="text-sm text-text-3 mt-1">
            Here is what has happened in your organization's memory today.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-accent-strong hover:bg-accent px-5 py-3 text-sm font-semibold text-accent-ink transition-all shadow-lg hover:shadow-accent-glow/20"
        >
          <span className="material-symbols-outlined text-lg">add_circle</span>
          Start New Meeting
        </button>
      </div>

      {/* ── Stats Grid ────────────────────────────────────────────── */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        <div className="glass rounded-xl p-5 border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Meetings</span>
            <span className="material-symbols-outlined text-accent">video_camera_front</span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold">{totalMeetings}</span>
            <span className="text-xs text-text-3 block mt-1">Stored in Memory</span>
          </div>
        </div>

        <div className="glass rounded-xl p-5 border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Meetings</span>
            <span className="material-symbols-outlined text-good animate-pulse">sensors</span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-good">{activeMeetings}</span>
            <span className="text-xs text-text-3 block mt-1">Streaming Live</span>
          </div>
        </div>

        <div className="glass rounded-xl p-5 border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Decisions Captured</span>
            <span className="material-symbols-outlined text-accent">verified</span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold">12</span>
            <span className="text-xs text-text-3 block mt-1">+4 this week</span>
          </div>
        </div>

        <div className="glass rounded-xl p-5 border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Contradictions Caught</span>
            <span className="material-symbols-outlined text-warn">warning</span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-warn">3</span>
            <span className="text-xs text-text-3 block mt-1">Requires review</span>
          </div>
        </div>
      </div>

      {/* ── Meetings List ─────────────────────────────────────────── */}
      <div className="glass rounded-2xl border border-border p-6">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-text-2">history</span>
          Recent Conversations
        </h2>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <svg className="animate-spin h-6 w-6 text-accent-strong" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : meetings.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed border-border text-center">
            <span className="material-symbols-outlined text-3xl text-text-3 mb-2">video_chat</span>
            <span className="text-sm text-text-2">No meetings yet</span>
            <p className="text-xs text-text-3 mt-1">Start a new meeting to populate the organization's memory.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {meetings.map((meeting) => (
              <div
                key={meeting.id}
                onClick={() => router.push(meeting.status === 'live' ? `/meeting/${meeting.id}` : `/meeting/${meeting.id}`)}
                className="group relative flex flex-col justify-between gap-4 rounded-xl border border-border bg-surface hover:bg-surface-2 p-5 transition-all duration-200 cursor-pointer hover:border-border-strong sm:flex-row sm:items-center"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-[family-name:var(--font-display)] font-semibold text-text-1 group-hover:text-accent transition-colors">
                      {meeting.title}
                    </h3>
                    {meeting.status === 'live' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-good/15 px-2.5 py-0.5 text-xs font-semibold text-good">
                        <span className="h-1.5 w-1.5 rounded-full bg-good animate-ping"></span>
                        Live
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-text-3/15 px-2.5 py-0.5 text-xs font-semibold text-text-3">
                        Ended
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-3 mt-1 font-[family-name:var(--font-mono)]">
                    {meeting.date} · {meeting.id.slice(0, 8)}
                  </p>
                  {meeting.summary && (
                    <p className="text-sm text-text-2 mt-2 leading-relaxed max-w-2xl line-clamp-1">
                      {meeting.summary}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className="text-xs font-semibold uppercase tracking-wider text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                    {meeting.status === 'live' ? 'Join Session' : 'View Memory'}
                  </span>
                  <span className="material-symbols-outlined text-text-3 group-hover:text-accent transition-colors">
                    chevron_right
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Start Meeting Modal ────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl animate-card-pop">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <h3 className="font-[family-name:var(--font-display)] text-lg font-bold">
                Start New Meeting
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-text-3 hover:text-text-1 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleStartMeeting}>
              <div className="mb-6">
                <label className="block text-xs font-semibold text-text-3 uppercase tracking-wider mb-2">
                  Meeting Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q3 Roadmap Planning"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-text-1 focus:border-accent-strong focus:outline-none focus:ring-1 focus:ring-accent-strong"
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-text-2 hover:bg-surface-2 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newTitle.trim()}
                  className="flex items-center gap-2 rounded-xl bg-accent-strong hover:bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition-colors disabled:opacity-50"
                >
                  {creating ? (
                    <svg className="animate-spin h-4 w-4 text-accent-ink" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <span className="material-symbols-outlined text-sm">play_arrow</span>
                  )}
                  Launch Live Meeting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
