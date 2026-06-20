'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      {/* Login Card (Surface 1) */}
      <div className="bg-surface rounded-[24px] shadow-neo-outset p-8 flex flex-col gap-6 border border-white/50">
        {/* Header */}
        <div className="flex flex-col items-center gap-1">
          <h1 className="font-display text-5xl font-bold text-primary tracking-tight">Nexus</h1>
          <p className="font-body text-base text-on-surface-variant text-center">
            Sign in to your organizational memory.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg border border-red-500/30 bg-red-50 text-xs text-red-700 flex items-start gap-2.5 animate-card-pop">
            <span className="material-symbols-outlined text-red-500 shrink-0 text-base">error</span>
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          {/* Email Field */}
          <div className="flex flex-col gap-1">
            <label className="font-label text-sm font-semibold text-on-surface ml-2" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                mail
              </span>
              <input
                className="w-full pl-10 pr-4 py-3 bg-surface rounded-lg shadow-neo-inset border-none focus:ring-2 focus:ring-primary/50 outline-none transition-all font-body text-base text-on-surface placeholder:text-outline/70"
                id="email"
                name="email"
                type="email"
                placeholder="name@company.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center px-2">
              <label className="font-label text-sm font-semibold text-on-surface" htmlFor="password">
                Password
              </label>
              <Link
                className="font-body text-sm text-primary hover:text-primary-fixed-variant transition-colors"
                href="#"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                lock
              </span>
              <input
                className="w-full pl-10 pr-4 py-3 bg-surface rounded-lg shadow-neo-inset border-none focus:ring-2 focus:ring-primary/50 outline-none transition-all font-body text-base text-on-surface placeholder:text-outline/70"
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Primary Action */}
          <button
            className="mt-2 w-full py-3 bg-primary text-on-primary rounded-lg font-label text-sm font-semibold shadow-neo-primary active:shadow-none active:translate-y-[2px] hover:brightness-105 transition-all duration-200 flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-on-primary" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 w-full px-2">
          <div className="h-[1px] bg-surface-variant flex-1 shadow-[0_1px_0_white]"></div>
          <span className="font-body text-sm text-on-surface-variant">or</span>
          <div className="h-[1px] bg-surface-variant flex-1 shadow-[0_1px_0_white]"></div>
        </div>

        {/* Google SSO Action */}
        <button
          onClick={handleGoogleSignIn}
          className="w-full py-3 bg-surface text-on-surface rounded-lg font-label text-sm font-semibold shadow-neo-button active:shadow-neo-button-active hover:brightness-95 transition-all duration-200 flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
          type="button"
          disabled={isLoading}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            ></path>
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            ></path>
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            ></path>
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            ></path>
          </svg>
          <span>Continue with Google</span>
        </button>
      </div>

      {/* Footer Links */}
      <div className="mt-6 text-center">
        <p className="font-body text-sm text-on-surface-variant">
          Don't have an account?{' '}
          <Link
            className="text-primary font-medium hover:text-primary-fixed-variant transition-colors underline-offset-4 hover:underline"
            href="/auth/register"
          >
            Sign up for access
          </Link>
        </p>
      </div>
    </div>
  );
}
