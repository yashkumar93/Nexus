'use client';

/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import TranscriptFeed from '@/components/meeting/TranscriptFeed';
import ContextCard from '@/components/meeting/ContextCard';
import ContradictionCard from '@/components/meeting/ContradictionCard';
import AskMemoryInput from '@/components/meeting/AskMemoryInput';
import MeetingSummary from '@/components/meeting/MeetingSummary';

export default function MeetingSidebar({ meetingId, isExpanded, onToggle, incomingSegments = [] }) {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const [transcript, setTranscript] = useState([]);
  const [contextCards, setContextCards] = useState([]);
  const [contradictionCards, setContradictionCards] = useState([]);
  const [queryAnswers, setQueryAnswers] = useState([]);
  const [isQuerying, setIsQuerying] = useState(false);
  const [meetingEnded, setMeetingEnded] = useState(false);
  const [summary, setSummary] = useState(null);
  const [newCardCount, setNewCardCount] = useState(0);
  const sidebarRef = useRef(null);

  const appendTranscriptSegments = useCallback((segments) => {
    setTranscript((current) => {
      const knownIds = new Set(current.map((segment) => segment.id));
      const additions = segments
        .filter((segment) => segment?.text && !knownIds.has(segment.id))
        .map((segment) => ({
          id: segment.id || crypto.randomUUID(),
          speaker: segment.speaker || 'Meeting audio',
          text: segment.text,
          start: Number(segment.start ?? segment.start_ts ?? segment.timestamp) || 0,
          end: Number(segment.end ?? segment.end_ts ?? segment.start ?? segment.start_ts ?? segment.timestamp) || 0,
          speakerColor: getSpeakerColor(segment.speaker || 'Meeting audio'),
        }));
      return additions.length ? [...current, ...additions].sort((a, b) => a.start - b.start) : current;
    });
  }, []);

  useEffect(() => {
    const loadTranscript = async () => {
      const token = localStorage.getItem('nexus_access_token');
      const response = await fetch(`/api/meeting/${meetingId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) return;
      const meeting = await response.json();
      appendTranscriptSegments(meeting.transcript || []);
    };

    loadTranscript().catch((loadError) => {
      console.warn('[MeetingSidebar] Failed to load transcript:', loadError.message);
    });
  }, [appendTranscriptSegments, meetingId]);

  useEffect(() => {
    appendTranscriptSegments(incomingSegments);
  }, [appendTranscriptSegments, incomingSegments]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleTranscriptChunk = (chunk) => {
      appendTranscriptSegments([chunk]);
    };

    const handleContextCard = (card) => {
      setContextCards(prev => [...prev, {
        ...card,
        id: card.id || Date.now().toString(),
        dismissed: false,
      }]);
      if (!isExpanded) setNewCardCount(c => c + 1);
    };

    const handleContradictionCard = (card) => {
      setContradictionCards(prev => [...prev, {
        ...card,
        id: card.id || Date.now().toString(),
        resolved: false,
      }]);
      if (!isExpanded) setNewCardCount(c => c + 1);
    };

    const handleQueryAnswer = (answer) => {
      setQueryAnswers(prev => [...prev, answer]);
      setIsQuerying(false);
    };

    const handleMeetingEnd = (data) => {
      setMeetingEnded(true);
      setSummary(data.summary);
    };

    socket.on('transcript:chunk', handleTranscriptChunk);
    socket.on('context:card', handleContextCard);
    socket.on('contradiction:card', handleContradictionCard);
    socket.on('query:answer', handleQueryAnswer);
    socket.on('meeting:ended', handleMeetingEnd);

    return () => {
      socket.off('transcript:chunk', handleTranscriptChunk);
      socket.off('context:card', handleContextCard);
      socket.off('contradiction:card', handleContradictionCard);
      socket.off('query:answer', handleQueryAnswer);
      socket.off('meeting:ended', handleMeetingEnd);
    };
  }, [appendTranscriptSegments, socket, isExpanded]);

  const handleDismissContext = useCallback((cardId) => {
    setContextCards(prev =>
      prev.map(c => c.id === cardId ? { ...c, dismissed: true } : c)
    );
  }, []);

  const handleResolveContradiction = useCallback((cardId, resolution) => {
    setContradictionCards(prev =>
      prev.map(c => c.id === cardId ? { ...c, resolved: true, resolution } : c)
    );
    if (socket) {
      socket.emit('decision:confirm', {
        meetingId,
        decisionId: cardId,
        action: resolution === 'false_positive' ? 'dismiss' : 'confirm',
      });
    }
  }, [socket, meetingId]);

  const handleAskMemory = useCallback((question) => {
    if (socket) {
      setIsQuerying(true);
      socket.emit('query:ask', { question, meetingId });
    }
  }, [socket, meetingId]);

  const handleConfirmSummary = useCallback((editedSummary) => {
    if (socket) {
      socket.emit('meeting:confirm-summary', { meetingId, summary: editedSummary });
    }
  }, [socket, meetingId]);

  // Collapsed state
  if (!isExpanded) {
    return (
      <button
        onClick={() => {
          setNewCardCount(0);
          onToggle();
        }}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 w-12 h-32 bg-surface border border-border border-r-0 rounded-l-xl flex flex-col items-center justify-center gap-2 hover:bg-surface-2 hover:border-border-strong transition-all group"
        title="Open Nexus sidebar"
      >
        <div className="relative">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent group-hover:text-accent-strong transition-colors">
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
            <path d="M12 8v8M8 12h8" />
          </svg>
          {isConnected && <span className="absolute -top-1 -right-1 live-dot" />}
        </div>
        {newCardCount > 0 && (
          <span className="w-5 h-5 rounded-full bg-warn text-warn-ink text-[10px] font-bold flex items-center justify-center animate-card-pop">
            {newCardCount}
          </span>
        )}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-3">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
    );
  }

  const activeContextCards = contextCards.filter(c => !c.dismissed);
  const activeContradictionCards = contradictionCards.filter(c => !c.resolved);

  return (
    <aside
      ref={sidebarRef}
      className="fixed right-0 top-0 bottom-0 z-40 sidebar-expanded glass-strong flex flex-col animate-slide-right"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-accent to-accent-strong flex items-center justify-center">
            <span className="text-[10px] font-bold text-accent-ink font-[family-name:var(--font-display)]">C</span>
          </div>
          <span className="text-sm font-semibold font-[family-name:var(--font-display)]">Nexus</span>
          {isConnected ? (
            <span className="status-pill text-accent">
              <span className="live-dot" />
              Live
            </span>
          ) : (
            <span className="status-pill text-text-3">
              <span className="w-2 h-2 rounded-full bg-text-3" />
              Offline
            </span>
          )}
        </div>
        <button
          onClick={onToggle}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-surface transition-colors text-text-3 hover:text-text-1"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {meetingEnded && summary ? (
          /* End-of-meeting summary */
          <MeetingSummary
            summary={summary}
            onConfirm={handleConfirmSummary}
          />
        ) : (
          <>
            {/* Zone 1: Alerts (contradiction + context cards) */}
            {(activeContradictionCards.length > 0 || activeContextCards.length > 0) && (
              <div className="px-3 py-2 space-y-2 border-b border-border max-h-[40%] overflow-y-auto">
                {activeContradictionCards.map(card => (
                  <ContradictionCard
                    key={card.id}
                    card={card}
                    onResolve={handleResolveContradiction}
                  />
                ))}
                {activeContextCards.map(card => (
                  <ContextCard
                    key={card.id}
                    card={card}
                    onDismiss={handleDismissContext}
                  />
                ))}
              </div>
            )}

            {/* Zone 2: Live transcript feed */}
            <div className="flex-1 overflow-hidden">
              <TranscriptFeed
                transcript={transcript}
                isLive={isConnected}
              />
            </div>

            {/* Zone 3: Ask the memory */}
            <div className="border-t border-border">
              <AskMemoryInput
                onAsk={handleAskMemory}
                isQuerying={isQuerying}
                answers={queryAnswers}
              />
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

/** Generate a consistent color for a speaker name */
function getSpeakerColor(name) {
  const colors = [
    '#6bc5ff', '#7fd9a8', '#c9beff', '#ffb86b',
    '#ff6b8a', '#6bf5d9', '#ffd56b', '#ff9ecd',
  ];
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
