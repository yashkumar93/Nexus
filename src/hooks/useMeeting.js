'use client';

import { useCallback, useEffect, useReducer, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';

// ─── State shape & reducer ──────────────────────────────────────────────────

/**
 * @typedef {'idle' | 'joining' | 'active' | 'ending' | 'ended'} MeetingStatus
 *
 * @typedef {Object} TranscriptChunk
 * @property {string} id
 * @property {string} speaker
 * @property {string} speakerId
 * @property {string} text
 * @property {string} timestamp
 * @property {string} meetingId
 *
 * @typedef {Object} ContextCard
 * @property {string} chunkId
 * @property {Array} cards
 *
 * @typedef {Object} ContradictionCard
 * @property {string} chunkId
 * @property {Array} contradictions
 *
 * @typedef {Object} QueryAnswer
 * @property {string} queryId
 * @property {string} question
 * @property {string} answer
 * @property {Array} sources
 * @property {string} timestamp
 * @property {boolean} [error]
 * @property {boolean} [thinking]
 *
 * @typedef {Object} Participant
 * @property {string} userId
 * @property {string} name
 * @property {Date} joinedAt
 *
 * @typedef {Object} MeetingState
 * @property {string | null} meetingId
 * @property {MeetingStatus} status
 * @property {TranscriptChunk[]} transcript
 * @property {ContextCard[]} contextCards
 * @property {ContradictionCard[]} contradictionCards
 * @property {QueryAnswer[]} queryAnswers
 * @property {Participant[]} participants
 * @property {any} summary
 * @property {string | null} error
 */

/** @type {MeetingState} */
const initialState = {
  meetingId: null,
  status: 'idle',
  transcript: [],
  contextCards: [],
  contradictionCards: [],
  queryAnswers: [],
  participants: [],
  summary: null,
  error: null,
};

/**
 * @param {MeetingState} state
 * @param {{ type: string, payload?: any }} action
 * @returns {MeetingState}
 */
function meetingReducer(state, action) {
  switch (action.type) {
    case 'JOIN_START':
      return { ...state, status: 'joining', meetingId: action.payload, error: null };

    case 'JOIN_SUCCESS':
      return {
        ...state,
        status: 'active',
        meetingId: action.payload.meetingId,
        participants: action.payload.participants || [],
        transcript: action.payload.transcript || [],
      };

    case 'JOIN_ERROR':
      return { ...state, status: 'idle', error: action.payload };

    case 'LEAVE':
      return { ...initialState };

    case 'TRANSCRIPT_CHUNK':
      return {
        ...state,
        transcript: [...state.transcript, action.payload],
      };

    case 'CONTEXT_CARD':
      return {
        ...state,
        contextCards: [...state.contextCards, action.payload],
      };

    case 'CONTRADICTION_CARD':
      return {
        ...state,
        contradictionCards: [...state.contradictionCards, action.payload],
      };

    case 'QUERY_THINKING': {
      const thinking = {
        queryId: action.payload.queryId,
        question: action.payload.question,
        answer: '',
        sources: [],
        timestamp: new Date().toISOString(),
        thinking: true,
      };
      return {
        ...state,
        queryAnswers: [...state.queryAnswers, thinking],
      };
    }

    case 'QUERY_ANSWER':
      return {
        ...state,
        queryAnswers: state.queryAnswers
          // Replace the thinking placeholder if it exists
          .filter((q) => q.queryId !== action.payload.queryId || !q.thinking)
          .concat(action.payload),
      };

    case 'PARTICIPANT_JOINED':
      return {
        ...state,
        participants: action.payload.participants || state.participants,
      };

    case 'PARTICIPANT_LEFT':
      return {
        ...state,
        participants: action.payload.participants || state.participants,
      };

    case 'DECISION_UPDATED':
      return state; // UI components handle this via their own state

    case 'MEETING_ENDING':
      return { ...state, status: 'ending' };

    case 'MEETING_ENDED':
      return {
        ...state,
        status: 'ended',
        summary: action.payload.summary,
      };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    default:
      return state;
  }
}

// ─── Hook ───────────────────────────────────────────────────────────────────

/**
 * Hook for managing real-time meeting state.
 *
 * Composes `useSocket` and `useAuth` to provide a complete
 * meeting interface: joining, transcript streaming, AI pipeline
 * results, queries, and meeting lifecycle.
 *
 * @returns {{
 *   meetingId: string | null,
 *   status: MeetingStatus,
 *   transcript: TranscriptChunk[],
 *   contextCards: ContextCard[],
 *   contradictionCards: ContradictionCard[],
 *   queryAnswers: QueryAnswer[],
 *   participants: Participant[],
 *   summary: any,
 *   error: string | null,
 *   joinMeeting: (meetingId: string) => void,
 *   leaveMeeting: () => void,
 *   sendTranscriptChunk: (chunk: { text: string, speaker?: string }) => void,
 *   confirmDecision: (decisionId: string, action: string, editedText?: string) => void,
 *   askMemory: (question: string) => void,
 *   endMeeting: () => void,
 * }}
 */
export function useMeeting() {
  const { socket, isConnected, emit, on, off } = useSocket();
  const { user } = useAuth();
  const [state, dispatch] = useReducer(meetingReducer, initialState);

  /** Keep a ref to meetingId for use in callbacks without stale closures */
  const meetingIdRef = useRef(state.meetingId);
  const pendingMeetingIdRef = useRef(null);

  useEffect(() => {
    meetingIdRef.current = state.meetingId;
  }, [state.meetingId]);

  // ── Socket event listeners ──────────────────────────────────────────────
  useEffect(() => {
    if (!isConnected) return;

    function handleTranscriptChunk(data) {
      dispatch({ type: 'TRANSCRIPT_CHUNK', payload: data });
    }

    function handleContextCard(data) {
      dispatch({ type: 'CONTEXT_CARD', payload: data });
    }

    function handleContradictionCard(data) {
      dispatch({ type: 'CONTRADICTION_CARD', payload: data });
    }

    function handleQueryThinking(data) {
      dispatch({ type: 'QUERY_THINKING', payload: data });
    }

    function handleQueryAnswer(data) {
      dispatch({ type: 'QUERY_ANSWER', payload: data });
    }

    function handleParticipantJoined(data) {
      dispatch({ type: 'PARTICIPANT_JOINED', payload: data });
    }

    function handleParticipantLeft(data) {
      dispatch({ type: 'PARTICIPANT_LEFT', payload: data });
    }

    function handleDecisionUpdated(data) {
      dispatch({ type: 'DECISION_UPDATED', payload: data });
    }

    function handleMeetingEnding() {
      dispatch({ type: 'MEETING_ENDING' });
    }

    function handleMeetingEnded(data) {
      dispatch({ type: 'MEETING_ENDED', payload: data });
    }

    on('transcript:chunk', handleTranscriptChunk);
    on('context:card', handleContextCard);
    on('contradiction:card', handleContradictionCard);
    on('query:thinking', handleQueryThinking);
    on('query:answer', handleQueryAnswer);
    on('meeting:participant-joined', handleParticipantJoined);
    on('meeting:participant-left', handleParticipantLeft);
    on('decision:updated', handleDecisionUpdated);
    on('meeting:ending', handleMeetingEnding);
    on('meeting:ended', handleMeetingEnded);

    return () => {
      off('transcript:chunk', handleTranscriptChunk);
      off('context:card', handleContextCard);
      off('contradiction:card', handleContradictionCard);
      off('query:thinking', handleQueryThinking);
      off('query:answer', handleQueryAnswer);
      off('meeting:participant-joined', handleParticipantJoined);
      off('meeting:participant-left', handleParticipantLeft);
      off('decision:updated', handleDecisionUpdated);
      off('meeting:ending', handleMeetingEnding);
      off('meeting:ended', handleMeetingEnded);
    };
  }, [isConnected, on, off]);

  // ── Actions ─────────────────────────────────────────────────────────────

  const performJoin = useCallback(
    (meetingId) => {
      if (!meetingId || !isConnected) return;

      emit('join-meeting', { meetingId }, (response) => {
        if (response?.success) {
          pendingMeetingIdRef.current = null;
          dispatch({ type: 'JOIN_SUCCESS', payload: response.data });
        } else {
          dispatch({
            type: 'JOIN_ERROR',
            payload: response?.error || 'Failed to join meeting',
          });
        }
      });
    },
    [isConnected, emit]
  );

  const joinMeeting = useCallback(
    (meetingId) => {
      pendingMeetingIdRef.current = meetingId;
      dispatch({ type: 'JOIN_START', payload: meetingId });
      performJoin(meetingId);
    },
    [performJoin]
  );

  useEffect(() => {
    if (isConnected && pendingMeetingIdRef.current) {
      performJoin(pendingMeetingIdRef.current);
    }
  }, [isConnected, performJoin]);

  const leaveMeeting = useCallback(() => {
    const currentMeetingId = meetingIdRef.current;
    pendingMeetingIdRef.current = null;
    if (!currentMeetingId) return;

    emit('leave-meeting', { meetingId: currentMeetingId }, () => {
      dispatch({ type: 'LEAVE' });
    });
  }, [emit]);

  const sendTranscriptChunk = useCallback(
    (chunk) => {
      const currentMeetingId = meetingIdRef.current;
      if (!currentMeetingId || !isConnected) return;

      emit('transcript:chunk', {
        meetingId: currentMeetingId,
        chunk: {
          text: chunk.text,
          speaker: chunk.speaker || user?.name,
          speakerId: user?.userId,
        },
      });
    },
    [isConnected, emit, user]
  );

  const confirmDecision = useCallback(
    (decisionId, action, editedText) => {
      const currentMeetingId = meetingIdRef.current;
      if (!currentMeetingId || !isConnected) return;

      emit('decision:confirm', {
        meetingId: currentMeetingId,
        decisionId,
        action,
        editedText,
      });
    },
    [isConnected, emit]
  );

  const askMemory = useCallback(
    (question) => {
      const currentMeetingId = meetingIdRef.current;
      if (!isConnected) return;

      emit('query:ask', {
        meetingId: currentMeetingId,
        question,
      });
    },
    [isConnected, emit]
  );

  const endMeeting = useCallback(() => {
    const currentMeetingId = meetingIdRef.current;
    if (!currentMeetingId || !isConnected) return;

    emit('meeting:end', { meetingId: currentMeetingId });
  }, [isConnected, emit]);

  return {
    // State
    meetingId: state.meetingId,
    status: state.status,
    transcript: state.transcript,
    contextCards: state.contextCards,
    contradictionCards: state.contradictionCards,
    queryAnswers: state.queryAnswers,
    participants: state.participants,
    summary: state.summary,
    error: state.error,

    // Actions
    joinMeeting,
    leaveMeeting,
    sendTranscriptChunk,
    confirmDecision,
    askMemory,
    endMeeting,
  };
}

export default useMeeting;
