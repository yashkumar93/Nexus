'use client';

import Navbar from '@/components/layout/Navbar';

/**
 * DashboardLayout – Layout wrapper for authenticated dashboard pages.
 * Renders the persistent navigation bar.
 */
export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="pt-16 min-h-screen">{children}</main>
    </div>
  );
}
