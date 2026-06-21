'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from './MarketingNavbar';

/* ---------- MarketingFooter ---------- */
export default function MarketingFooter() {
  const cols = [
    { h: 'Product', l: ['Features', 'Solutions', 'Engine', 'Changelog'] },
    { h: 'Company', l: ['About', 'Security', 'Contact', 'Press'] },
    { h: 'Ecosystem', l: ['Pinecone DB', 'Groq Llama', 'Developer API', 'Community'] },
  ];

  return (
    <footer style={{ padding: '64px 0 40px', borderTop: '1px solid var(--crr-line)', background: 'var(--crr-surface)' }}>
      <div className="crr-container mx-auto px-6 max-w-7xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8">
        <div style={{ gridColumn: 'span 2' }}>
          <Logo />
          <p style={{ fontSize: 14, color: 'var(--crr-text-dim)', maxWidth: 280, marginTop: 16, lineHeight: 1.6 }}>
            An ambient memory engine for loud workspace questions. Made with care for collaborative teams.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.h}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>
              {c.h}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {c.l.map((x) => {
                const href = x.toLowerCase() === 'contact' ? '/contact' : 
                             x.toLowerCase() === 'solutions' ? '/solutions' :
                             x.toLowerCase() === 'engine' ? '/engine' : '#';
                return (
                  <Link 
                    key={x} 
                    href={href} 
                    style={{ fontSize: 14, color: 'var(--crr-text-dim)', textDecoration: 'none' }} 
                    className="hover:text-accent transition-colors"
                  >
                    {x}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div
        className="crr-container mx-auto px-6 max-w-7xl"
        style={{
          marginTop: 48,
          paddingTop: 24,
          borderTop: '1px solid var(--crr-line)',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 13,
          color: 'var(--crr-text-faint)',
        }}
      >
        <div>© 2026 Nexus AI. All rights belong to their owners.</div>
        <div style={{ display: 'flex', gap: 20 }}>
          <Link href="#" style={{ color: 'inherit', textDecoration: 'none' }}>
            Privacy
          </Link>
          <Link href="#" style={{ color: 'inherit', textDecoration: 'none' }}>
            Terms
          </Link>
          <Link href="/contact" style={{ color: 'inherit', textDecoration: 'none' }}>
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
