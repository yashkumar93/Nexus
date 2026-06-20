'use client';

import { useState } from 'react';

export default function ContradictionCard({ card, onResolve }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const statementA = card.statement_a || card.storedStatement || card.contradictions?.[0]?.stored || 'Stored decision';
  const statementB = card.statement_b || card.newStatement || card.contradictions?.[0]?.new || 'New statement';

  return (
    <div className="contradiction-card p-3 animate-card-pop">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 flex-none items-center justify-center rounded-md bg-warn/15">
            <svg className="h-3.5 w-3.5 text-warn" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3 2.8 19h18.4L12 3z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
          </div>
          <span className="eyebrow-accent text-[10px] text-warn">Contradiction Detected</span>
        </div>
        <span className="font-[family-name:var(--font-mono)] text-[10px] text-text-3">
          {card.confidence ? `${Math.round(card.confidence * 100)}%` : '91%'}
        </span>
      </div>

      <div className="grid gap-2">
        <div className="rounded-lg border border-border bg-surface-2/70 p-2">
          <p className="mb-1 text-[10px] uppercase tracking-normal text-text-3">Stored decision</p>
          <p className="text-xs leading-relaxed text-text-1">{statementA}</p>
        </div>
        <div className="rounded-lg border border-warn/25 bg-warn/5 p-2">
          <p className="mb-1 text-[10px] uppercase tracking-normal text-text-3">Live statement</p>
          <p className="text-xs leading-relaxed text-text-1">{statementB}</p>
        </div>
      </div>

      {(card.rationale || card.sources) && (
        <>
          <button
            onClick={() => setIsExpanded((value) => !value)}
            className="mt-2 text-[11px] font-medium text-warn hover:text-warn-strong"
          >
            {isExpanded ? 'Hide provenance' : 'View provenance'}
          </button>
          {isExpanded && (
            <div className="mt-2 rounded-lg bg-surface p-2 text-xs leading-relaxed text-text-2">
              {card.rationale || 'Both statements are linked to the payments vendor topic and reverse the active decision.'}
            </div>
          )}
        </>
      )}

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => onResolve(card.id, 'superseded')}
          className="rounded-lg bg-warn px-3 py-1.5 text-xs font-semibold text-warn-ink"
        >
          Supersede
        </button>
        <button
          onClick={() => onResolve(card.id, 'false_positive')}
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-2 hover:border-border-strong hover:text-text-1"
        >
          False alarm
        </button>
      </div>
    </div>
  );
}
