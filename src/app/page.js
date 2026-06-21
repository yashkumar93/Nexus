'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import MarketingNavbar from '@/components/layout/MarketingNavbar';
import MarketingFooter from '@/components/layout/MarketingFooter';

/* ---------- SVGs for icons ---------- */
const ArrowRight = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="inline-block ml-1">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const ArrowUp = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m18 15-6-6-6 6" />
  </svg>
);

const Check = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const ChevronRight = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const Sparkles = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
);

const Target = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const MapIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.12 3.88 16 5.76a2 2 0 0 0 2.8 0l1.88-1.88M3 21l18-18M3 3v18h18M9 9h.01M9 15h.01" />
  </svg>
);

const MessageIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const BrainIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1 0-3.88 2.5 2.5 0 0 1 0-3.88A2.5 2.5 0 0 1 9.5 2zM14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 0-3.88 2.5 2.5 0 0 0 0-3.88A2.5 2.5 0 0 0 14.5 2z" />
  </svg>
);

const Clock = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const Star = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const BookOpen = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const Briefcase = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const TrendingUp = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

const Lock = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

/* ---------- Flip words ---------- */
function FlipWords({ words, interval = 2200 }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((x) => (x + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [words.length, interval]);
  return (
    <span style={{ position: 'relative', display: 'inline-block', minWidth: '6ch', verticalAlign: 'baseline' }}>
      {words.map((w, idx) => (
        <span
          key={w}
          className="serif-accent"
          style={{
            position: idx === i ? 'relative' : 'absolute',
            left: 0,
            top: 0,
            opacity: idx === i ? 1 : 0,
            transform: idx === i ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.6s cubic-bezier(.2,.7,.2,1), transform 0.6s cubic-bezier(.2,.7,.2,1)',
            color: 'var(--crr-accent)',
            whiteSpace: 'nowrap',
          }}
        >
          {w}
        </span>
      ))}
    </span>
  );
}

/* ---------- Shiny badge ---------- */
function ShinyBadge({ children }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 14px 6px 8px',
        borderRadius: 999,
        background: 'var(--crr-surface-2)',
        border: '1px solid var(--crr-line)',
        fontSize: 13,
        color: 'var(--crr-text-dim)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--crr-accent) 0%, var(--peach) 100%)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
        }}
      >
        <Sparkles size={12} />
      </span>
      <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
      <span
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(110deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)',
          animation: 'crr-shine 3s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

