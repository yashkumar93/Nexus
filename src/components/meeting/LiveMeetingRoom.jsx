'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useMeeting } from '@/hooks/useMeeting';
import { useMicrophone } from '@/hooks/useMicrophone';
import MeetingSidebar from '@/components/meeting/MeetingSidebar';

/**
 * LiveMeetingRoom – Companion interface to record and listen to external meetings.
 * Connects to the browser mic to transcribe calls occurring on Zoom, Google Meet, Teams, etc.
 *
 * @param {Object} props
 * @param {string} props.meetingId
 */
export default function LiveMeetingRoom({ meetingId }) {
  const router = useRouter();
  const { user } = useAuth();
  const [meetingTitle, setMeetingTitle] = useState('Loading Meeting...');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [platform, setPlatform] = useState('zoom'); // zoom, meet, teams, manual
  const [captureMode, setCaptureMode] = useState('meeting');
  const [incomingSegments, setIncomingSegments] = useState([]);
  const [isEnding, setIsEnding] = useState(false);
  const [endError, setEndError] = useState(null);

  // useMeeting handles joining and leaving the socket room
  const { joinMeeting, leaveMeeting, endMeeting } = useMeeting();

  // useMicrophone hook to capture audio and upload slices
  const handleTranscript = useCallback((chunk) => {
    setIncomingSegments((current) => {
      const knownIds = new Set(current.map((segment) => segment.id));
      return [
        ...current,
        ...(chunk.segments || []).filter((segment) => !knownIds.has(segment.id)),
      ];
    });
  }, []);

  const {
    isRecording,
    isUploading,
    startRecording,
    stopRecording,
    error: micError,
    recordingUrl,
  } = useMicrophone(
    meetingId,
    handleTranscript
  );

  useEffect(() => {
    // Fetch meeting details
    const loadMeeting = async () => {
      try {
        const token = localStorage.getItem('nexus_access_token');
        const res = await fetch(`/api/meeting/${meetingId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setMeetingTitle(data.title);
          if (data.platform) {
            setPlatform(data.platform);
          }
        }
      } catch (err) {
        console.error('[LiveMeetingRoom] Failed to load meeting info:', err);
      }
    };

    loadMeeting();
    joinMeeting(meetingId);

    return () => {
      leaveMeeting();
      stopRecording();
    };
    // This effect owns the meeting room lifecycle. Re-running it when socket
    // callback identities change would leave and rejoin the same room.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId]);

  // Elapsed timer
  useEffect(() => {
    if (!isRecording) return undefined;
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isRecording]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleMicToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording(captureMode);
    }
  };

  const handleEndMeeting = async () => {
    if (isEnding) return;

    setIsEnding(true);
    setEndError(null);
    try {
      await stopRecording();

      const token = localStorage.getItem('nexus_access_token');
      const response = await fetch(`/api/meeting/${meetingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: 'ended' }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || 'Unable to end the meeting');
      }

      endMeeting();
      router.push('/dashboard');
      router.refresh();
    } catch (endingError) {
      console.error('[LiveMeetingRoom] Failed to end meeting:', endingError);
      setEndError(endingError.message || 'Unable to end the meeting');
      setIsEnding(false);
    }
  };

  const platformInfo = {
    zoom: { name: 'Zoom Meeting', icon: 'videocam', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    meet: { name: 'Google Meet', icon: 'video_call', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
    teams: { name: 'Microsoft Teams', icon: 'groups', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
    manual: { name: 'Local Audio / Mic Only', icon: 'mic', color: 'text-gray-400 bg-gray-500/10 border-gray-500/20' }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-bg text-text-1">
      {/* ── Main Workspace ────────────────────────────────────────── */}
      <div className={`flex-grow flex flex-col h-full transition-all duration-300 ${sidebarExpanded ? 'mr-[380px]' : 'mr-0'}`}>
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-6 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-text-3 hover:text-text-1 transition-colors flex items-center gap-1 text-sm font-semibold"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Dashboard
            </button>
            <div className="h-4 w-px bg-border" />
            <div>
              <h2 className="font-[family-name:var(--font-display)] font-bold text-text-1">
                {meetingTitle}
              </h2>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-text-3">
                <span className="font-mono">{formatTime(elapsedTime)}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <span className={`h-1.5 w-1.5 rounded-full ${isRecording ? 'bg-good animate-pulse' : 'bg-text-3'}`} />
                  {isRecording ? 'Recording' : isUploading ? 'Finishing transcript...' : 'Stopped'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {(micError || endError) && (
              <span className="max-w-xs text-xs text-danger font-semibold bg-danger/10 px-3 py-1.5 rounded-lg border border-danger/25">
                {endError || micError}
              </span>
            )}
            {recordingUrl && !isRecording && (
              <a
                href={recordingUrl}
                download={`${meetingTitle.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-recording.webm`}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface-3 text-text-2 transition-colors hover:bg-surface-2 hover:text-text-1"
                title="Download recording"
              >
                <span className="material-symbols-outlined">download</span>
              </a>
            )}
            <button
              onClick={handleMicToggle}
              className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
                isRecording
                  ? 'bg-good text-accent-ink hover:bg-good/95 shadow-lg shadow-good/20'
                  : 'bg-surface-3 hover:bg-surface-2 border border-border text-text-2'
              }`}
              title={isRecording ? 'Mute' : 'Unmute'}
            >
              <span className="material-symbols-outlined">
                {isRecording ? 'mic' : 'mic_off'}
              </span>
            </button>

            <button
              onClick={handleEndMeeting}
              disabled={isEnding}
              className="flex items-center gap-2 rounded-xl bg-danger hover:bg-danger-strong px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors shadow-lg shadow-danger/10 disabled:cursor-wait disabled:opacity-70"
            >
              <span className="material-symbols-outlined text-base">call_end</span>
              {isEnding ? 'Finishing...' : 'End Meeting'}
            </button>
          </div>
        </header>

        {/* Meeting Recorder Companion Interface */}
        <main className="flex-grow p-8 overflow-y-auto flex flex-col items-center justify-center bg-bg-soft">
          <div className="w-full max-w-2xl flex flex-col items-center text-center">
            
            {/* Pulsating Visual Wave / Record Button */}
            <div className="relative mb-8 flex items-center justify-center">
              {isRecording && (
                <>
                  <span className="absolute inline-flex h-32 w-32 rounded-full bg-accent/25 animate-ping opacity-75"></span>
                  <span className="absolute inline-flex h-40 w-40 rounded-full bg-accent/15 animate-pulse opacity-50"></span>
                </>
              )}
              <button
                onClick={handleMicToggle}
                className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all ${
                  isRecording 
                    ? 'bg-accent text-accent-ink hover:scale-105 shadow-xl shadow-accent-glow/50' 
                    : 'bg-surface-3 border border-border text-text-2 hover:bg-surface-2 hover:border-border-strong hover:scale-105'
                }`}
              >
                <span className="material-symbols-outlined text-3xl">
                  {isRecording ? 'graphic_eq' : 'mic'}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider mt-1">
                  {isRecording ? 'Recording' : 'Start'}
                </span>
              </button>
            </div>

            {/* Title & Capture Source */}
            <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] mb-3">
              {isRecording ? 'Listening to Call Audio' : 'Ready to Record Call'}
            </h1>

            <div className="mb-5 inline-flex rounded-lg border border-border bg-surface p-1">
              <button
                onClick={() => setCaptureMode('meeting')}
                disabled={isRecording}
                className={`flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold transition-colors ${
                  captureMode === 'meeting'
                    ? 'bg-surface-3 text-text-1'
                    : 'text-text-3 hover:text-text-2'
                }`}
              >
                <span className="material-symbols-outlined text-base">present_to_all</span>
                Meeting + microphone
              </button>
              <button
                onClick={() => setCaptureMode('microphone')}
                disabled={isRecording}
                className={`flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold transition-colors ${
                  captureMode === 'microphone'
                    ? 'bg-surface-3 text-text-1'
                    : 'text-text-3 hover:text-text-2'
                }`}
              >
                <span className="material-symbols-outlined text-base">mic</span>
                Microphone only
              </button>
            </div>

            <div className="flex justify-center gap-2 mb-8">
              {Object.keys(platformInfo).map((p) => {
                const active = platform === p;
                const info = platformInfo[p];
                return (
                  <button
                    key={p}
                    onClick={() => !isRecording && setPlatform(p)}
                    disabled={isRecording}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                      active 
                        ? `${info.color} scale-105` 
                        : 'text-text-3 border-border bg-surface hover:text-text-2 hover:bg-surface-2 disabled:opacity-50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">{info.icon}</span>
                    {info.name}
                  </button>
                );
              })}
            </div>

            {/* Capture guidance */}
            <div className="glass rounded-xl p-5 border border-border text-left w-full">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2 text-text-1">
                <span className="material-symbols-outlined text-accent text-lg">info</span>
                {captureMode === 'meeting' ? 'Share the meeting audio' : 'Microphone capture'}
              </h3>
              {captureMode === 'meeting' ? (
                <p className="text-xs leading-relaxed text-text-2">
                  After pressing Start, choose the browser tab or meeting window and enable
                  <strong className="text-text-1"> Share audio</strong>. Nexus mixes that audio with your
                  microphone, creates a local recording, and sends ordered 10-second chunks for transcription.
                </p>
              ) : (
                <p className="text-xs leading-relaxed text-text-2">
                  Nexus records your microphone only. Use this for in-person meetings or when the call audio is
                  already playing through speakers near your microphone.
                </p>
              )}
            </div>

          </div>
        </main>
      </div>

      {/* ── Sidebar ── */}
      <MeetingSidebar
        meetingId={meetingId}
        isExpanded={sidebarExpanded}
        onToggle={() => setSidebarExpanded(!sidebarExpanded)}
        incomingSegments={incomingSegments}
      />
    </div>
  );
}
