'use client';

import { useState } from 'react';

export default function MeetingSummary({ summary, onConfirm }) {
  const [draft, setDraft] = useState(summary || {
    decisions: ['Keep Vendor A as the active payments decision until compliance signs off on Vendor B.'],
    actionItems: ['Devon will attach Vendor A pricing thresholds to the launch brief.'],
  });

  const decisions = Array.isArray(draft.decisions) ? draft.decisions : [];
  const actionItems = Array.isArray(draft.actionItems) ? draft.actionItems : [];

  function updateList(key, index, value) {
    setDraft((current) => {
      const next = Array.isArray(current[key]) ? [...current[key]] : [];
      next[index] = value;
      return { ...current, [key]: next };
    });
  }

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-4">
        <span className="eyebrow">Meeting Summary</span>
        <h2 className="mt-2 text-lg font-semibold text-text-1">Confirm before graph commit</h2>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto">
        <section>
          <h3 className="mb-2 text-sm font-semibold text-text-1">Decisions</h3>
          <div className="space-y-2">
            {decisions.map((item, index) => (
              <textarea
                key={`decision-${index}`}
                value={item}
                onChange={(event) => updateList('decisions', index, event.target.value)}
                className="min-h-20 w-full resize-none rounded-lg border border-border bg-bg-soft p-3 text-sm text-text-2 outline-none focus:border-accent-strong"
              />
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold text-text-1">Action Items</h3>
          <div className="space-y-2">
            {actionItems.map((item, index) => (
              <textarea
                key={`action-${index}`}
                value={item}
                onChange={(event) => updateList('actionItems', index, event.target.value)}
                className="min-h-20 w-full resize-none rounded-lg border border-border bg-bg-soft p-3 text-sm text-text-2 outline-none focus:border-accent-strong"
              />
            ))}
          </div>
        </section>
      </div>

      <button
        onClick={() => onConfirm(draft)}
        className="mt-4 rounded-lg bg-accent-strong px-4 py-3 text-sm font-semibold text-accent-ink"
      >
        Commit to memory
      </button>
    </div>
  );
}
