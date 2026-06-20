'use client';

import { useEffect, useRef, useState } from 'react';

export default function TranscriptFeed({ transcript, isLive }) {
  const feedRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Auto-scroll to bottom on new content
  useEffect(() => {
    if (autoScroll && feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [transcript, autoScroll]);

  // Detect manual scroll
  const handleScroll = () => {
    if (!feedRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = feedRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 60;
    setAutoScroll(isNearBottom);
  };

  if (isCollapsed) {
    return (
      <button
        onClick={() => setIsCollapsed(false)}
        className="w-full px-4 py-2 flex items-center gap-2 text-xs text-text-3 hover:text-text-2 hover:bg-surface transition-all"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
        <span className="font-[family-name:var(--font-mono)]">
          {transcript.length} transcript lines
        </span>
        {isLive && <span className="live-dot ml-auto" />}
      </button>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="eyebrow">Transcript</span>
          {isLive && (
            <span className="flex items-center gap-1.5 text-[10px] font-[family-name:var(--font-mono)] text-accent">
              <span className="live-dot" style={{ width: 6, height: 6 }} />
              LIVE
            </span>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          className="text-text-3 hover:text-text-1 transition-colors"
          title="Collapse transcript"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
      </div>

      {/* Feed */}
      <div
        ref={feedRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 pb-3 space-y-0.5"
      >
        {transcript.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-text-3 text-sm">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3 opacity-40">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
            <p className="font-[family-name:var(--font-mono)] text-xs">Waiting for audio...</p>
          </div>
        ) : (
          transcript.map((line, idx) => (
            <div
              key={line.id || idx}
              className="transcript-line group"
            >
              <div className="flex items-center gap-2 mb-0.5">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-none"
                  style={{
                    backgroundColor: `${line.speakerColor}20`,
                    color: line.speakerColor,
                  }}
                >
                  {(line.speaker || '?')[0].toUpperCase()}
                </div>
                <span
                  className="text-xs font-medium"
                  style={{ color: line.speakerColor }}
                >
                  {line.speaker || 'Unknown'}
                </span>
                <span className="text-[10px] font-[family-name:var(--font-mono)] text-text-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                  {formatTime(line.timestamp)}
                </span>
              </div>
              <p className="text-sm text-text-2 pl-7 leading-relaxed">
                {line.text}
              </p>
            </div>
          ))
        )}

        {/* Typing indicator when live */}
        {isLive && transcript.length > 0 && (
          <div className="pl-7 pt-2">
            <div className="typing-indicator">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
      </div>

      {/* Scroll to bottom button */}
      {!autoScroll && (
        <button
          onClick={() => {
            setAutoScroll(true);
            if (feedRef.current) {
              feedRef.current.scrollTop = feedRef.current.scrollHeight;
            }
          }}
          className="absolute bottom-16 right-6 w-8 h-8 rounded-full bg-surface-2 border border-border-strong flex items-center justify-center text-text-2 hover:text-accent hover:border-accent transition-all shadow-lg animate-fade-in"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      )}
    </div>
  );
}

function formatTime(seconds) {
  if (seconds == null) return '';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
