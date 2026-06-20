'use client';

import { useState } from 'react';

export default function AskMemoryInput({ onAsk, isQuerying, answers = [] }) {
  const [question, setQuestion] = useState('');

  function submit(event) {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || isQuerying) return;
    onAsk(trimmed);
    setQuestion('');
  }

  return (
    <div className="p-3">
      {answers.length > 0 && (
        <div className="mb-3 max-h-36 space-y-2 overflow-y-auto">
          {answers.slice(-2).map((answer, index) => (
            <div key={answer.queryId || index} className="rounded-lg border border-border bg-bg-soft p-3">
              <p className="text-xs font-semibold text-text-1">{answer.question}</p>
              <p className="mt-1 text-xs leading-relaxed text-text-2">{answer.answer || answer.text}</p>
            </div>
          ))}
        </div>
      )}
      <form onSubmit={submit} className="flex gap-2 rounded-lg border border-border bg-bg-soft p-2">
        <label htmlFor="ask-memory" className="sr-only">Ask the memory</label>
        <input
          id="ask-memory"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask the memory..."
          className="min-w-0 flex-1 bg-transparent px-2 text-sm text-text-1 outline-none placeholder:text-text-3"
        />
        <button
          type="submit"
          disabled={isQuerying || !question.trim()}
          className="rounded-md bg-accent-strong px-3 py-1.5 text-xs font-semibold text-accent-ink disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isQuerying ? 'Thinking' : 'Ask'}
        </button>
      </form>
    </div>
  );
}