/* ---------- Live processing console demo ---------- */
function NexusSyncDemo() {
  const script = useMemo(
    () => [
      { role: 'bot', text: "[Sync Active] Recording 'Q2 Planning & Tech Stack Sync'." },
      { role: 'user', text: "Devon Chen: 'Postgres handles relational queries well, but Pinecone is much better for vector search.'" },
      { role: 'bot', text: "Nexus: 'Duly noted. Running context lookup in database.'" },
      { role: 'user', text: "Priya Patel: 'Okay, let's confirm Postgres as our record keeper and Pinecone for semantic search.'" },
      { role: 'bot', card: 'decision' },
    ],
    [],
  );
  const [step, setStep] = useState(0);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (step >= script.length) {
      const id = setTimeout(() => setStep(0), 4500);
      return () => clearTimeout(id);
    }
    const msg = script[step];
    const typingTimer = setTimeout(() => setTyping(msg.role === 'bot'), 0);
    const id = setTimeout(
      () => {
        setTyping(false);
        setStep((s) => s + 1);
      },
      msg.role === 'bot' ? 1800 : 1300,
    );
    return () => {
      clearTimeout(typingTimer);
      clearTimeout(id);
    };
  }, [step, script]);

  const shown = script.slice(0, step);

  return (
    <div
      className="crr-card"
      style={{ padding: 0, width: '100%', maxWidth: 480, overflow: 'hidden', boxShadow: 'var(--crr-shadow-lg)' }}
    >
      <div
        style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--crr-line)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'var(--crr-surface-3)',
        }}
      >
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--sage)' }} />
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--crr-text)' }}>Nexus Core · ambient monitor</span>
        <span className="eyebrow" style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--crr-text-faint)' }}>
          INGESTION
        </span>
      </div>

      <div style={{ padding: '20px 18px', minHeight: 380, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {shown.map((m, i) => {
          if (m.card === 'decision') return <DecisionMini key={i} />;
          return (
            <div
              key={i}
              className={`bubble ${m.role === 'bot' ? 'bubble-bot' : 'bubble-user'}`}
              style={{
                animation: 'crr-riseIn 0.5s cubic-bezier(.2,.7,.2,1) both',
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                fontSize: 13.5,
                maxWidth: '85%',
              }}
            >
              {m.text}
            </div>
          );
        })}
        {typing && (
          <div
            className="bubble bubble-bot"
            style={{ display: 'inline-flex', gap: 4, alignSelf: 'flex-start', padding: '14px 16px' }}
          >
            <TypingDot delay={0} />
            <TypingDot delay={0.15} />
            <TypingDot delay={0.3} />
          </div>
        )}
      </div>

      <div
        style={{
          padding: '12px 14px',
          borderTop: '1px solid var(--crr-line)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'var(--crr-surface-2)',
        }}
      >
        <div
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 999,
            background: 'var(--crr-surface-3)',
            color: 'var(--crr-text-faint)',
            fontSize: 12.5,
          }}
        >
          Listening to meeting transcript stream…
        </div>
        <button
          type="button"
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'var(--crr-accent)',
            color: '#fff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <ArrowUp size={16} />
        </button>
      </div>
    </div>
  );
}

function TypingDot({ delay }) {
  return (
    <span
      style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: 'var(--crr-text-faint)',
        animation: 'crr-tping 1.2s ease-in-out infinite',
        animationDelay: `${delay}s`,
        alignSelf: 'center',
      }}
    />
  );
}

function DecisionMini() {
  return (
    <div
      style={{
        border: '1px solid var(--crr-line)',
        borderRadius: 18,
        padding: 14,
        background: 'var(--crr-surface-2)',
        animation: 'crr-riseIn 0.6s cubic-bezier(.2,.7,.2,1) both',
        display: 'flex',
        gap: 12,
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: 'linear-gradient(135deg, var(--peach), var(--crr-accent))',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
        }}
      >
        <Target size={22} />
      </div>
      <div style={{ flex: 1 }}>
        <div className="eyebrow" style={{ fontSize: 11, color: 'var(--crr-accent)', fontWeight: 600 }}>
          Decision Extracted
        </div>
        <div style={{ fontSize: 14, fontWeight: 500 }}>Postgres + Pinecone stack</div>
        <div style={{ fontSize: 12, color: 'var(--crr-text-dim)' }}>Postgres as record store, Pinecone for vectors.</div>
      </div>
      <ChevronRight size={18} />
    </div>
  );
}



/* ---------- Proof ---------- */
function Proof({ label, value, unit }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
        <span className="display tnum" style={{ fontSize: 22, fontWeight: 500 }}>
          {value}
        </span>
        {unit && <span style={{ fontSize: 13, color: 'var(--crr-text-faint)' }}>{unit}</span>}
      </div>
      <span style={{ fontSize: 12, color: 'var(--crr-text-faint)' }}>{label}</span>
    </div>
  );
}

