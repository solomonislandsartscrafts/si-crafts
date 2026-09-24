import type { Metadata } from 'next';
import { Compass } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Page not found',
  description: 'The page you were looking for could not be found.',
};

/**
 * App-router 404. Rendered inside the root layout, so the header and footer
 * still frame it — this is page content only, not a whole document.
 *
 * Next serves this for any unmatched route and for any `notFound()` call (e.g. a
 * product/maker slug that doesn't exist). It gives the visitor a way forward
 * rather than a dead end: a primary route home and a secondary into the
 * catalogue, which is the most useful place to land on a craft site.
 */
export default function NotFound() {
  return (
    <div className="site-container page-y">
      <div className="mx-auto max-w-xl py-2xl text-center">
        <Compass
          className="mx-auto mb-md h-12 w-12 text-ocean"
          aria-hidden="true"
        />
        <p className="font-heading text-sm font-semibold uppercase tracking-widest text-ocean">
          404
        </p>
        <h1 className="mt-2xs font-heading text-4xl font-medium text-deep-blue">
          We can&apos;t find that page
        </h1>
        <p className="mx-auto mt-stack max-w-md text-lg leading-body-lg text-warm-gray-600">
          The page may have moved, or the link might be out of date. Let&apos;s
          get you back on track.
        </p>
        <div className="mt-block flex flex-col items-center justify-center gap-xs sm:flex-row">
          <ButtonLink href="/">Back to home</ButtonLink>
          <ButtonLink href="/catalogue" variant="secondary">
            Browse the catalogue
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
