'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/button';

/**
 * App-router error boundary for the public site. Catches an unhandled error
 * thrown while rendering a route inside the root layout and shows a recoverable
 * screen instead of a blank page — the header and footer still frame it.
 *
 * `reset()` re-renders the segment (retries the thing that failed), so a
 * transient error (a dropped fetch) can clear without a full reload. "Back to
 * home" is the escape hatch when it can't.
 *
 * A fatal error in the root layout ITSELF is not caught here — Next escalates
 * that to app/global-error.tsx, which renders its own document.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface it in the console/monitoring. The `digest` is Next's server-side
    // id for the error, the only handle you get in production where the message
    // is redacted from the client.
    console.error('[app error]', error);
  }, [error]);

  return (
    <div className="site-container page-y">
      <div className="mx-auto max-w-xl py-2xl text-center">
        <AlertTriangle
          className="mx-auto mb-md h-12 w-12 text-crest-red"
          aria-hidden="true"
        />
        <h1 className="font-heading text-4xl font-medium text-deep-blue">
          Something went wrong
        </h1>
        <p className="mx-auto mt-stack max-w-md text-lg leading-body-lg text-warm-gray-600">
          We hit an unexpected problem loading this page. You can try again, or
          head back home.
        </p>
        <div className="mt-block flex flex-col items-center justify-center gap-xs sm:flex-row">
          <Button onClick={reset}>Try again</Button>
          <ButtonLink href="/" variant="secondary">
            Back to home
          </ButtonLink>
        </div>
        {error.digest && (
          <p className="mt-md text-sm text-warm-gray-400">
            Reference: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