/* ---------- Hero Section ---------- */
function HeroSection() {
  return (
    <section style={{ position: 'relative', padding: '80px 0 64px' }}>
      <div className="glow-field">
        <div className="crr-glow peach" style={{ width: 500, height: 500, left: -100, top: -100 }} />
        <div className="crr-glow sage" style={{ width: 420, height: 420, right: -80, top: 60, animationDelay: '2s' }} />
        <div className="crr-glow butter" style={{ width: 380, height: 380, left: '40%', top: 300, animationDelay: '4s' }} />
      </div>

      <div
        className="crr-container mx-auto px-6 max-w-7xl"
        style={{
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: '1.05fr 1fr',
          gap: 60,
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div className="crr-reveal">
            <ShinyBadge>Your organizational memory assistant · in public beta</ShinyBadge>
          </div>

          <h1 className="display crr-reveal" style={{ fontSize: 62, margin: 0, fontWeight: 400, lineHeight: 1.15 }}>
            Your organization's
            <br />
            collective memory,
            <br />
            ambiently <FlipWords words={['captured', 'indexed', 'recalled', 'synthesized']} />.
          </h1>

          <p
            className="crr-reveal"
            style={{
              fontSize: 18,
              color: 'var(--crr-text-dim)',
              margin: 0,
              maxWidth: 520,
              lineHeight: 1.55,
            }}
          >
            Nexus passively structures your discussions, generates overlapping vector chunks, indexes them in Pinecone, and answers queries with verified citations. One honest sync at a time.
          </p>

          <div className="crr-reveal" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Link
              href="/auth/register"
              className="crr-btn crr-btn-primary no-underline"
              style={{ padding: '14px 22px', fontSize: 16 }}
            >
              Get Started Free <ArrowRight size={18} />
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--crr-text-dim)' }}>
              <Clock size={14} /> Free trial · Under 5 minutes
            </div>
          </div>

          <div
            className="crr-reveal"
            style={{
              display: 'flex',
              gap: 28,
              paddingTop: 16,
              borderTop: '1px solid var(--crr-line)',
              marginTop: 8,
            }}
          >
            <Proof label="Decisions indexed" value="14,000+" />
            <Proof label="Active squads" value="1,200" />
            <Proof label="Avg. recall latency" value="50" unit="ms" />
          </div>
        </div>

        <div className="crr-reveal" style={{ display: 'flex', justifyContent: 'center' }}>
          <NexusSyncDemo />
        </div>
      </div>
    </section>
  );
}

/* ---------- Bento Section ---------- */
function BentoMatch() {
  return (
    <div
      className="crr-card lift"
      style={{
        padding: 22,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        gridColumn: 'span 4',
        background: 'var(--crr-surface-2)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'var(--peach)',
            display: 'grid',
            placeItems: 'center',
            color: 'var(--crr-accent-deep)',
          }}
        >
          <Target size={18} />
        </div>
        <span className="eyebrow">Vector memory match</span>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--crr-accent)', fontWeight: 600 }}>98%</span>
      </div>
      <div>
        <div className="display" style={{ fontSize: 24, fontWeight: 500 }}>
          Postgres + Pinecone
        </div>
        <div style={{ fontSize: 13.5, color: 'var(--crr-text-dim)', marginTop: 6 }}>
          Relational storage handled by Postgres, vector metadata index structured in Pinecone.
        </div>
      </div>
      <div style={{ height: 6, borderRadius: 999, background: 'var(--cream-200)', overflow: 'hidden' }}>
        <div style={{ width: '98%', height: '100%', background: 'var(--crr-accent)' }} />
      </div>
    </div>
  );
}

