'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </svg>
);

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      let friendlyError = 'Authentication failed. Please verify your credentials.';
      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential'
      ) {
        friendlyError = 'Invalid email or password.';
      } else if (err.message === 'EMAIL_NOT_VERIFIED') {
        friendlyError = 'Your email has not been verified yet.';
      } else if (err.message) {
        friendlyError = err.message;
      }
      setError(friendlyError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');

    try {
      await loginWithGoogle();
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Google Sign-In failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="crr-card crr-reveal"
      style={{ width: '100%', maxWidth: 400, padding: 36, boxShadow: 'var(--crr-shadow-lg)', textAlign: 'center' }}
    >
      {/* Brand logo image repeated */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            background: 'linear-gradient(135deg, var(--crr-accent), var(--peach))',
            display: 'grid',
            placeItems: 'center',
            boxShadow: '0 6px 18px -6px var(--crr-accent)',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 3v18" />
            <path d="m5 10 7-7 7 7" />
            <circle cx="12" cy="17" r="2" />
          </svg>
        </div>
      </div>

      <h1 className="display" style={{ fontSize: 32, fontWeight: 400, margin: 0, letterSpacing: '-0.03em' }}>
        Welcome to{' '}
        <span className="serif-accent" style={{ color: 'var(--crr-accent)' }}>
          nexus
        </span>
        .
      </h1>
      
      <p style={{ fontSize: 14.5, color: 'var(--crr-text-dim)', margin: '10px 0 28px' }}>
        Sign in to access your organization's collective memory.
      </p>

      {error && (
        <div
          style={{
            padding: '10px 14px',
            marginBottom: 18,
            background: 'rgba(200,83,44,0.08)',
            border: '1px solid rgba(200,83,44,0.25)',
            borderRadius: 12,
            color: 'var(--crr-accent-deep)',
            fontSize: 13,
            textAlign: 'left',
            lineHeight: 1.5,
          }}
        >
          {error}
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label htmlFor="email" className="eyebrow" style={{ fontSize: 10, letterSpacing: '0.08em' }}>Email Address</label>
          <input
            type="email"
            id="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            disabled={isLoading}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label htmlFor="password" className="eyebrow" style={{ fontSize: 10, letterSpacing: '0.08em' }}>Password</label>
            <Link
              href="#"
              style={{ fontSize: 12, color: 'var(--crr-accent)', textDecoration: 'none', fontWeight: 500 }}
              className="hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
              style={{
                width: '100%',
                background: 'var(--crr-surface-3)',
                border: '1px solid var(--crr-line)',
                borderRadius: 12,
                padding: '12px 48px 12px 16px',
                fontSize: 13.5,
                color: 'var(--crr-text)',
                outline: 'none',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--crr-accent)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--crr-line)'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--crr-text-dim)',
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
              }}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="crr-btn crr-btn-primary w-full text-center flex items-center justify-center font-bold"
          style={{ height: 48, borderRadius: 12, fontSize: 14, marginTop: 8 }}
        >
          {isLoading ? (
            <span className="animate-pulse">Signing in...</span>
          ) : (
            <span>Sign In</span>
          )}
        </button>
      </form>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '20px 0' }}>
        <div style={{ height: 1, background: 'var(--crr-line)', flex: 1 }} />
        <span style={{ fontSize: 13, color: 'var(--crr-text-faint)' }}>or</span>
        <div style={{ height: 1, background: 'var(--crr-line)', flex: 1 }} />
      </div>

      {/* Google SSO Button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          padding: '14px 20px',
          borderRadius: 12,
          background: isLoading ? 'var(--crr-surface-3)' : 'var(--crr-surface-2)',
          border: '1px solid var(--crr-line-strong)',
          color: 'var(--crr-text)',
          fontWeight: 500,
          fontSize: 14,
          cursor: isLoading ? 'not-allowed' : 'pointer',
          opacity: isLoading ? 0.7 : 1,
          transition: 'all 0.2s ease',
          fontFamily: 'inherit',
          boxShadow: 'var(--crr-shadow-sm)',
        }}
        onMouseEnter={(e) => {
          if (!isLoading) {
            e.currentTarget.style.background = 'var(--crr-surface-3)';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = 'var(--crr-shadow)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--crr-surface-2)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'var(--crr-shadow-sm)';
        }}
      >
        <GoogleIcon />
        Continue with Google
      </button>

      <p style={{ marginTop: 24, fontSize: 13, color: 'var(--crr-text-faint)' }}>
        Don't have an account?{' '}
        <Link
          href="/auth/register"
          style={{ color: 'var(--crr-accent)', textDecoration: 'none', fontWeight: 600 }}
          className="hover:underline"
        >
          Sign up for access
        </Link>
      </p>
    </div>
  );
}
