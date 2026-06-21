'use client';

import Navbar from '@/components/layout/Navbar';

/**
 * ExplorerLayout – Layout wrapper for authenticated memory explorer pages.
 * Renders the persistent navigation bar.
 */
export default function ExplorerLayout({ children }) {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="pt-16 min-h-screen">{children}</main>
    </div>
  );
}
