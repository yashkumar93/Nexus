'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

function authErrorMessage(error) {
  const code = error?.code || '';
  if (code === 'auth/invalid-email') return 'Enter a valid email address.';
  if (code === 'auth/user-not-found') return 'No account exists for that email.';
  if (code === 'auth/operation-not-allowed') {
    return 'Password reset is not enabled for this Firebase project.';
  }
  return error?.message || 'Could not send the reset email. Please try again.';
}

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function submitReset(event) {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await resetPassword(email);
      setSuccess('Password reset email sent. Open the link in your inbox to verify and create a new password.');
      setEmail('');
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="glass-strong relative overflow-hidden rounded-2xl border border-border p-8 shadow-2xl">
      <div className="mb-8 flex flex-col items-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-strong text-xl font-bold text-accent-ink shadow-lg shadow-accent-strong/25">
          C
        </div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-normal text-text-1">
          Reset Password
        </h2>
        <p className="mt-1 text-center text-sm text-text-3">
          Enter your email and Firebase will send a verified reset link.
        </p>
      </div>

      {error && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-danger/30 bg-danger/10 p-4 text-xs text-text-1 animate-card-pop">
          <svg className="mt-0.5 h-4 w-4 shrink-0 text-danger" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-good/30 bg-good/10 p-4 text-xs text-text-1 animate-card-pop">
          <svg className="mt-0.5 h-4 w-4 shrink-0 text-good" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m5 12 4 4L19 6" />
          </svg>
          <span className="leading-relaxed">{success}</span>
        </div>
      )}

      <form className="space-y-4" onSubmit={submitReset}>
        <div>
          <label htmlFor="email" className="mb-2 block text-xs font-medium text-text-2">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-border bg-bg-soft px-4 py-3 text-sm text-text-1 outline-none transition focus:border-accent-strong"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-accent-strong px-4 py-3.5 text-sm font-semibold text-accent-ink transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? 'Sending reset email...' : 'Send reset email'}
        </button>
      </form>

      <div className="mt-7 border-t border-border/60 pt-5 text-center text-xs text-text-3">
        Remembered it?{' '}
        <Link href="/auth/login" className="font-medium text-accent underline underline-offset-4 hover:text-accent-strong">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
