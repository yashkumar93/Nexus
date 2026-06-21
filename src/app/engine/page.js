'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import MarketingNavbar from '@/components/layout/MarketingNavbar';
import MarketingFooter from '@/components/layout/MarketingFooter';

/* ---------- SVGs for icons ---------- */
const MicroIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" x2="12" y1="19" y2="22" />
  </svg>
);

const BrainIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1 0-3.88 2.5 2.5 0 0 1 0-3.88A2.5 2.5 0 0 1 9.5 2zM14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 0-3.88 2.5 2.5 0 0 0 0-3.88A2.5 2.5 0 0 0 14.5 2z" />
  </svg>
);

const DatabaseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
  </svg>
);

const AlertIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" x2="12" y1="8" y2="12" />
    <line x1="12" x2="12.01" y1="16" y2="16" />
  </svg>
);

export default function EnginePage() {
  // Intersection Observer for triggers
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.05 });

    const targets = document.querySelectorAll('.crr-reveal');
    targets.forEach(t => observer.observe(t));

    return () => {
      targets.forEach(t => observer.unobserve(t));
    };
  }, []);

  return (
    <div className="carrera-root min-h-screen relative overflow-hidden flex flex-col">
      <MarketingNavbar />

      {/* Glow Field */}
      <div className="glow-field">
        <div className="crr-glow sky" style={{ width: 520, height: 520, left: -80, top: -100 }} />
        <div className="crr-glow peach" style={{ width: 440, height: 440, right: -100, top: 120, animationDelay: '3s' }} />
        <div className="crr-glow lilac" style={{ width: 380, height: 380, left: '30%', bottom: 80, animationDelay: '1s' }} />
      </div>

      {/* Main Content */}
      <main className="flex-grow relative z-10 pt-16">
        
        {/* Hero Section */}
        <section style={{ position: 'relative', padding: '64px 0 48px' }}>
          <div className="crr-container mx-auto px-6 max-w-7xl text-center flex flex-col items-center justify-center">
            <div className="crr-reveal" style={{ marginBottom: 16 }}>
              <div className="eyebrow" style={{ color: 'var(--crr-accent)' }}>
                ContextOS × MeetMind Architecture
              </div>
            </div>
            
            <h1 className="display crr-reveal" style={{ fontSize: 56, margin: '0 0 16px', fontWeight: 400, color: 'var(--crr-text)', lineHeight: 1.1 }}>
              The Organizational{' '}
              <span className="serif-accent" style={{ color: 'var(--crr-accent)' }}>
                Memory Engine
              </span>
            </h1>
            
            <p className="crr-reveal" style={{ fontSize: 18, color: 'var(--crr-text-dim)', maxWidth: 640, margin: '0 auto 32px', lineHeight: 1.55 }}>
              Nexus is powered by a proprietary real-time pipeline designed for absolute reliability and zero-latency context recall. We translate unstructured conversations into structured organizational truth.
            </p>
          </div>
        </section>

        {/* Bento Grid Nodes */}
        <section style={{ padding: '24px 0 96px' }}>
          <div className="crr-container mx-auto px-6 max-w-7xl crr-reveal">
            <div className="grid gap-8 grid-cols-1 lg:grid-cols-12">
              
              {/* Transcription Node — 5 cols */}
              <div className="crr-card lift lg:col-span-5" style={{ padding: 32, display: 'flex', flexDirection: 'column', minHeight: 380 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--cream-100)', display: 'grid', placeItems: 'center', color: 'var(--crr-accent)', flexShrink: 0 }}>
                    <MicroIcon />
                  </div>
                  <h3 className="display" style={{ fontSize: 20, margin: 0, fontWeight: 500 }}>Whisper-Class Transcription</h3>
                </div>
                
                <p style={{ fontSize: 14, color: 'var(--crr-text-dim)', lineHeight: 1.6, marginBottom: 24 }}>
                  Flawless, multi-speaker diarization capturing every nuance of vocabulary and statement in real-time, feeding our persistent memory index.
                </p>

                {/* Animated Wave visualizer */}
                <div style={{ height: 110, borderRadius: 16, background: 'var(--cream-100)', border: '1px solid var(--crr-line)', display: 'flex', alignItems: 'end', padding: '12px', gap: 6, overflow: 'hidden', marginTop: 'auto' }}>
                  {[20, 60, 40, 80, 30, 70, 50, 90, 35, 65, 45, 75, 55, 85, 40, 60].map((h, i) => (
                    <div 
                      key={i} 
                      style={{ 
                        flex: 1, 
                        borderRadius: '4px 4px 0 0', 
                        height: `${h}%`, 
                        background: `linear-gradient(to top, var(--crr-accent-soft), var(--crr-accent))`,
                        opacity: 0.75,
                        animation: 'crr-tping 1.5s ease-in-out infinite',
                        animationDelay: `${i * 90}ms`
                      }} 
                    />
                  ))}
                </div>
              </div>

              {/* Reasoning Node — 7 cols */}
              <div className="crr-card lift lg:col-span-7" style={{ padding: 32, display: 'flex', flexDirection: 'column', minHeight: 380 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--cream-100)', display: 'grid', placeItems: 'center', color: 'var(--crr-accent)', flexShrink: 0 }}>
                    <BrainIcon />
                  </div>
                  <h3 className="display" style={{ fontSize: 20, margin: 0, fontWeight: 500 }}>AI Reasoning Engine</h3>
                </div>

                <p style={{ fontSize: 14, color: 'var(--crr-text-dim)', lineHeight: 1.6, marginBottom: 24 }}>
                  Advanced semantic processing that understands implicit agreements, action items, and contradictions automatically.
                </p>

                {/* Reasoning flow visualisation */}
                <div style={{ borderRadius: 16, border: '1px solid var(--crr-line)', padding: 20, background: 'var(--cream-100)', display: 'flex', flexDirection: 'column', gap: 12, marginTop: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ height: 6, width: 6, borderRadius: '50%', background: 'var(--crr-accent)', animation: 'pulse 2s infinite' }} />
                    <span className="eyebrow" style={{ fontSize: 10, color: 'var(--crr-accent)', letterSpacing: '0.08em' }}>Synthesizing speech segments...</span>
                  </div>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <div style={{ flex: 1, height: 8, background: 'var(--cream-200)', borderRadius: 99 }} />
                    <span style={{ fontSize: 11, color: 'var(--crr-text-dim)', fontFamily: 'var(--font-crr-sans)' }}>→</span>
                    <div style={{ padding: '6px 12px', background: 'var(--crr-surface-2)', border: '1px solid var(--crr-line)', borderRadius: 8, fontSize: 11, fontWeight: 600, color: 'var(--crr-text)' }}>
                      Entity Extraction Active
                    </div>
                  </div>
                </div>
              </div>

              {/* Persistence Layer — 8 cols */}
              <div className="crr-card lift lg:col-span-8" style={{ padding: 32, display: 'flex', flexDirection: 'column', minHeight: 360 }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'start', marginBottom: 20 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--cream-100)', display: 'grid', placeItems: 'center', color: 'var(--crr-accent)', flexShrink: 0 }}>
                    <DatabaseIcon />
                  </div>
                  <div>
                    <h3 className="display" style={{ fontSize: 20, margin: '0 0 4px', fontWeight: 500 }}>Hybrid Persistence Architecture</h3>
                    <p style={{ fontSize: 14, color: 'var(--crr-text-dim)', lineHeight: 1.6, margin: 0 }}>
                      A tri-layer database system built for rapid retrieval, low-latency cache reading, and semantic graph lookups.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginTop: 'auto' }}>
                  {[
                    { icon: '📁', label: 'Vector DB', desc: 'Pinecone serverless hybrid query indices' },
                    { icon: '🕸', label: 'Graph Nodes', desc: 'In-Memory entity & concept relations' },
                    { icon: '📄', label: 'Fast Memory Cache', desc: 'TTL-backed clean meeting segment caches' }
                  ].map(db => (
                    <div key={db.label} style={{ padding: 18, borderRadius: 16, border: '1px solid var(--crr-line)', background: 'var(--cream-50)' }}>
                      <span style={{ fontSize: 20, display: 'block', marginBottom: 8 }}>{db.icon}</span>
                      <h4 className="display" style={{ fontSize: 13, margin: '0 0 2px', fontWeight: 600 }}>{db.label}</h4>
                      <p style={{ fontSize: 11.5, color: 'var(--crr-text-dim)', margin: 0, lineHeight: 1.4 }}>{db.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contradiction — 4 cols */}
              <div className="crr-card lift lg:col-span-4" style={{ padding: 32, display: 'flex', flexDirection: 'column', minHeight: 360 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(200, 83, 44, 0.1)', display: 'grid', placeItems: 'center', color: 'var(--crr-accent)', flexShrink: 0 }}>
                    <AlertIcon />
                  </div>
                  <h3 className="display" style={{ fontSize: 20, margin: 0, fontWeight: 500 }}>Contradiction Warning</h3>
                </div>

                <p style={{ fontSize: 14, color: 'var(--crr-text-dim)', lineHeight: 1.6, marginBottom: 20 }}>
                  Active contradiction matching loops instantly flag conflicting statements against documented historical project timelines.
                </p>

                {/* Contradiction warning indicator card */}
                <div style={{ padding: 16, borderRadius: 16, border: '1px solid var(--crr-accent-soft)', background: 'rgba(200, 83, 44, 0.04)', display: 'flex', gap: 12, marginTop: 'auto' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--crr-accent)', marginTop: 6, flexShrink: 0 }} />
                  <div>
                    <span className="eyebrow" style={{ fontSize: 10, color: 'var(--crr-accent)', letterSpacing: '0.08em', display: 'block', marginBottom: 2 }}>Conflicting Statement</span>
                    <p style={{ fontSize: 12, color: 'var(--crr-text)', margin: 0, lineHeight: 1.45 }}>
                      "Q3 launch moved to November" conflicts with previously stated "October deadline".
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>

      <MarketingFooter />
    </div>
  );
}
