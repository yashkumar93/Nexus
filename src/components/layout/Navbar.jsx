'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useState, useRef, useEffect } from 'react';

/**
 * Get user initials from their name.
 * @param {string} name
 * @returns {string}
 */
function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Format role string for display.
 * @param {string} role
 * @returns {string}
 */
function formatRole(role) {
  switch (role) {
    case 'org_admin': return 'Admin';
    case 'member': return 'Member';
    case 'guest': return 'Guest';
    default: return role;
  }
}

/** @type {{ label: string, href: string, adminOnly?: boolean }[]} */
const NAV_LINKS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Explorer', href: '/explorer' },
  { label: 'Admin', href: '/admin', adminOnly: true },
];

/**
 * Navbar — Top navigation bar for authenticated pages.
 *
 * Fixed at top with glass morphism backdrop. Shows brand, nav links,
 * and user profile with logout.
 */
export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const visibleLinks = NAV_LINKS.filter(
    (link) => !link.adminOnly || user?.role === 'org_admin',
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* ── Brand ─────────────────────────────────────────────────── */}
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-strong text-accent-ink font-[family-name:var(--font-display)] text-sm font-bold transition-transform duration-200 group-hover:scale-105">
            C
          </div>
          <span className="font-[family-name:var(--font-display)] text-lg font-semibold text-text-1 tracking-tight hidden sm:block">
            Continuum
          </span>
        </Link>

        {/* ── Centre Nav Links ──────────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-1">
          {visibleLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== '/dashboard' && pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                  ${
                    isActive
                      ? 'text-accent'
                      : 'text-text-2 hover:text-text-1 hover:bg-surface-2'
                  }
                `}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-accent-strong animate-fade-in" />
                )}
              </Link>
            );
          })}
        </div>

        {/* ── Right: User Profile ───────────────────────────────────── */}
        <div className="flex items-center gap-3">
          {/* Mobile nav toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex md:hidden items-center justify-center w-9 h-9 rounded-lg text-text-2 hover:text-text-1 hover:bg-surface-2 transition-colors"
            aria-label="Toggle menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              {menuOpen ? (
                <>
                  <line x1="4" y1="4" x2="16" y2="16" />
                  <line x1="16" y1="4" x2="4" y2="16" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="17" y2="6" />
                  <line x1="3" y1="10" x2="17" y2="10" />
                  <line x1="3" y1="14" x2="17" y2="14" />
                </>
              )}
            </svg>
          </button>

          {/* User info */}
          <div className="hidden sm:flex items-center gap-3" ref={menuRef}>
            <div className="flex items-center gap-2.5">
              {/* Avatar */}
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-dim border border-accent-strong/30 text-accent text-xs font-semibold font-[family-name:var(--font-display)]">
                {getInitials(user?.name)}
              </div>

              {/* Name & role */}
              <div className="flex flex-col">
                <span className="text-sm font-medium text-text-1 leading-tight">
                  {user?.name || 'User'}
                </span>
                <span className="text-[11px] font-[family-name:var(--font-mono)] text-text-3 uppercase tracking-wider leading-tight">
                  {formatRole(user?.role)}
                </span>
              </div>
            </div>

            {/* Logout */}
            <button
              type="button"
              onClick={logout}
              className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-3 hover:text-danger hover:bg-danger/8 transition-all duration-200 border border-transparent hover:border-danger/20"
              title="Sign out"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span className="hidden lg:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ──────────────────────────────────────────── */}
      {menuOpen && (
        <div className="md:hidden glass-strong border-t border-border animate-slide-up">
          <div className="px-4 py-3 space-y-1">
            {visibleLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== '/dashboard' && pathname.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`
                    block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${isActive ? 'text-accent bg-accent-dim' : 'text-text-2 hover:text-text-1 hover:bg-surface-2'}
                  `}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Mobile user info + logout */}
            <div className="pt-3 mt-3 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-dim border border-accent-strong/30 text-accent text-xs font-semibold">
                  {getInitials(user?.name)}
                </div>
                <div>
                  <span className="text-sm font-medium text-text-1 block">{user?.name || 'User'}</span>
                  <span className="text-[11px] font-[family-name:var(--font-mono)] text-text-3 uppercase tracking-wider">{formatRole(user?.role)}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { logout(); setMenuOpen(false); }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-text-3 hover:text-danger hover:bg-danger/8 transition-all border border-transparent hover:border-danger/20"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