function BentoRoadmap() {
  const steps = [
    { label: 'Stripe Billing integration', done: true },
    { label: 'SOC 2 compliance check', done: true },
    { label: 'Sandbox environment setup', done: false, current: true },
    { label: 'Onboarding profiling simplification', done: false },
  ];
  return (
    <div
      className="crr-card lift"
      style={{
        padding: 22,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        gridColumn: 'span 5',
        background: 'var(--crr-surface-2)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'var(--sage)',
            display: 'grid',
            placeItems: 'center',
            color: '#2d4a30',
          }}
        >
          <MapIcon size={18} />
        </div>
        <span className="eyebrow">Ambient Action Items</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: s.done ? 'var(--crr-accent)' : s.current ? 'transparent' : 'var(--cream-200)',
                border: s.current ? '2px dashed var(--crr-accent)' : 'none',
                display: 'grid',
                placeItems: 'center',
                color: '#fff',
                flexShrink: 0,
              }}
            >
              {s.done && <Check size={12} />}
              {s.current && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--crr-accent)' }} />}
            </div>
            <span
              style={{
                fontSize: 13.5,
                color: s.done ? 'var(--crr-text-dim)' : 'var(--crr-text)',
                textDecoration: s.done ? 'line-through' : 'none',
                fontWeight: s.current ? 500 : 400,
              }}
            >
              {s.label}
            </span>
            {s.current && (
              <span
                className="eyebrow"
                style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--crr-accent)', fontWeight: 600 }}
              >
                Active
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function BentoStat() {
  return (
    <div
      className="lift"
      style={{
        padding: 22,
        gridColumn: 'span 3',
        borderRadius: 24,
        background: 'var(--ink-900)',
        color: 'var(--cream-50)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <span className="eyebrow" style={{ color: 'var(--cream-300)' }}>
        Query recall time
      </span>
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontSize: 13, color: 'var(--cream-300)' }}>&lt;</span>
          <span
            className="display"
            style={{ fontSize: 64, fontWeight: 400, letterSpacing: '-0.05em', color: 'var(--cream-50)' }}
          >
            50
          </span>
          <span style={{ fontSize: 16, color: 'var(--cream-200)', marginLeft: 4 }}>ms</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--cream-300)', marginTop: -4 }}>
          latency from semantic voice query to Pinecone hybrid retrieval response.
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          right: -30,
          top: -30,
          width: 140,
          height: 140,
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--crr-accent-soft) 0%, transparent 70%)',
          opacity: 0.5,
        }}
      />
    </div>
  );
}

function BentoPreviewSection() {
  return (
    <section style={{ padding: '24px 0 60px', position: 'relative' }}>
      <div className="crr-container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <BentoMatch />
          <BentoRoadmap />
          <BentoStat />
        </div>
      </div>
    </section>
  );
}

/* ---------- Features section ---------- */
function MatchStrip() {
  const items = [
    { t: 'Q2 Roadmap Sync', m: 98 },
    { t: 'Postgres vs Mongo Tech Stack Review', m: 94 },
    { t: 'Customer Checkout Friction Sync', m: 86 },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
      {items.map((it) => (
        <div
          key={it.t}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 14px',
            borderRadius: 12,
            background: 'var(--crr-surface-3)',
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 500 }} className="truncate max-w-[200px]">{it.t}</span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 100, height: 4, background: 'var(--cream-200)', borderRadius: 999, overflow: 'hidden' }} className="hidden sm:block">
              <div style={{ width: `${it.m}%`, height: '100%', background: 'var(--crr-accent)' }} />
            </div>
            <span
              className="tnum"
              style={{ fontSize: 12, color: 'var(--crr-text-dim)', minWidth: 32, textAlign: 'right' }}
            >
              {it.m}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Course Strip ---------- */
function CourseStrip() {
  const tracks = [
    { t: 'Whisper audio', w: 'Diarized', c: 'var(--peach)' },
    { t: 'Pinecone indices', w: '1024-d', c: 'var(--sage)' },
    { t: 'Overlapping chunks', w: '200 words', c: 'var(--butter)' },
    { t: 'Llama RAG synthesis', w: 'Groq', c: 'var(--sky)' },
  ];
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
      {tracks.map((t) => (
        <div
          key={t.t}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 14px 8px 10px',
            borderRadius: 999,
            background: 'var(--crr-surface-3)',
            border: '1px solid var(--crr-line)',
            fontSize: 13,
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.c }} />
          <span style={{ fontWeight: 500 }}>{t.t}</span>
          <span style={{ color: 'var(--crr-text-faint)' }}>{t.w}</span>
        </div>
      ))}
    </div>
  );
}

function PortfolioStrip() {
  const companies = ['Pinecone', 'Groq', 'Postgres', 'Vercel', 'Next.js', 'Socket.IO'];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 6 }}>
      {companies.map((c) => (
        <div
          key={c}
          style={{
            padding: '14px 16px',
            borderRadius: 12,
            background: 'var(--crr-surface-3)',
            fontSize: 13,
            fontWeight: 500,
            textAlign: 'center',
            border: '1px solid var(--crr-line)',
          }}
        >
          {c}
        </div>
      ))}
    </div>
  );
}

