'use client';

import { useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

const transcriptScript = [
  {
    speaker: 'Maya',
    role: 'PM',
    text: 'For checkout, I want to revisit the payments vendor before we lock the architecture review.',
    time: '00:03',
  },
  {
    speaker: 'Devon',
    role: 'Eng',
    text: 'The previous vendor A decision came from compliance and scale pricing, so we should keep that context nearby.',
    time: '00:11',
  },
  {
    speaker: 'Sarah',
    role: 'Design',
    text: 'Vendor B is cleaner in the prototype and the onboarding flow is faster.',
    time: '00:19',
  },
  {
    speaker: 'Maya',
    role: 'PM',
    text: "Let's just go with vendor B for payments, it is cheaper for launch.",
    time: '00:27',
    conflict: true,
  },
];

const graphNodes = [
  { id: 'payments', label: 'Payments Vendor', type: 'topic', x: 52, y: 45 },
  { id: 'vendor-a', label: 'Vendor A', type: 'tool', x: 23, y: 24 },
  { id: 'vendor-b', label: 'Vendor B', type: 'tool', x: 78, y: 24 },
  { id: 'decision-a', label: 'Use Vendor A', type: 'decision', x: 28, y: 72 },
  { id: 'decision-b', label: 'Vendor B proposal', type: 'decision', x: 75, y: 70 },
  { id: 'finance', label: 'Finance Review', type: 'meeting', x: 11, y: 52 },
  { id: 'launch', label: 'Launch Sync', type: 'meeting', x: 91, y: 52 },
];

const graphEdges = [
  ['payments', 'vendor-a'],
  ['payments', 'vendor-b'],
  ['vendor-a', 'decision-a'],
  ['vendor-b', 'decision-b'],
  ['finance', 'decision-a'],
  ['launch', 'decision-b'],
  ['decision-a', 'decision-b'],
];

const decisions = [
  {
    status: 'active',
    label: 'Payments Vendor Selection',
    claim: 'Use Vendor A for payments processing.',
    date: 'May 29, 2026',
    source: 'Finance Review, 00:18:32',
  },
  {
    status: 'flagged',
    label: 'Launch Cost Proposal',
    claim: 'Move launch payments to Vendor B for lower upfront cost.',
    date: 'Today',
    source: 'Live Launch Sync, 00:27',
  },
  {
    status: 'active',
    label: 'Database Platform',
    claim: 'Postgres remains the system of record for customer and billing data.',
    date: 'June 3, 2026',
    source: 'Architecture Council, 00:41:08',
  },
];

const actionItems = [
  { owner: 'Devon', task: 'Pull Vendor A contract thresholds into the launch brief.', due: 'Today' },
  { owner: 'Maya', task: 'Confirm whether Vendor B has the required compliance certification.', due: 'Friday' },
  { owner: 'Sarah', task: 'Annotate checkout prototype deltas by provider.', due: 'Jun 24' },
];

const auditRows = [
  { user: 'Nadia', action: 'memory.search', scope: 'Product, Eng', time: '09:42' },
  { user: 'Priya', action: 'graph.node.read', scope: 'All teams', time: '10:05' },
  { user: 'Sam', action: 'meeting.join', scope: 'Launch Sync only', time: '10:19' },
];

function Icon({ name, className = 'h-4 w-4' }) {
  const icons = {
    play: <path d="M8 5v14l11-7z" />,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
    shield: <path d="M12 3 5 6v5c0 4.4 2.8 8.4 7 10 4.2-1.6 7-5.6 7-10V6l-7-3z" />,
    alert: <><path d="M12 3 2.8 19h18.4L12 3z" /><path d="M12 9v4" /><path d="M12 17h.01" /></>,
    graph: <><circle cx="6" cy="7" r="3" /><circle cx="17" cy="12" r="3" /><circle cx="8" cy="18" r="3" /><path d="m8.7 8.4 5.6 2.2M15 14.2l-4.7 2.5" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    lock: <><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  };

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={name === 'play' ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  );
}

function StatusPill({ children, tone = 'neutral' }) {
  const tones = {
    neutral: 'border-border text-text-2 bg-surface/70',
    live: 'border-good/30 text-good bg-good/10',
    warn: 'border-warn/35 text-warn bg-warn/10',
    accent: 'border-accent-strong/30 text-accent bg-accent-dim',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

function LiveSidebar({ transcriptStep, contradictionResolved, setContradictionResolved }) {
  const visibleTranscript = transcriptScript.slice(0, transcriptStep);
  const hasConflict = visibleTranscript.some((line) => line.conflict);

  return (
    <section className="flex h-full min-h-[680px] flex-col border-l border-border bg-surface/80">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-strong text-sm font-bold text-accent-ink">
            C
          </div>
          <div>
            <p className="text-sm font-semibold text-text-1">Launch Sync</p>
            <p className="text-xs text-text-3">Manual join · consent committed</p>
          </div>
        </div>
        <StatusPill tone="live"><span className="live-dot" /> Live</StatusPill>
      </div>

      <div className="border-b border-border bg-good/5 px-4 py-3">
        <div className="flex items-start gap-2 text-sm text-text-2">
          <Icon name="shield" className="mt-0.5 h-4 w-4 text-good" />
          <p>Continuum is present, recording status is visible to internal members and guests.</p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto px-4 py-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="eyebrow">Live Transcript</span>
            <span className="font-[family-name:var(--font-mono)] text-[11px] text-text-3">{visibleTranscript.length} chunks</span>
          </div>

          <div className="space-y-3">
            {visibleTranscript.map((line) => (
              <div key={`${line.time}-${line.speaker}`} className="transcript-line bg-bg-soft/45">
                <div className="mb-1 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-node-person/15 text-[10px] font-bold text-node-person">
                    {line.speaker[0]}
                  </span>
                  <span className="text-xs font-semibold text-text-1">{line.speaker}</span>
                  <span className="text-[10px] text-text-3">{line.role}</span>
                  <span className="ml-auto font-[family-name:var(--font-mono)] text-[10px] text-text-3">{line.time}</span>
                </div>
                <p className="pl-8 text-sm leading-relaxed text-text-2">{line.text}</p>
              </div>
            ))}

            {visibleTranscript.length === 0 && (
              <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-border text-sm text-text-3">
                Transcript stream waiting
              </div>
            )}
          </div>

          <div className="mt-4 space-y-3">
            {transcriptStep >= 2 && (
              <div className="context-card p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Icon name="search" className="h-4 w-4 text-accent" />
                  <span className="eyebrow-accent">Related Context</span>
                </div>
                <p className="text-sm leading-relaxed text-text-1">
                  &ldquo;Vendor A was selected because scale pricing and compliance were already approved.&rdquo;
                </p>
                <p className="mt-2 font-[family-name:var(--font-mono)] text-[11px] text-text-3">
                  Finance Review · May 29, 2026 · Devon · 00:18:32
                </p>
              </div>
            )}

            {hasConflict && !contradictionResolved && (
              <div className="contradiction-card p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Icon name="alert" className="h-4 w-4 text-warn" />
                  <span className="eyebrow-accent text-warn">Contradiction Detected</span>
                  <span className="ml-auto font-[family-name:var(--font-mono)] text-[11px] text-text-3">91%</span>
                </div>
                <div className="grid gap-3">
                  <div className="rounded-lg border border-border bg-surface-2/70 p-3">
                    <p className="mb-1 text-[11px] font-medium text-text-3">Stored decision · May 29</p>
                    <p className="text-sm text-text-1">Use Vendor A for payments processing.</p>
                  </div>
                  <div className="rounded-lg border border-warn/25 bg-warn/5 p-3">
                    <p className="mb-1 text-[11px] font-medium text-text-3">New statement · now</p>
                    <p className="text-sm text-text-1">Go with Vendor B for payments because it is cheaper for launch.</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setContradictionResolved(true)}
                    className="inline-flex items-center gap-2 rounded-lg bg-warn px-3 py-2 text-xs font-semibold text-warn-ink"
                  >
                    <Icon name="check" className="h-3.5 w-3.5" />
                    Supersede
                  </button>
                  <button
                    onClick={() => setContradictionResolved(true)}
                    className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-text-2 hover:border-border-strong hover:text-text-1"
                  >
                    False alarm
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-border p-4">
        <label className="sr-only" htmlFor="memory-question">Ask the memory</label>
        <div className="flex gap-2 rounded-lg border border-border bg-bg-soft p-2">
          <input
            id="memory-question"
            className="min-w-0 flex-1 bg-transparent px-2 text-sm text-text-1 outline-none placeholder:text-text-3"
            value="why did we originally pick vendor A?"
            readOnly
          />
          <button className="rounded-md bg-accent-strong px-3 py-1.5 text-xs font-semibold text-accent-ink">
            Ask
          </button>
        </div>
      </div>
    </section>
  );
}

function MemoryExplorer({ selectedNode, setSelectedNode, contradictionResolved }) {
  const selected = graphNodes.find((node) => node.id === selectedNode) || graphNodes[0];

  return (
    <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-lg border border-border bg-surface p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-text-1">Org Memory Explorer</h2>
            <p className="text-sm text-text-3">Hybrid search, graph traversal, and cited synthesis</p>
          </div>
          <StatusPill tone="accent"><Icon name="lock" className="h-3.5 w-3.5" /> team scoped</StatusPill>
        </div>

        <div className="mb-4 rounded-lg border border-border bg-bg-soft p-3">
          <div className="mb-3 flex items-center gap-2 text-text-2">
            <Icon name="search" />
            <span className="text-sm">why did we originally pick vendor A?</span>
          </div>
          <p className="text-sm leading-relaxed text-text-1">
            The team chose Vendor A for payments on May 29, 2026 because its transaction pricing improves at projected scale and its compliance package had already cleared finance review.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusPill>Finance Review · 00:18:32</StatusPill>
            <StatusPill>Vendor Comparison · section 3</StatusPill>
          </div>
        </div>

        <div className="relative h-[360px] overflow-hidden rounded-lg border border-border bg-[#101113]">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {graphEdges.map(([from, to]) => {
              const a = graphNodes.find((node) => node.id === from);
              const b = graphNodes.find((node) => node.id === to);
              return (
                <line
                  key={`${from}-${to}`}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={from === 'decision-a' && to === 'decision-b' ? '#ffb86b' : '#3a3a42'}
                  strokeWidth={from === 'decision-a' && to === 'decision-b' ? '0.6' : '0.35'}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
          </svg>
          {graphNodes.map((node) => {
            const active = selectedNode === node.id;
            const typeClass = node.type === 'decision'
              ? 'border-node-decision/50 bg-node-decision/15 text-node-decision'
              : node.type === 'tool'
                ? 'border-node-tool/50 bg-node-tool/15 text-node-tool'
                : node.type === 'meeting'
                  ? 'border-node-customer/50 bg-node-customer/15 text-node-customer'
                  : 'border-node-topic/50 bg-node-topic/15 text-node-topic';
            return (
              <button
                key={node.id}
                onClick={() => setSelectedNode(node.id)}
                className={`absolute max-w-[120px] -translate-x-1/2 -translate-y-1/2 rounded-full border px-3 py-2 text-xs font-semibold shadow-lg transition ${typeClass} ${active ? 'ring-2 ring-accent-strong' : 'hover:scale-105'}`}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
              >
                {node.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-surface p-4">
          <span className="eyebrow">Selected Node</span>
          <h3 className="mt-2 text-lg font-semibold text-text-1">{selected.label}</h3>
          <p className="mt-2 text-sm leading-relaxed text-text-2">
            {selected.type === 'decision'
              ? 'Decision node with source meeting, status, owner, and supersede history.'
              : 'Knowledge node linked to related decisions, meetings, documents, and transcript segments.'}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusPill tone={selected.type === 'decision' ? 'warn' : 'neutral'}>{selected.type}</StatusPill>
            <StatusPill>{selected.id}</StatusPill>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="eyebrow">Decision Timeline</span>
            <StatusPill tone={contradictionResolved ? 'live' : 'warn'}>
              {contradictionResolved ? 'resolved' : 'open flag'}
            </StatusPill>
          </div>
          <div className="space-y-3">
            {decisions.map((decision) => (
              <div key={decision.label} className="border-l-2 border-border pl-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-text-1">{decision.label}</p>
                  <StatusPill tone={decision.status === 'flagged' ? 'warn' : 'live'}>{decision.status}</StatusPill>
                </div>
                <p className="mt-1 text-sm text-text-2">{decision.claim}</p>
                <p className="mt-1 font-[family-name:var(--font-mono)] text-[11px] text-text-3">{decision.date} · {decision.source}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ContinuumDemo() {
  const { user, logout } = useAuth();
  const [transcriptStep, setTranscriptStep] = useState(0);
  const [selectedNode, setSelectedNode] = useState('payments');
  const [contradictionResolved, setContradictionResolved] = useState(false);

  const activeTranscript = useMemo(() => transcriptScript.slice(0, transcriptStep), [transcriptStep]);
  const hasConflict = activeTranscript.some((line) => line.conflict);

  function advanceDemo() {
    setContradictionResolved(false);
    setTranscriptStep((step) => (step >= transcriptScript.length ? 0 : step + 1));
  }

  return (
    <main className="min-h-screen bg-bg text-text-1">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="px-5 py-5 sm:px-8 lg:px-10">
          <header className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-strong text-base font-bold text-accent-ink">
                C
              </div>
              <div>
                <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-normal text-text-1 flex items-center gap-2">
                  Continuum
                  <a
                    href="/prd.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-normal text-accent hover:text-accent-strong border border-accent/20 hover:border-accent-strong/40 rounded px-1.5 py-0.5 transition-all"
                  >
                    PRD v1.1
                  </a>
                </h1>
                <p className="text-sm text-text-3">Organizational Memory Engine</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              {/* User Profile info */}
              {user && (
                <div className="flex items-center gap-2 border-r border-border pr-4 mr-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-dim border border-accent-strong/30 text-accent text-[11px] font-semibold">
                    {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : '?'}
                  </div>
                  <div className="flex flex-col hidden sm:flex">
                    <span className="text-xs font-medium text-text-1 leading-tight">{user.name}</span>
                    <span className="text-[9px] font-[family-name:var(--font-mono)] text-text-3 uppercase tracking-wider leading-tight">
                      {user.role === 'org_admin' ? 'Admin' : 'Member'}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="ml-2 px-2.5 py-1 rounded-lg text-[11px] font-medium text-text-3 hover:text-danger hover:bg-danger/8 border border-transparent hover:border-danger/10 transition-all cursor-pointer"
                    title="Sign Out"
                  >
                    Sign Out
                  </button>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <StatusPill tone="live">transcript store</StatusPill>
                <StatusPill tone="accent">pgvector</StatusPill>
                <StatusPill>graph store</StatusPill>
                <button
                  onClick={advanceDemo}
                  className="inline-flex items-center gap-2 rounded-lg bg-accent-strong px-4 py-2 text-sm font-semibold text-accent-ink hover:bg-accent cursor-pointer"
                >
                  <Icon name="play" />
                  {transcriptStep >= transcriptScript.length ? 'Reset demo' : 'Advance live demo'}
                </button>
              </div>
            </div>
          </header>

          <section className="mb-5 grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-border bg-surface p-4">
              <span className="eyebrow">Latency</span>
              <p className="mt-2 text-2xl font-semibold text-text-1">1.8s</p>
              <p className="text-xs text-text-3">transcript lag</p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <span className="eyebrow">Context</span>
              <p className="mt-2 text-2xl font-semibold text-text-1">11s</p>
              <p className="text-xs text-text-3">first card</p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <span className="eyebrow">Conflict</span>
              <p className={`mt-2 text-2xl font-semibold ${hasConflict ? 'text-warn' : 'text-text-1'}`}>
                {hasConflict ? 'Detected' : 'Armed'}
              </p>
              <p className="text-xs text-text-3">payments topic</p>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <span className="eyebrow">RBAC</span>
              <p className="mt-2 text-2xl font-semibold text-text-1">3 roles</p>
              <p className="text-xs text-text-3">admin · member · guest</p>
            </div>
          </section>

          <MemoryExplorer
            selectedNode={selectedNode}
            setSelectedNode={setSelectedNode}
            contradictionResolved={contradictionResolved}
          />

          <section className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-border bg-surface p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="eyebrow">Action Items</span>
                <StatusPill>owner scoped</StatusPill>
              </div>
              <div className="space-y-2">
                {actionItems.map((item) => (
                  <div key={item.task} className="flex items-start justify-between gap-3 rounded-lg bg-bg-soft p-3">
                    <div>
                      <p className="text-sm text-text-1">{item.task}</p>
                      <p className="mt-1 text-xs text-text-3">{item.owner}</p>
                    </div>
                    <span className="shrink-0 rounded-full border border-border px-2 py-1 text-xs text-text-2">{item.due}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-surface p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="eyebrow">Audit Log</span>
                <StatusPill tone="accent"><Icon name="shield" className="h-3.5 w-3.5" /> enforced</StatusPill>
              </div>
              <div className="space-y-2">
                {auditRows.map((row) => (
                  <div key={`${row.user}-${row.time}`} className="grid grid-cols-[0.7fr_1fr_0.8fr_auto] gap-3 rounded-lg bg-bg-soft p-3 text-xs">
                    <span className="font-semibold text-text-1">{row.user}</span>
                    <span className="text-text-2">{row.action}</span>
                    <span className="text-text-3">{row.scope}</span>
                    <span className="font-[family-name:var(--font-mono)] text-text-3">{row.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <LiveSidebar
          transcriptStep={transcriptStep}
          contradictionResolved={contradictionResolved}
          setContradictionResolved={setContradictionResolved}
        />
      </div>
    </main>
  );
}
