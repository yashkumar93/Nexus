'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/* ---------- ArrowRight Icon ---------- */
const ArrowRight = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="inline-block ml-1">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

/* ---------- Logo Component ---------- */
export function Logo({ compact }) {
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
      {!compact && (
        <span className="display" style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--crr-text)' }}>
          nexus
        </span>
      )}
    </div>
  );
}

/* ---------- MarketingNavbar ---------- */
export default function MarketingNavbar() {
  const pathname = usePathname();

  const getLinkStyle = (path) => {
    const isActive = pathname === path;
    return {
      fontSize: 14,
      padding: '8px 14px',
      color: isActive ? 'var(--crr-accent)' : 'var(--crr-text-dim)',
      fontWeight: isActive ? '600' : '500',
    };
  };

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(251,247,241,0.75)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--crr-line)',
      }}
    >
      <Link href="/" className="no-underline">
        <Logo />
      </Link>
      <div style={{ display: 'flex', gap: 4, marginLeft: 20 }} className="hidden md:flex">
        <Link 
          href="/solutions" 
          className="crr-btn crr-btn-ghost no-underline" 
          style={getLinkStyle('/solutions')}
        >
          Solutions
        </Link>
        <Link 
          href="/engine" 
          className="crr-btn crr-btn-ghost no-underline" 
          style={getLinkStyle('/engine')}
        >
          Engine
        </Link>
        <Link 
          href="/contact" 
          className="crr-btn crr-btn-ghost no-underline" 
          style={getLinkStyle('/contact')}
        >
          Contact
        </Link>
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link href="/auth/login" className="crr-btn crr-btn-ghost no-underline" style={{ fontSize: 14 }}>
          Sign in
        </Link>
        <Link href="/auth/register" className="crr-btn crr-btn-primary no-underline" style={{ fontSize: 14 }}>
          Get Started <ArrowRight size={16} />
        </Link>
      </div>
    </nav>
  );
}
