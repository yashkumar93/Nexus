'use client';

import { useState } from 'react';

export default function ContextCard({ card, onDismiss }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="context-card p-3 animate-card-pop">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-accent-dim flex items-center justify-center flex-none">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </div>
          <span className="eyebrow-accent text-[10px]">Related Context</span>
        </div>
        <button
          onClick={() => onDismiss(card.id)}
          className="w-5 h-5 rounded flex items-center justify-center text-text-3 hover:text-text-1 hover:bg-surface transition-all flex-none"
          title="Dismiss"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <p className="text-sm text-text-1 leading-relaxed mb-2 pl-1">
        &ldquo;{card.claim || card.text}&rdquo;
      </p>

      {/* Source */}
      <div className="flex items-center gap-2 text-[11px] text-text-3 font-[family-name:var(--font-mono)] pl-1">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        <span>{card.source_meeting || card.sourceMeeting || 'Previous meeting'}</span>
        <span>·</span>
        <span>{card.source_date || card.sourceDate || ''}</span>
        {card.speaker && (
          <>
            <span>·</span>
            <span>{card.speaker}</span>
          </>
        )}
      </div>

      {/* Expand */}
      {(card.full_context || card.fullContext) && (
        <>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-[11px] text-accent hover:text-accent-strong transition-colors font-medium pl-1 flex items-center gap-1"
          >
            {isExpanded ? 'Hide' : 'View full'} context
            <svg
              width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {isExpanded && (
            <div className="mt-2 p-2 rounded-lg bg-surface text-xs text-text-2 leading-relaxed animate-fade-in">
              {card.full_context || card.fullContext}
            </div>
          )}
        </>
      )}
    </div>
  );
}