function FeatureCard({ title, subtitle, desc, icon, span, children, accent = 'peach', dark, big }) {
  const accentBg = {
    peach: 'var(--peach)',
    sage: 'var(--sage)',
    sky: 'var(--sky)',
    lilac: 'var(--lilac)',
    butter: 'var(--butter)',
  }[accent];
  return (
    <div
      className="crr-card lift"
      style={{
        gridColumn: `span ${span}`,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        background: dark ? 'var(--ink-900)' : 'var(--crr-surface-2)',
        color: dark ? 'var(--cream-50)' : 'var(--crr-text)',
        borderColor: dark ? 'transparent' : 'var(--crr-line)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: accentBg,
            color: 'var(--ink-900)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          {icon}
        </div>
      </div>
      {big ? (
        <>
          <div className="display" style={{ fontSize: 64, fontWeight: 500, letterSpacing: '-0.04em', lineHeight: 1 }}>
            {title}
          </div>
          <div style={{ fontSize: 13.5, color: 'var(--crr-text-dim)', lineHeight: 1.5 }}>{subtitle}</div>
        </>
      ) : (
        <>
          <div
            className="display"
            style={{ fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.15 }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 14,
              color: dark ? 'var(--cream-300)' : 'var(--crr-text-dim)',
              lineHeight: 1.55,
            }}
          >
            {desc}
          </div>
        </>
      )}
      {children}
    </div>
  );
}

const ENTITY_TARGETS = [94, 82, 74, 91, 56];
const ENTITY_LABELS = ['Decisions', 'Action Items', 'People', 'Projects', 'Tools'];

function EntityIndexCard() {
  const [bars, setBars] = useState([0, 0, 0, 0, 0]);

  useEffect(() => {
    const el = document.getElementById('crr-entity-gap');
    if (!el) return;
    const io = new IntersectionObserver(
      (es) => {
        if (es[0].isIntersecting) {
          setTimeout(() => setBars(ENTITY_TARGETS), 200);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      id="crr-entity-gap"
      className="lift"
      style={{
        gridColumn: 'span 6',
        gridRow: 'span 2',
        padding: 28,
        borderRadius: 24,
        background: 'var(--ink-900)',
        color: 'var(--cream-50)',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: 'var(--crr-accent)',
            color: '#fff',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <TrendingUp size={18} />
        </div>
        <span className="eyebrow" style={{ color: 'var(--cream-300)' }}>
          Index Stats · live
        </span>
      </div>
      <div
        className="display"
        style={{ fontSize: 34, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1.1, color: 'var(--cream-50)' }}
      >
        Structured nodes{' '}
        <span className="serif-accent" style={{ color: 'var(--peach)' }}>
          automatically extracted
        </span>{' '}
        from conversation chunks.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
        {ENTITY_LABELS.map((l, i) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 90, fontSize: 13, color: 'var(--cream-200)' }}>{l}</div>
            <div
              style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden' }}
            >
              <div
                style={{
                  width: `${bars[i]}%`,
                  height: '100%',
                  background: i === 3 ? 'var(--sage)' : 'var(--crr-accent)',
                  transition: `width 1.2s cubic-bezier(.2,.7,.2,1) ${i * 0.12}s`,
                }}
              />
            </div>
            <div
              className="tnum"
              style={{ fontSize: 12, color: 'var(--cream-300)', minWidth: 30, textAlign: 'right' }}
            >
              {ENTITY_TARGETS[i]}%
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          right: -80,
          bottom: -80,
          width: 260,
          height: 260,
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--crr-accent) 0%, transparent 70%)',
          opacity: 0.25,
          filter: 'blur(40px)',
        }}
      />
    </div>
  );
}

function FeaturesSection() {
  return (
    <section id="features" style={{ padding: '100px 0', position: 'relative' }}>
      <div className="crr-container mx-auto px-6 max-w-7xl">
        <div style={{ maxWidth: 640, marginBottom: 48 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>
            What you get
          </div>
          <h2 className="display" style={{ fontSize: 56, margin: 0, fontWeight: 400, letterSpacing: '-0.03em' }}>
            Everything you need to move{' '}
            <span className="serif-accent" style={{ color: 'var(--crr-accent)' }}>
              from sync to truth
            </span>
            .
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gridAutoRows: 'minmax(180px, auto)',
            gap: 16,
          }}
        >
          <EntityIndexCard />
          <FeatureCard
            title="Semantic queries, cited honestly."
            desc="Verify every summary claim. We retrieve relevant context blocks back to speaker transcripts and date stamps."
            icon={<Target size={18} />}
            span={6}
            accent="peach"
          >
            <MatchStrip />
          </FeatureCard>
          <FeatureCard
            title="98% / 100"
            subtitle="retrieval accuracy rate utilizing Pinecone integrated server-side embeddings."
            icon={<Star size={18} />}
            span={6}
            accent="butter"
            big
          />
          <FeatureCard
            title="Diarized transcript segments."
            desc="We slide text loops into 200-word overlap groups to maintain conversational context."
            icon={<BookOpen size={18} />}
            span={6}
            accent="sky"
          >
            <CourseStrip />
          </FeatureCard>
          <FeatureCard
            title="Cross-platform sync."
            desc="Sovereign memory indexes configured for Stripe, Postgres, Groq, and Next.js."
            icon={<Briefcase size={18} />}
            span={6}
            accent="lilac"
          >
            <PortfolioStrip />
          </FeatureCard>
        </div>
      </div>
    </section>
  );
}

/* ---------- How it works ---------- */
function MockBubble({ text, user }) {
  return (
    <div
      style={{
        padding: '12px 16px',
        borderRadius: 16,
        background: user ? 'var(--crr-accent)' : 'rgba(255,255,255,0.08)',
        color: user ? '#fff' : 'var(--cream-100)',
        alignSelf: user ? 'flex-end' : 'flex-start',
        maxWidth: '85%',
        fontSize: 14,
        animation: 'crr-riseIn 0.5s cubic-bezier(.2,.7,.2,1) both',
      }}
    >
      {text}
    </div>
  );
}

function MockDiscovery() {
  return (
    <>
      <MockBubble text="[Ambient Recording Room #012] Listening..." />
      <MockBubble user text="Devon Chen: 'I evaluated the pricing tier. Stripe handles our projected volume best.'" />
      <MockBubble text="Nexus: 'Analyzing statement for vector indexing...'" />
    </>
  );
}

function MockAssessment() {
  const signals = [
    { l: 'Decision confidence', v: 98 },
    { l: 'Speaker alignment', v: 84 },
    { l: 'Compliance checks', v: 91 },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '6px 8px' }}>
      <div style={{ fontSize: 13, color: 'var(--cream-300)' }}>Processing signals · from sync stream</div>
      {signals.map((s) => (
        <div key={s.l} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, fontSize: 13 }}>{s.l}</div>
          <div style={{ width: 140, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ width: `${s.v}%`, height: '100%', background: 'var(--crr-accent)', transition: 'width 0.8s ease' }} />
          </div>
          <div className="tnum" style={{ fontSize: 12, minWidth: 30, textAlign: 'right', color: 'var(--cream-200)' }}>
            {s.v}%
          </div>
        </div>
      ))}
    </div>
  );
}

