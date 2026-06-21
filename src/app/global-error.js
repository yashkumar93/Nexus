'use client';

/**
 * Global error boundary for the Next.js app.
 * IMPORTANT: This component intentionally does NOT wrap AuthProvider or any
 * context provider, because it replaces the root layout when rendered.
 * It must be a self-contained client component with zero external dependencies.
 */
export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          background: '#0a0a0f',
          color: '#e2e8f0',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            padding: '2rem',
            maxWidth: '480px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              fontSize: '28px',
            }}
          >
            ⚠️
          </div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              marginBottom: '0.75rem',
              color: '#f1f5f9',
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              fontSize: '0.9rem',
              color: '#94a3b8',
              marginBottom: '2rem',
              lineHeight: 1.6,
            }}
          >
            {error?.message || 'An unexpected error occurred. Please try again.'}
          </p>
          <button
            onClick={reset}
            style={{
              padding: '0.6rem 1.5rem',
              borderRadius: '8px',
              background: 'rgba(139, 92, 246, 0.2)',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              color: '#c4b5fd',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
