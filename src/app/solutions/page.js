'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import MarketingNavbar from '@/components/layout/MarketingNavbar';
import MarketingFooter from '@/components/layout/MarketingFooter';

/* ---------- SVGs for icons ---------- */
const ArrowRight = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="inline-block ml-1">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const FileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
  </svg>
);

const GraduationIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.91a2 2 0 0 0 1.66 0z" />
    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
  </svg>
);

export default function SolutionsPage() {
  // Intersection Observer for viewport triggers
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

      {/* Atmospheric Glow Field */}
      <div className="glow-field">
        <div className="crr-glow peach" style={{ width: 500, height: 500, left: -100, top: -100 }} />
        <div className="crr-glow sage" style={{ width: 420, height: 420, right: -80, top: 60, animationDelay: '2s' }} />
        <div className="crr-glow butter" style={{ width: 380, height: 380, left: '20%', bottom: 100, animationDelay: '4s' }} />
      </div>

      {/* Main Container */}
      <main className="flex-grow relative z-10 pt-16">
        
        {/* Hero Section */}
        <section style={{ position: 'relative', padding: '64px 0 48px' }}>
          <div className="crr-container mx-auto px-6 max-w-7xl text-center flex flex-col items-center justify-center">
            <div className="crr-reveal" style={{ marginBottom: 16 }}>
              <div className="eyebrow" style={{ color: 'var(--crr-accent)' }}>
                Sovereign Organization Solutions
              </div>
            </div>
            
            <h1 className="display crr-reveal" style={{ fontSize: 56, margin: '0 0 16px', fontWeight: 400, color: 'var(--crr-text)', lineHeight: 1.1 }}>
              Solutions for Every{' '}
              <span className="serif-accent" style={{ color: 'var(--crr-accent)' }}>
                Collaborative Mind
              </span>
            </h1>
            
            <p className="crr-reveal" style={{ fontSize: 18, color: 'var(--crr-text-dim)', maxWidth: 640, margin: '0 auto 32px', lineHeight: 1.55 }}>
              Nexus adapts ambiently to your team's role, providing the exact context you need, exactly when you need it. Discover how our Organizational Memory Engine transforms daily velocity.
            </p>
          </div>
        </section>

        {/* Role Benefits - Bento Grid */}
        <section style={{ padding: '32px 0 64px' }}>
          <div className="crr-container mx-auto px-6 max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-8 crr-reveal">
            
            {/* Engineering Manager */}
            <div className="crr-card lift" style={{ padding: 32, display: 'flex', flexDirection: 'column', minHeight: 320 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--cream-100)', display: 'grid', placeItems: 'center', color: 'var(--crr-accent)', flexShrink: 0 }}>
                  <SettingsIcon />
                </div>
                <h3 className="display" style={{ fontSize: 20, margin: 0, fontWeight: 500 }}>Engineering Managers</h3>
              </div>
              <p style={{ fontSize: 14.5, color: 'var(--crr-text-dim)', lineHeight: 1.6, flexGrow: 1, margin: '0 0 20px' }}>
                Priya uses Nexus to maintain architectural governance without slowing down developer velocity. The engine automatically links codebase pull requests to historical technical decision logs.
              </p>
              <div style={{ borderTop: '1px solid var(--crr-line)', paddingTop: 14 }}>
                <span className="eyebrow" style={{ color: 'var(--crr-accent)', fontSize: 11 }}>
                  ● Governance &amp; Velocity
                </span>
              </div>
            </div>

            {/* Product Manager */}
            <div className="crr-card lift" style={{ padding: 32, display: 'flex', flexDirection: 'column', minHeight: 320 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--cream-100)', display: 'grid', placeItems: 'center', color: 'var(--crr-accent)', flexShrink: 0 }}>
                  <FileIcon />
                </div>
                <h3 className="display" style={{ fontSize: 20, margin: 0, fontWeight: 500 }}>Product Managers</h3>
              </div>
              <p style={{ fontSize: 14.5, color: 'var(--crr-text-dim)', lineHeight: 1.6, flexGrow: 1, margin: '0 0 20px' }}>
                Devon relies on real-time context during strategy alignment syncs. Nexus surfaces relevant customer feedback notes and past feature experiment results instantly.
              </p>
              <div style={{ borderTop: '1px solid var(--crr-line)', paddingTop: 14 }}>
                <span className="eyebrow" style={{ color: 'var(--crr-accent)', fontSize: 11 }}>
                  ● Real-time Context
                </span>
              </div>
            </div>

            {/* New Hires */}
            <div className="crr-card lift" style={{ padding: 32, display: 'flex', flexDirection: 'column', minHeight: 320 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--cream-100)', display: 'grid', placeItems: 'center', color: 'var(--crr-accent)', flexShrink: 0 }}>
                  <GraduationIcon />
                </div>
                <h3 className="display" style={{ fontSize: 20, margin: 0, fontWeight: 500 }}>New Hires</h3>
              </div>
              <p style={{ fontSize: 14.5, color: 'var(--crr-text-dim)', lineHeight: 1.6, flexGrow: 1, margin: '0 0 20px' }}>
                Nadia experiences frictionless onboarding. The memory engine maps organizational knowledge dynamically, allowing her to acquire deep context without constant shoulder-tapping.
              </p>
              <div style={{ borderTop: '1px solid var(--crr-line)', paddingTop: 14 }}>
                <span className="eyebrow" style={{ color: 'var(--crr-accent)', fontSize: 11 }}>
                  ● Rapid Onboarding
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* Workflow Section */}
        <section style={{ padding: '64px 0', background: 'var(--cream-100)', borderTop: '1px solid var(--crr-line)', borderBottom: '1px solid var(--crr-line)' }}>
          <div className="crr-container mx-auto px-6 max-w-7xl crr-reveal">
            <h2 className="display text-center" style={{ fontSize: 36, margin: '0 0 48px', fontWeight: 400 }}>
              How the Memory Engine{' '}
              <span className="serif-accent" style={{ color: 'var(--crr-accent)' }}>
                Operates
              </span>
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 64, alignItems: 'center' }} className="grid grid-cols-1 md:grid-cols-2">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {[
                  { n: 1, title: 'Ingest', body: 'Nexus quietly integrates with your existing tools, absorbing transcripts, design documents, and decision briefs.' },
                  { n: 2, title: 'Synthesize', body: 'The engine flags logic patterns, resolving system contradictions and mapping relational entities across domains.' },
                  { n: 3, title: 'Surface', body: 'Targeted context is delivered ambiently right when needed, tailored to the user\'s current work state.' }
                ].map(s => (
                  <div key={s.n} style={{ display: 'flex', gap: 18 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--crr-accent)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 'bold', fontSize: 14, flexShrink: 0 }}>
                      {s.n}
                    </div>
                    <div>
                      <h4 className="display" style={{ fontSize: 18, margin: '0 0 4px', fontWeight: 500 }}>{s.title}</h4>
                      <p style={{ fontSize: 13.5, color: 'var(--crr-text-dim)', margin: 0, lineHeight: 1.5 }}>{s.body}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="crr-card" style={{ overflow: 'hidden', height: 320, position: 'relative' }}>
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCgOqVN0BLl6g8xlV_ARp7evW5eBuRyC_WcfNVNU_NSx3su8S5fBTNfV131uWZuAMBFMwV21zOCxvX0b4yFWrld3_nOTEn10c_8R3r-Xs8dJHRVOXGx2pO1lekHIc1zayZvuSm_sxQpEyl-1qJUnGJOdtg2h3XF0BNIZ71WzASdGD1IOw3XzxUlHisY-7yPfMZcvFzn-k_kAfrQIEDAbHhAl5xdr_cUl3TicMh4TNxmmVwCdi4uARe-d9gusKU6Q68n6WwH2Rp_X38" 
                  alt="Nexus context loop visual representation" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} 
                />
              </div>
            </div>
          </div>
        </section>

        {/* Case Studies */}
        <section style={{ padding: '64px 0 96px' }}>
          <div className="crr-container mx-auto px-6 max-w-7xl crr-reveal">
            <h2 className="display" style={{ fontSize: 36, margin: '0 0 36px', fontWeight: 400 }}>
              Success{' '}
              <span className="serif-accent" style={{ color: 'var(--crr-accent)' }}>
                Stories
              </span>
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }} className="grid grid-cols-1 md:grid-cols-2">
              <div style={{ textDecoration: 'none', color: 'inherit' }} className="group">
                <div className="crr-card" style={{ height: 240, overflow: 'hidden', marginBottom: 16, position: 'relative' }}>
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGw6eUDdqR5scgw8gqbE8zzPGqlCBMtw2F1Svz40QZJfdLRlwLj_fabhuMK2sDAc7JwFIhwCEGMcVEzqEb_UTnVk5gKRDvRI6U_9QAWejvtRVdviDQ_NWwWleasfg3FsOp3d6e1UyuQeL4Mn205xbHoN8JEpjRVyWfyiRJpDQ4eJmrBcWx9FK5Kvoiv25oRiCq2fO36yjn1ZOVUlmMXZQpRMaRCJzxt9x7WDLJ9qykld5QnOgPRWgkzrvzowy5VFRgvVBnZCdMHlY" 
                    alt="Fintech Corp case study illustration" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }} 
                    className="group-hover:scale-[1.03]"
                  />
                </div>
                <h4 className="display group-hover:text-accent transition-colors" style={{ fontSize: 20, margin: '0 0 4px', fontWeight: 500, color: 'var(--crr-text)' }}>Fintech Corp</h4>
                <p style={{ fontSize: 14, color: 'var(--crr-text-dim)', margin: 0, lineHeight: 1.5 }}>
                  Reduced developer onboarding time by 40% and completely eliminated duplicate architectural reviews.
                </p>
              </div>
              <div style={{ textDecoration: 'none', color: 'inherit' }} className="group">
                <div className="crr-card" style={{ height: 240, overflow: 'hidden', marginBottom: 16, position: 'relative' }}>
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEPRj_elWahpels7p6edmNJUvrD_go6jNPOdmDkfA_Aq_kfCC3EuSgn2O6F-6TmkE5WaG399yPZV99UO-sWx4gjkMXQ7VhqcW58dL7YQKKYKwUzK_xbODJRj3vVCkWiSZP2TOXRpEU8slzUSeY7QAn1Etl9LtoSWBrJxEsrN1kNwcxfMpIKco56Wf0c-hevTRupPKrMzqJ6GiubVsJ7B2kgNo7oW9YXqwBW1vrI9flBp7aN6MEMv8Xi7_246E85bfiWyM0pEyDoqs" 
                    alt="HealthTech innovators case study illustration" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }} 
                    className="group-hover:scale-[1.03]"
                  />
                </div>
                <h4 className="display group-hover:text-accent transition-colors" style={{ fontSize: 20, margin: '0 0 4px', fontWeight: 500, color: 'var(--crr-text)' }}>HealthTech Innovators</h4>
                <p style={{ fontSize: 14, color: 'var(--crr-text-dim)', margin: 0, lineHeight: 1.5 }}>
                  Accelerated feature delivery cycles by surfacing historical context during product roadmap alignment meetings.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

      <MarketingFooter />
    </div>
  );
}