function MockExploration() {
  const opts = [
    { t: 'Stripe Select Decision', m: 98 },
    { t: 'Postgres Tech Stack choice', m: 94 },
    { t: 'SOC 2 compliance check', m: 86 },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {opts.map((o) => (
        <div
          key={o.t}
          style={{
            padding: '14px 16px',
            borderRadius: 14,
            background: 'rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }} className="truncate">{o.t}</div>
          <div style={{ fontSize: 12, color: 'var(--peach)', fontWeight: 600 }}>{o.m}%</div>
          <ChevronRight size={16} />
        </div>
      ))}
    </div>
  );
}

function MockRoadmap() {
  const weeks = [
    { l: '1. Ingest audio stream diarization', done: true },
    { l: '2. Generate 200-word overlap chunks', done: true },
    { l: '3. Vectorize in Pinecone index', current: true },
    { l: '4. Groq RAG Llama response synthesis', done: false },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {weeks.map((w) => (
        <div key={w.l} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}>
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: w.done ? 'var(--crr-accent)' : w.current ? 'transparent' : 'rgba(255,255,255,0.1)',
              border: w.current ? '2px dashed var(--crr-accent)' : 'none',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
              color: '#fff',
            }}
          >
            {w.done && <Check size={11} />}
          </div>
          <span
            style={{
              fontSize: 13.5,
              color: w.current ? 'var(--peach)' : 'var(--cream-200)',
              fontWeight: w.current ? 500 : 400,
            }}
          >
            {w.l}
          </span>
        </div>
      ))}
    </div>
  );
}

