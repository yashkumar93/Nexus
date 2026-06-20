'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function RegisterPage() {
  const { register, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!fullname.trim()) {
      setError('Full Name is required.');
      setIsLoading(false);
      return;
    }

    try {
      await register(fullname, email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setError('');

    try {
      await loginWithGoogle();
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Google Sign-Up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      {/* Brand Logo and Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full neo-raised bg-surface mb-6">
          <span className="material-symbols-outlined text-primary text-3xl">hub</span>
        </div>
        <h1 className="font-headline font-bold text-3xl tracking-tight text-on-surface mb-2">Nexus</h1>
        <h2 className="font-display font-semibold text-xl text-on-surface-variant mb-2">
          Join the collective memory.
        </h2>
        <p className="text-sm text-on-surface-variant">Start capturing your organization's knowledge today.</p>
      </div>

      {/* Sign Up Card */}
      <div className="bg-surface rounded-xl p-8 neo-raised border border-white/40">
        {error && (
          <div className="mb-6 p-3 rounded-lg border border-red-500/30 bg-red-50 text-xs text-red-700 flex items-start gap-2.5 animate-card-pop">
            <span className="material-symbols-outlined text-red-500 shrink-0 text-base">error</span>
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2" htmlFor="fullname">
              Full Name
            </label>
            <div className="relative rounded-lg">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-on-surface-variant">person</span>
              </div>
              <input
                className="neo-input block w-full pl-10 pr-3 py-3 rounded-lg text-on-surface placeholder-on-surface-variant transition-all duration-200"
                id="fullname"
                name="fullname"
                type="text"
                placeholder="Jane Doe"
                required
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Work Email */}
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2" htmlFor="email">
              Work Email
            </label>
            <div className="relative rounded-lg">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-on-surface-variant">mail</span>
              </div>
              <input
                className="neo-input block w-full pl-10 pr-3 py-3 rounded-lg text-on-surface placeholder-on-surface-variant transition-all duration-200"
                id="email"
                name="email"
                type="email"
                placeholder="jane@company.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2" htmlFor="password">
              Password
            </label>
            <div className="relative rounded-lg">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-on-surface-variant">lock</span>
              </div>
              <input
                className="neo-input block w-full pl-10 pr-3 py-3 rounded-lg text-on-surface placeholder-on-surface-variant transition-all duration-200"
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

          {/* Submit Button */}
          <button
            className="w-full flex justify-center items-center py-3 px-4 rounded-lg bg-surface text-primary font-semibold text-sm neo-raised neo-interactive hover:brightness-105 active:brightness-95 transition-all duration-200 mt-8 cursor-pointer disabled:opacity-50"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-primary mr-2" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <span className="material-symbols-outlined ml-2 text-lg">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="mt-8 relative">
          <div aria-hidden="true" className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-surface-variant shadow-[0_1px_0_white]"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-surface text-on-surface-variant font-medium">or</span>
          </div>
        </div>

        {/* Google Sign Up */}
        <div className="mt-8">
          <button
            onClick={handleGoogleSignUp}
            className="w-full flex justify-center items-center py-3 px-4 rounded-lg bg-surface text-on-surface font-medium text-sm neo-raised neo-interactive hover:brightness-95 active:brightness-90 transition-all duration-200 cursor-pointer disabled:opacity-50"
            type="button"
            disabled={isLoading}
          >
            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
            <span>Sign up with Google</span>
          </button>
        </div>
      </div>

      {/* Footer Link */}
      <p className="mt-8 text-center text-sm text-on-surface-variant">
        Already have an account?{' '}
        <Link
          className="font-semibold text-primary hover:text-tertiary transition-colors duration-200 underline underline-offset-4"
          href="/auth/login"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
