'use client';

import React from 'react';
import Link from 'next/link';

function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 10,
          background: 'linear-gradient(135deg, var(--crr-accent), var(--peach))',
          display: 'grid',
          placeItems: 'center',
          boxShadow: '0 2px 8px -2px var(--crr-accent)',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 3v18" />
          <path d="m5 10 7-7 7 7" />
          <circle cx="12" cy="17" r="2" />
        </svg>
      </div>
      <span className="display" style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--crr-text)' }}>
        nexus
      </span>
    </div>
  );
}

export default function AuthLayout({ children }) {
  return (
    <div
      className="carrera-root"
      style={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Glows */}
      <div className="glow-field">
        <div className="crr-glow sky"   style={{ width: 520, height: 520, left: -160, top: -100 }} />
        <div className="crr-glow sage"  style={{ width: 440, height: 440, right: -100, top: 200, animationDelay: '2s' }} />
        <div className="crr-glow peach" style={{ width: 380, height: 380, left: '50%', bottom: -100, animationDelay: '4s' }} />
      </div>

      {/* Top bar */}
      <div style={{ padding: '20px 32px', display: 'flex', alignItems: 'center', position: 'relative', zIndex: 2 }}>
        <Link href="/" className="no-underline">
          <Logo />
        </Link>
      </div>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px 32px 60px',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {children}
      </main>

      <div style={{ padding: '24px 32px', textAlign: 'center', fontSize: 12.5, color: 'var(--crr-text-faint)', position: 'relative', zIndex: 2 }}>
        Free to start · No credit card required · Your conversations stay yours.
      </div>
    </div>
  );
}