function HowMock({ active }) {
  const labels = ['RECORDING', 'CHUNKING', 'VECTORIZATION', 'SYNTHESIS'];
  return (
    <div
      style={{
        padding: 20,
        borderRadius: 28,
        background: 'var(--ink-900)',
        color: 'var(--cream-50)',
        minHeight: 460,
        boxShadow: 'var(--crr-shadow-lg)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#4a4037' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#4a4037' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#4a4037' }} />
        <span className="eyebrow" style={{ marginLeft: 'auto', color: 'var(--cream-300)' }}>
          {labels[active]}
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, padding: '12px 4px' }}>
        {active === 0 && <MockDiscovery />}
        {active === 1 && <MockAssessment />}
        {active === 2 && <MockExploration />}
        {active === 3 && <MockRoadmap />}
      </div>
      <div
        style={{
          position: 'absolute',
          left: -60,
          bottom: -60,
          width: 240,
          height: 240,
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--crr-accent) 0%, transparent 70%)',
          opacity: 0.25,
          filter: 'blur(40px)',
        }}
      />
    </div>
  );
}

function HowItWorks() {
  const steps = useMemo(
    () => [
      { k: 'Ambient Sync', d: 'Record and diarize team voice discussions passively.', icon: <MessageIcon size={20} /> },
      { k: 'Context Chunking', d: 'Break transcripts into overlapping 200-word sliding segments.', icon: <BrainIcon size={20} /> },
      { k: 'Pinecone Vectorizing', d: 'Embed and index context blocks into our sovereign hybrid vector database.', icon: <Target size={20} /> },
      { k: 'Groq RAG Synthesis', d: 'Synthesize answers using Llama-3.1-8B complete with verifiable citations.', icon: <MapIcon size={20} /> },
    ],
    [],
  );
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % steps.length), 3400);
    return () => clearInterval(id);
  }, [steps.length]);

  return (
    <section id="how" style={{ padding: '100px 0', position: 'relative' }}>
      <div className="glow-field">
        <div className="crr-glow sky" style={{ width: 500, height: 500, right: -120, top: 80, opacity: 0.35 }} />
      </div>
      <div className="crr-container mx-auto px-6 max-w-7xl" style={{ position: 'relative' }}>
        <div style={{ maxWidth: 640, marginBottom: 56 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>
            How it works
          </div>
          <h2 className="display" style={{ fontSize: 56, margin: 0, fontWeight: 400, letterSpacing: '-0.03em' }}>
            Four stages.{' '}
            <span className="serif-accent" style={{ color: 'var(--crr-accent)' }}>
              One pipeline.
            </span>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }} className="grid grid-cols-1 md:grid-cols-2">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {steps.map((s, i) => (
              <div
                key={s.k}
                onMouseEnter={() => setActive(i)}
                style={{
                  padding: '24px 20px',
                  borderRadius: 20,
                  background: i === active ? 'var(--crr-surface-2)' : 'transparent',
                  border: i === active ? '1px solid var(--crr-line)' : '1px solid transparent',
                  boxShadow: i === active ? 'var(--crr-shadow-sm)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  gap: 18,
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    background: i === active ? 'var(--crr-accent)' : 'var(--crr-surface-3)',
                    color: i === active ? '#fff' : 'var(--crr-text-dim)',
                    display: 'grid',
                    placeItems: 'center',
                    transition: 'all 0.3s ease',
                    flexShrink: 0,
                  }}
                >
                  {s.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
                    <span className="tnum" style={{ fontSize: 12, color: 'var(--crr-text-faint)', fontWeight: 500 }}>
                      0{i + 1}
                    </span>
                    <span
                      className="display"
                      style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em' }}
                    >
                      {s.k}
                    </span>
                  </div>
                  <div style={{ fontSize: 14.5, color: 'var(--crr-text-dim)', lineHeight: 1.55 }}>{s.d}</div>
                </div>
              </div>
            ))}
          </div>

          <HowMock active={active} />
        </div>
      </div>
    </section>
  );
}

