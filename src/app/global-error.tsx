'use client';

import { useEffect } from 'react';

/**
 * Last-resort error boundary. Next renders this ONLY when the root layout
 * itself throws — at that point the normal layout (and its header/footer) does
 * not exist, so this component must supply its own <html> and <body>.
 *
 * Because it replaces the whole document, it can't assume the layout's font
 * variables are applied, and it deliberately keeps to a tiny, self-contained
 * markup with the brand colours inline so it renders even if something in the
 * styling pipeline is what failed. app/error.tsx handles the far more common
 * case of a single route failing inside a working layout; this is the rare
 * total-failure fallback.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[global error]', error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          minHeight: '100vh',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          backgroundColor: '#FFFFFF',
          color: '#3D362E',
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '32rem' }}>
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 500,
              color: '#1B3A4B',
              margin: '0 0 12px',
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              fontSize: '1.125rem',
              lineHeight: 1.6,
              color: '#5C5648',
              margin: '0 0 24px',
            }}
          >
            The site hit an unexpected problem. Please try again, or return to
            the homepage.
          </p>
          <div
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={reset}
              style={{
                minHeight: '48px',
                padding: '12px 24px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#1E7A3D',
                color: '#FFFFFF',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
            {/* Deliberately a plain <a>, not next/link: global-error renders
                when the root layout has crashed, so the router/layout context
                may be broken. A full-document navigation is the reliable escape
                hatch here — exactly the case where client-side routing can't be
                trusted. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                minHeight: '48px',
                display: 'inline-flex',
                alignItems: 'center',
                padding: '12px 24px',
                borderRadius: '6px',
                border: '2px solid #1E5AA8',
                color: '#1E5AA8',
                fontSize: '1rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Back to home
            </a>
          </div>
          {error.digest && (
            <p style={{ marginTop: '24px', fontSize: '0.875rem', color: '#736B62' }}>
              Reference: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
