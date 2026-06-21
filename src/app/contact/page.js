'use client';

import React, { useState, useEffect } from 'react';
import MarketingNavbar from '@/components/layout/MarketingNavbar';
import MarketingFooter from '@/components/layout/MarketingFooter';

/* ---------- SVGs for icons ---------- */
const LightingIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2 L3 14 h9 l-1 8L22 10 h-9 z" />
  </svg>
);

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    size: '1-10',
    message: '',
    interest: 'sales'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Intersection Observer for animation triggers
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <div className="carrera-root min-h-screen relative overflow-hidden flex flex-col">
      <MarketingNavbar />

      {/* Atmospheric Glow Field */}
      <div className="glow-field">
        <div className="crr-glow peach" style={{ width: 500, height: 500, left: -100, top: -100 }} />
        <div className="crr-glow sage" style={{ width: 420, height: 420, right: -80, top: 60, animationDelay: '2s' }} />
        <div className="crr-glow butter" style={{ width: 380, height: 380, left: '40%', bottom: 50, animationDelay: '4s' }} />
      </div>

      {/* Main Container */}
      <main className="flex-grow relative z-10 pt-16 flex items-center justify-center">
        
        <section className="crr-container mx-auto px-6 max-w-7xl py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center crr-reveal">
          
          {/* Left Column: Context / Info */}
          <div className="lg:col-span-5 space-y-6">
            <div style={{ marginBottom: 12 }}>
              <div className="eyebrow" style={{ color: 'var(--crr-accent)' }}>
                Speak with Sales
              </div>
            </div>
            
            <h1 className="display" style={{ fontSize: 46, margin: 0, fontWeight: 400, color: 'var(--crr-text)', lineHeight: 1.1 }}>
              Let's build your organization's{' '}
              <span className="serif-accent" style={{ color: 'var(--crr-accent)' }}>
                permanent memory.
              </span>
            </h1>
            
            <p style={{ fontSize: 15, color: 'var(--crr-text-dim)', lineHeight: 1.6 }}>
              Have questions about data privacy, custom data ingestion pipelines, SOC-2 certifications, or dedicated VPC clusters? Connect with our team to explore options for your enterprise.
            </p>

            <div style={{ borderTop: '1px solid var(--crr-line)', paddingTop: 24 }} className="space-y-6">
              <div style={{ display: 'flex', gap: 14, alignItems: 'start' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--cream-100)', display: 'grid', placeItems: 'center', color: 'var(--crr-accent)', flexShrink: 0 }}>
                  <LightingIcon />
                </div>
                <div>
                  <h4 className="display" style={{ fontSize: 15, fontWeight: 500, margin: '0 0 2px' }}>Instant Sandbox Access</h4>
                  <p style={{ fontSize: 13, color: 'var(--crr-text-dim)', margin: 0 }}>Skip onboarding meetings and test our search interface immediately in the trial sandbox.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 14, alignItems: 'start' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--cream-100)', display: 'grid', placeItems: 'center', color: 'var(--crr-accent)', flexShrink: 0 }}>
                  <LockIcon />
                </div>
                <div>
                  <h4 className="display" style={{ fontSize: 15, fontWeight: 500, margin: '0 0 2px' }}>SOC-2 Type II Compliance</h4>
                  <p style={{ fontSize: 13, color: 'var(--crr-text-dim)', margin: 0 }}>Enterprise workspaces are hosted on isolated pods with complete data shielding configurations.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7 w-full">
            <div className="crr-card" style={{ padding: 32 }}>
              {submitted ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }} className="space-y-5">
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(159, 184, 154, 0.15)', display: 'grid', placeItems: 'center', margin: '0 auto', fontSize: 24, color: 'var(--crr-text)', border: '1px solid var(--sage)' }}>
                    ✓
                  </div>
                  <h3 className="display" style={{ fontSize: 22, fontWeight: 500, color: 'var(--crr-text)', margin: 0 }}>Message Transmitted</h3>
                  <p style={{ fontSize: 14.5, color: 'var(--crr-text-dim)', maxWidth: 360, margin: '12px auto 24px', lineHeight: 1.5 }}>
                    Thanks for reaching out! A Nexus solutions architect will review your workspace requirements and follow up within 4 hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--crr-accent)', fontSize: 13, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label htmlFor="name" className="eyebrow" style={{ fontSize: 10, letterSpacing: '0.08em' }}>Your Name</label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Priya Patel"
                        style={{
                          width: '100%',
                          background: 'var(--crr-surface-3)',
                          border: '1px solid var(--crr-line)',
                          borderRadius: 12,
                          padding: '12px 16px',
                          fontSize: 13.5,
                          color: 'var(--crr-text)',
                          outline: 'none',
                          transition: 'border-color 0.2s ease',
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--crr-accent)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--crr-line)'}
                      />
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label htmlFor="email" className="eyebrow" style={{ fontSize: 10, letterSpacing: '0.08em' }}>Work Email</label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g. priya@company.com"
                        style={{
                          width: '100%',
                          background: 'var(--crr-surface-3)',
                          border: '1px solid var(--crr-line)',
                          borderRadius: 12,
                          padding: '12px 16px',
                          fontSize: 13.5,
                          color: 'var(--crr-text)',
                          outline: 'none',
                          transition: 'border-color 0.2s ease',
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--crr-accent)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--crr-line)'}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label htmlFor="company" className="eyebrow" style={{ fontSize: 10, letterSpacing: '0.08em' }}>Company Name</label>
                      <input
                        type="text"
                        id="company"
                        required
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="e.g. Nexus Labs"
                        style={{
                          width: '100%',
                          background: 'var(--crr-surface-3)',
                          border: '1px solid var(--crr-line)',
                          borderRadius: 12,
                          padding: '12px 16px',
                          fontSize: 13.5,
                          color: 'var(--crr-text)',
                          outline: 'none',
                          transition: 'border-color 0.2s ease',
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--crr-accent)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--crr-line)'}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label htmlFor="size" className="eyebrow" style={{ fontSize: 10, letterSpacing: '0.08em' }}>Company Size</label>
                      <select
                        id="size"
                        value={formData.size}
                        onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                        style={{
                          width: '100%',
                          background: 'var(--crr-surface-3)',
                          border: '1px solid var(--crr-line)',
                          borderRadius: 12,
                          padding: '12px 16px',
                          fontSize: 13.5,
                          color: 'var(--crr-text)',
                          outline: 'none',
                          appearance: 'none',
                        }}
                      >
                        <option value="1-10">1 - 10 employees</option>
                        <option value="11-50">11 - 50 employees</option>
                        <option value="51-200">51 - 200 employees</option>
                        <option value="201-1000">201 - 1000 employees</option>
                        <option value="1000+">1000+ employees</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label className="eyebrow" style={{ fontSize: 10, letterSpacing: '0.08em' }}>Primary Need</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'sales', label: 'Enterprise Sales' },
                        { id: 'demo', label: 'Live Demo' },
                        { id: 'support', label: 'Technical Spec' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, interest: item.id })}
                          style={{
                            padding: '10px',
                            borderRadius: 10,
                            border: formData.interest === item.id 
                              ? '1px solid var(--crr-accent)' 
                              : '1px solid var(--crr-line)',
                            background: formData.interest === item.id 
                              ? 'rgba(200, 83, 44, 0.08)' 
                              : 'var(--crr-surface-2)',
                            color: formData.interest === item.id 
                              ? 'var(--crr-accent)' 
                              : 'var(--crr-text-dim)',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label htmlFor="message" className="eyebrow" style={{ fontSize: 10, letterSpacing: '0.08em' }}>Your Message</label>
                    <textarea
                      id="message"
                      required
                      rows="4"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us about your team's workflow and what you want to build..."
                      style={{
                        width: '100%',
                        background: 'var(--crr-surface-3)',
                        border: '1px solid var(--crr-line)',
                        borderRadius: 12,
                        padding: '12px 16px',
                        fontSize: 13.5,
                        color: 'var(--crr-text)',
                        outline: 'none',
                        transition: 'border-color 0.2s ease',
                        resize: 'none'
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--crr-accent)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--crr-line)'}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="crr-btn crr-btn-primary w-full text-center flex items-center justify-center font-bold"
                    style={{ height: 48, borderRadius: 12, fontSize: 14 }}
                  >
                    {isSubmitting ? (
                      <span className="animate-pulse">Transmitting...</span>
                    ) : (
                      <span>Submit Query</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