/* ---------- CTA ---------- */
function CTASection() {
  return (
    <section style={{ padding: '64px 0' }}>
      <div className="crr-container mx-auto px-6 max-w-7xl">
        <div
          style={{
            padding: '80px 64px',
            borderRadius: 36,
            background: 'var(--ink-900)',
            color: 'var(--cream-50)',
            position: 'relative',
            overflow: 'hidden',
            display: 'grid',
            gridTemplateColumns: '1.2fr auto',
            gap: 40,
            alignItems: 'center',
          }}
          className="grid grid-cols-1 md:grid-cols-2"
        >
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div className="eyebrow" style={{ color: 'var(--peach)', marginBottom: 20 }}>
              One workspace sync away
            </div>
            <h2
              className="display"
              style={{ fontSize: 56, margin: 0, fontWeight: 400, letterSpacing: '-0.03em', lineHeight: 1.05 }}
            >
              Your organization's memory,
              <br />
              <span className="serif-accent" style={{ color: 'var(--peach)' }}>
                re-engineered.
              </span>
            </h2>
            <p style={{ fontSize: 17, color: 'var(--cream-300)', maxWidth: 440, marginTop: 20, lineHeight: 1.55 }}>
              Join fast-moving squads who stopped losing context and started building on verifiable organizational truth.
            </p>
          </div>
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              alignItems: 'flex-start',
            }}
          >
            <Link
              href="/auth/register"
              className="crr-btn crr-btn-primary no-underline"
              style={{ padding: '18px 28px', fontSize: 17 }}
            >
              Start free assessment <ArrowRight size={18} />
            </Link>
            <div
              style={{ fontSize: 13, color: 'var(--cream-300)', display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <Lock size={12} /> Connect Pinecone · Free to start
            </div>
          </div>
          <div
            style={{
              position: 'absolute',
              right: -100,
              top: -100,
              width: 480,
              height: 480,
              borderRadius: '50%',
              background: 'radial-gradient(circle, var(--crr-accent) 0%, transparent 70%)',
              opacity: 0.35,
              filter: 'blur(60px)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: -80,
              bottom: -80,
              width: 320,
              height: 320,
              borderRadius: '50%',
              background: 'radial-gradient(circle, var(--peach) 0%, transparent 70%)',
              opacity: 0.25,
              filter: 'blur(50px)',
            }}
          />
        </div>
      </div>
    </section>
  );
}


/* ---------- Main Export Component ---------- */
export default function MarketingHome() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if logged in
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#faf6ee] flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-[#e57a55]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="carrera-root min-h-screen relative overflow-hidden">
      <MarketingNavbar />
      <main className="relative z-10">
        <HeroSection />
        <BentoPreviewSection />
        <FeaturesSection />
        <HowItWorks />
        <CTASection />
      </main>
      <MarketingFooter />
    </div>
  );
}
